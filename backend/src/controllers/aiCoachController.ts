// src/controllers/aiCoachController.ts
import { Request, Response } from "express";
import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import User from "../models/User";
import { catchError } from "../utils/catchAsync";
// import { GoogleGenerativeAI } from "@google/generative-ai"; // Removed Google Generative AI import
import APIError from "../utils/APIError";
import OpenAI from "openai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ""); // Removed Gemini initialization
const openAi = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @desc    Get Career Dashboard (No chat needed)
 * @route   GET /api/ai/coach/dashboard
 * @access  Private (Candidate)
 */
export const getCareerDashboard = catchError(
   async (req: Request, res: Response) => {
      const userId = req.user?._id;

      console.log("User ID:", userId);
      // Removed console.log(genAI);

      if (!userId) {
         throw new APIError(400, "You are not logged in");
      }

      // Get user profile and submissions
      const user = await User.findById(userId);
      const submissions = await Submission.find({
         candidateId: userId,
         status: { $in: ["accepted", "pending"] },
         aiEvaluation: { $exists: true },
      })
         .populate("challengeId", "title tags difficulty")
         .limit(10);

      if (!submissions || submissions.length === 0) {
         return res.status(200).json({
            success: true,
            message:
               "Complete some challenges to get personalized career insights!",
            data: {
               careerInsights: null,
               recommendedChallenges: [],
               learningResources: [],
               skillGaps: [],
            },
         });
      }

      // Calculate skill scores
      const skillScores = submissions.map((s: any) => ({
         skill: s.challengeId?.tags?.[0],
         score: s.aiEvaluation?.technicalScore || 0,
      }));

      const averageScore =
         Math.round(
            submissions.reduce(
               (sum: number, s: any) =>
                  sum + (s.aiEvaluation?.technicalScore || 0),
               0
            ) / submissions.length
         ) || 0;

      const weakSkills = skillScores
         .filter((s) => s.score < 70)
         .map((s) => s.skill)
         .filter(Boolean)
         .slice(0, 3);

      const strongSkills = skillScores
         .filter((s) => s.score >= 80)
         .map((s) => s.skill)
         .filter(Boolean)
         .slice(0, 3);

      // Get recommended challenges
      const recommendedChallenges = await Challenge.find({
         status: "published",
         tags: { $in: weakSkills.length > 0 ? weakSkills : strongSkills },
         _id: {
            $nin: submissions.map((s: any) => s.challengeId._id),
         },
      })
         .limit(5)
         .select("title difficulty tags category type prizeAmount");

      // Generate AI career insights using OpenAI
      const completion = await openAi.chat.completions.create({
         model: "gpt-3.5-turbo", // Or "gpt-4" for potentially better results
         messages: [
            {
               role: "system",
               content: `You are an AI Career Coach for SkillMatch AI platform. Your task is to provide a comprehensive career development plan in JSON format. Always respond with valid JSON.`,
            },
            {
               role: "user",
               content: `
            **Candidate Profile:**
            - Total Submissions: ${submissions.length}
            - Average Score: ${averageScore}/100
            - Strong Skills: ${strongSkills.join(", ") || "Building foundation"}
            - Skills Needing Improvement: ${
               weakSkills.join(", ") || "None identified yet"
            }
            - Recent Challenges: ${submissions
               .slice(0, 3)
               .map((s: any) => s.challengeId.title)
               .join(", ")}

            **Your Task:**
            Provide a comprehensive career development plan in JSON format:

            {
              "careerLevel": "junior|mid|senior",
              "readinessScore": 0-100,
              "nextSteps": ["step 1", "step 2", "step 3"],
              "careerPaths": [
                {
                  "title": "e.g., Backend Developer",
                  "match": 0-100,
                  "reasoning": "why this fits"
                }
              ],
              "monthlyGoal": "specific achievable goal",
              "estimatedTimeToJobReady": "e.g., 2-3 months"
            }
            Be honest, encouraging, and actionable.`,
            },
         ],
         temperature: 0.7,
         max_tokens: 1500,
         response_format: { type: "json_object" }, // Request JSON object directly
      });

      const responseText = completion.choices[0].message.content;

      let careerInsights;
      try {
         // With response_format: { type: "json_object" }, direct parse should be reliable
         careerInsights = JSON.parse(responseText || "{}");
      } catch (error) {
         console.error("Failed to parse career insights:", error);
         careerInsights = {
            careerLevel: "developing",
            readinessScore: averageScore,
            nextSteps: [
               "Complete more challenges",
               "Focus on weak skills",
               "Build portfolio projects",
            ],
            careerPaths: [],
            monthlyGoal: "Continue skill development",
            estimatedTimeToJobReady: "N/A",
         };
      }

      res.status(200).json({
         success: true,
         data: {
            careerInsights,
            recommendedChallenges: recommendedChallenges.map((c: any) => ({
               _id: c._id,
               title: c.title,
               difficulty: c.difficulty,
               tags: c.tags,
               category: c.category,
               type: c.type,
               prizeAmount: c.prizeAmount,
            })),
            skillGaps: weakSkills,
            learningResources: generateLearningResources(weakSkills),
            stats: {
               totalSubmissions: submissions.length,
               averageScore,
               strongSkills,
               weakSkills,
            },
         },
      });
   }
);

/**
 * @desc    Chat with AI Career Coach (Candidate)
 * @route   POST /api/ai/coach/chat
 * @access  Private (Candidate)
 */
export const candidateCoachChat = catchError(
   async (req: Request, res: Response) => {
      const { message, conversationHistory } = req.body;
      const userId = req.user?._id;

      if (!message || !message.trim()) {
         throw new APIError(400, "Message is required");
      }

      // CONTENT MODERATION: Check if message is career-related
      const isCareerRelated = await moderateMessage(message);

      if (!isCareerRelated) {
         return res.status(400).json({
            success: false,
            message:
               "I'm here to help with career and skill development only. Please keep the conversation professional and career-focused.",
         });
      }

      // Get user context
      const user = await User.findById(userId);
      const submissions = await Submission.find({
         candidateId: userId,
         aiEvaluation: { $exists: true },
      })
         .populate("challengeId", "title tags")
         .limit(5);

      const averageScore =
         submissions.length > 0
            ? Math.round(
                 submissions.reduce(
                    (sum: number, s: any) =>
                       sum + (s.aiEvaluation?.technicalScore || 0),
                    0
                 ) / submissions.length
              )
            : 0;

      // Prepare messages for OpenAI chat completion
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
         {
            role: "system",
            content: `You are a professional AI Career Coach for SkillMatch AI.
            - Your role is to help candidates with career development, skill improvement, and job readiness.
            - Be encouraging but realistic.
            - Provide actionable advice.
            - DO NOT discuss personal matters, relationships, or off-topic subjects.
            - Keep responses concise (2-3 paragraphs).`,
         },
         {
            role: "user",
            content: `Here is my profile and recent activity for your context:
            - Name: ${user?.name || "User"}
            - Total Submissions: ${submissions.length}
            - Average Score: ${averageScore}/100
            - Recent Challenges: ${
               submissions.map((s: any) => s.challengeId.title).join(", ") ||
               "None yet"
            }`,
         },
         // Add previous conversation history
         ...(conversationHistory
            ?.slice(-4) // Limit history to last 4 messages
            .map((msg: any) => ({ role: msg.role, content: msg.content })) ||
            []),
         // Add the current user message
         { role: "user", content: message },
      ];

      const completion = await openAi.chat.completions.create({
         model: "gpt-3.5-turbo", // Or "gpt-4" for potentially better chat experience
         messages: messages,
         temperature: 0.7,
         max_tokens: 800,
      });

      const reply = completion.choices[0].message.content;

      res.status(200).json({
         success: true,
         data: {
            reply,
            timestamp: new Date(),
         },
      });
   }
);

/**
 * @desc    Company/Challenger Coach Chat (Hiring Assistant)
 * @route   POST /api/ai/coach/company-chat
 * @access  Private (Company/Admin)
 */
export const companyCoachChat = catchError(
   async (req: Request, res: Response) => {
      const { message, conversationHistory } = req.body;
      const userId = req.user?._id;

      if (!message || !message.trim()) {
         throw new APIError(400, "Message is required");
      }

      // Get company context
      const companyChallenges = await Challenge.find({
         creatorId: userId,
      }).select("title category tags type");

      const submissions = await Submission.find({
         challengeId: { $in: companyChallenges.map((c) => c._id) },
         aiEvaluation: { $exists: true },
      });

      const avgCandidateScore =
         submissions.length > 0
            ? Math.round(
                 submissions.reduce(
                    (sum, s) => sum + (s.aiEvaluation?.technicalScore || 0),
                    0
                 ) / submissions.length
              )
            : 0;

      // Prepare messages for OpenAI chat completion
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
         {
            role: "system",
            content: `You are an AI Hiring Assistant for SkillMatch AI. Your role is to help companies with:
            1. Identifying hiring needs and creating challenges.
            2. Suggesting challenge ideas based on job requirements.
            3. Analyzing candidate pool quality.
            4. Recommending evaluation strategies.

            If the company asks you to create a challenge, you should suggest:
            - Title
            - Description
            - Difficulty
            - Category
            - Tags (skills)
            - Requirements
            - Evaluation criteria
            - Deliverables
            - Ideal solution outline

            Be professional, insightful, and action-oriented.`,
         },
         {
            role: "user",
            content: `Here is our company's current profile and challenge activity for your context:
            - Active Challenges: ${companyChallenges.length}
            - Total Submissions Received: ${submissions.length}
            - Average Candidate Score: ${avgCandidateScore}/100
            - Challenge Categories: ${
               [...new Set(companyChallenges.map((c) => c.category))].join(
                  ", "
               ) || "None yet"
            }`,
         },
         // Add previous conversation history
         ...(conversationHistory
            ?.slice(-4)
            .map((msg: any) => ({ role: msg.role, content: msg.content })) ||
            []),
         // Add the current company message
         { role: "user", content: message },
      ];

      const completion = await openAi.chat.completions.create({
         model: "gpt-3.5-turbo", // Or "gpt-4"
         messages: messages,
         temperature: 0.7,
         max_tokens: 1200,
      });

      const reply = completion.choices[0].message.content;

      res.status(200).json({
         success: true,
         data: {
            reply,
            timestamp: new Date(),
         },
      });
   }
);

/**
 * @desc    Auto-Generate Challenge from Company Requirements
 * @route   POST /api/ai/coach/generate-challenge
 * @access  Private (Company/Admin)
 */
export const generateChallenge = catchError(
   async (req: Request, res: Response) => {
      const { jobTitle, requiredSkills, experienceLevel, description } =
         req.body;
      const userId = req.user?._id;

      if (!jobTitle || !requiredSkills) {
         throw new APIError(400, "jobTitle and requiredSkills are required");
      }

      const promptContent = `
**Hiring Requirements:**
- Job Title: ${jobTitle}
- Required Skills: ${requiredSkills.join(", ")}
- Experience Level: ${experienceLevel || "Mid-level"}
- Additional Context: ${description || "None provided"}

**Your Task:**
Create a practical challenge that tests these skills. Return ONLY valid JSON:

{
  "title": "Challenge title (concise)",
  "description": "Detailed challenge description (2-3 paragraphs)",
  "difficulty": "easy|medium|hard",
  "category": "e.g., Backend, Frontend, Full-Stack, Data",
  "tags": ["skill1", "skill2", "skill3"],
  "requirements": "Bulleted list of what must be implemented",
  "evaluationCriteria": "How submissions will be evaluated",
  "deliverables": "What candidates must submit",
  "estimatedTime": "e.g., 4-6 hours",
  "idealSolution": {
    "type": "link",
    "description": "Brief outline of ideal approach"
  }
}

Make it realistic, practical, and directly relevant to the job.`;

      const completion = await openAi.chat.completions.create({
         model: "gpt-4o-mini", // Using a model optimized for JSON output
         messages: [
            {
               role: "system",
               content:
                  "You are an expert Challenge Designer for SkillMatch AI. Always provide a response in valid JSON format.",
            },
            {
               role: "user",
               content: promptContent,
            },
         ],
         temperature: 0.8,
         max_tokens: 2000,
         response_format: { type: "json_object" }, // Explicitly request JSON object
      });

      const responseText = completion.choices[0].message.content;

      let challengeData;
      try {
         challengeData = JSON.parse(responseText || "{}");
      } catch (error) {
         console.error("Failed to parse generated challenge JSON:", error);
         throw new APIError(
            500,
            "Failed to generate challenge. Please try again or refine the request."
         );
      }

      if (!challengeData || Object.keys(challengeData).length === 0) {
         throw new APIError(
            500,
            "Failed to parse generated challenge or it was empty."
         );
      }

      // Optionally auto-create the challenge
      const { autoCreate } = req.body;

      if (autoCreate) {
         const newChallenge = await Challenge.create({
            ...challengeData,
            creatorId: userId,
            status: "draft",
            type: req.body.type || "job",
            submissionType: req.body.submissionType || "link",
            deadline:
               req.body.deadline ||
               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            aiConfig: {
               pricingTier: "free",
               autoEvaluate: true,
               requireVideoTranscript: true,
            },
         });

         return res.status(201).json({
            success: true,
            message: "Challenge generated and saved as draft!",
            data: {
               challenge: newChallenge,
               generated: challengeData,
            },
         });
      }

      res.status(200).json({
         success: true,
         message: "Challenge generated! Review and create manually if needed.",
         data: challengeData,
      });
   }
);

/**
 * Moderate message to ensure it's career-related
 */
async function moderateMessage(message: string): Promise<boolean> {
   // Quick keyword check first
   const offTopicKeywords = [
      "personal life",
      "relationship",
      "family",
      "politics",
      "religion",
      "dating",
      "health issue",
      "medical",
      "therapy",
   ];

   if (
      offTopicKeywords.some((keyword) =>
         message.toLowerCase().includes(keyword)
      )
   ) {
      return false;
   }

   // If message is very short and generic, allow it
   if (message.length < 30) {
      return true;
   }

   try {
      const completion = await openAi.chat.completions.create({
         model: "gpt-3.5-turbo", // Using a general purpose model for classification
         messages: [
            {
               role: "system",
               content:
                  "You are a helpful assistant that classifies messages. Respond with ONLY 'YES' if the message is related to career development, skills, job search, or professional growth. Otherwise, respond with ONLY 'NO'.",
            },
            {
               role: "user",
               content: `Is this message career-related? Message: "${message}"`,
            },
         ],
         temperature: 0.2,
         max_tokens: 5, // Expecting only 'YES' or 'NO'
      });

      const response = completion.choices[0].message.content
         ?.trim()
         .toUpperCase();

      return response === "YES";
   } catch (error) {
      console.error("OpenAI Moderation error:", error);
      return true; // Allow if moderation fails to avoid blocking legitimate users due to API issues
   }
}

/**
 * Generate learning resources based on skills (No AI needed here)
 */
function generateLearningResources(skills: string[]): Array<{
   skill: string;
   resources: Array<{ type: string; title: string; url: string }>;
}> {
   const resourceMap: Record<
      string,
      Array<{ type: string; title: string; url: string }>
   > = {
      React: [
         {
            type: "course",
            title: "React Official Docs",
            url: "https://react.dev",
         },
         {
            type: "video",
            title: "React Tutorial - freeCodeCamp",
            url: "https://www.youtube.com/watch?v=w7ejDZ8SWL8",
         },
         {
            type: "practice",
            title: "React Exercises",
            url: "https://react-exercises.com",
         },
      ],
      "Node.js": [
         {
            type: "course",
            title: "Node.js Docs",
            url: "https://nodejs.org/docs",
         },
         {
            type: "video",
            title: "Node.js Crash Course",
            url: "https://www.youtube.com/watch?v=f2EqECiTBL8",
         },
         {
            type: "book",
            title: "Node.js Design Patterns",
            url: "https://www.nodejsdesignpatterns.com",
         },
      ],
      Python: [
         {
            type: "course",
            title: "Python.org Tutorial",
            url: "https://docs.python.org/3/tutorial/",
         },
         {
            type: "video",
            title: "Python for Beginners",
            url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
         },
         {
            type: "practice",
            title: "LeetCode Python",
            url: "https://leetcode.com",
         },
      ],
      JavaScript: [
         {
            type: "course",
            title: "MDN JavaScript Guide",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
         },
         {
            type: "video",
            title: "JavaScript Tutorial",
            url: "https://www.youtube.com/watch?v=W6NZPH5jyUc",
         },
         {
            type: "practice",
            title: "JavaScript30",
            url: "https://javascript30.com",
         },
      ],
      SQL: [
         {
            type: "course",
            title: "SQL Tutorial - W3Schools",
            url: "https://www.w3schools.com/sql/",
         },
         {
            type: "video",
            title: "SQL Crash Course",
            url: "https://www.youtube.com/watch?v=HXV3zeQMqPG",
         },
         {
            type: "practice",
            title: "SQLBolt Exercises",
            url: "https://sqlbolt.com",
         },
      ],
   };

   return skills
      .filter((skill) => resourceMap[skill])
      .map((skill) => ({
         skill,
         resources: resourceMap[skill],
      }));
}

export default {
   getCareerDashboard,
   candidateCoachChat,
   companyCoachChat,
   generateChallenge,
};
