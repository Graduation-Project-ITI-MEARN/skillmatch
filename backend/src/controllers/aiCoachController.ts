// src/controllers/aiCoachController.ts
import { Request, Response } from "express";
import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import User from "../models/User";
import { catchError } from "../utils/catchAsync";
import { GoogleGenerativeAI } from "@google/generative-ai";
import APIError from "../utils/APIError";
import OpenAI from "openai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
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
      console.log(genAI);

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

      // Generate AI career insights
      // const model = genAI.getGenerativeModel({
      //    model: "gemini-2.0-flash",
      //    generationConfig: {
      //       temperature: 0.7,
      //       maxOutputTokens: 1500,
      //    },
      // });

      const model = openAi.chat.completions.create({
         model: "gpt-3.5-turbo",
         messages: [
            {
               role: "user",
               content: `You are an AI Career Coach for SkillMatch AI platform.

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

            `,
            },
         ],
         temperature: 0.7,
         max_tokens: 1500,
      });

      //       const prompt = `You are an AI Career Coach for SkillMatch AI platform.

      // **Candidate Profile:**
      // - Total Submissions: ${submissions.length}
      // - Average Score: ${averageScore}/100
      // - Strong Skills: ${strongSkills.join(", ") || "Building foundation"}
      // - Skills Needing Improvement: ${weakSkills.join(", ") || "None identified yet"}
      // - Recent Challenges: ${submissions
      //          .slice(0, 3)
      //          .map((s: any) => s.challengeId.title)
      //          .join(", ")}

      // **Your Task:**
      // Provide a comprehensive career development plan in JSON format:

      // {
      //   "careerLevel": "junior|mid|senior",
      //   "readinessScore": 0-100,
      //   "nextSteps": ["step 1", "step 2", "step 3"],
      //   "careerPaths": [
      //     {
      //       "title": "e.g., Backend Developer",
      //       "match": 0-100,
      //       "reasoning": "why this fits"
      //     }
      //   ],
      //   "monthlyGoal": "specific achievable goal",
      //   "estimatedTimeToJobReady": "e.g., 2-3 months"
      // }

      // Be honest, encouraging, and actionable.`;

      const result = await model;
      const responseText = result.choices[0].message.content;

      let careerInsights;
      try {
         const cleaned = responseText;
         // .replace(/```json\n?/g, "")
         // .replace(/```\n?/g, "")
         // .trim();
         // const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
         careerInsights = JSON.parse(cleaned || "{}");
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

      const userContext = `
**Candidate Profile:**
- Name: ${user?.name || "User"}
- Total Submissions: ${submissions.length}
- Average Score: ${averageScore}/100
- Recent Challenges: ${
         submissions.map((s: any) => s.challengeId.title).join(", ") ||
         "None yet"
      }

**Conversation History:**
${
   conversationHistory
      ?.slice(-4)
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n") || "No previous messages"
}

**Current Message:**
User: ${message}

**Instructions:**
You are a professional AI Career Coach for SkillMatch AI. 
- Help with career development, skill improvement, and job readiness
- Be encouraging but realistic
- Provide actionable advice
- DO NOT discuss personal matters, relationships, or off-topic subjects
- Keep responses concise (2-3 paragraphs)

Respond naturally and helpfully.`;

      const model = genAI.getGenerativeModel({
         model: "gemini-2.0-flash",
         generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
         },
      });

      const result = await model.generateContent(userContext);
      const reply = result.response.text();

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

      const companyContext = `
**Company Profile:**
- Active Challenges: ${companyChallenges.length}
- Total Submissions Received: ${submissions.length}
- Average Candidate Score: ${avgCandidateScore}/100
- Challenge Categories: ${
         [...new Set(companyChallenges.map((c) => c.category))].join(", ") ||
         "None yet"
      }

**Conversation History:**
${
   conversationHistory
      ?.slice(-4)
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n") || "No previous messages"
}

**Company Message:**
${message}

**Instructions:**
You are an AI Hiring Assistant for SkillMatch AI, helping companies:
1. Identify hiring needs and create challenges
2. Suggest challenge ideas based on job requirements
3. Analyze candidate pool quality
4. Recommend evaluation strategies

If the company asks you to create a challenge, suggest:
- Title
- Description
- Difficulty
- Category
- Tags (skills)
- Requirements
- Evaluation criteria
- Ideal solution outline

Be professional, insightful, and action-oriented.`;

      const model = genAI.getGenerativeModel({
         model: "gemini-1.5-flash",
         generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
         },
      });

      const result = await model.generateContent(companyContext);
      const reply = result.response.text();

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

      const model = genAI.getGenerativeModel({
         model: "gemini-1.5-flash",
         generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
         },
      });

      const prompt = `You are an expert Challenge Designer for SkillMatch AI.

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

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      let challengeData;
      try {
         const cleaned = responseText
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
         const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
         challengeData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (error) {
         throw new APIError(
            500,
            "Failed to generate challenge. Please try again."
         );
      }

      if (!challengeData) {
         throw new APIError(500, "Failed to parse generated challenge.");
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
      const model = genAI.getGenerativeModel({
         model: "gemini-1.5-flash",
         generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 100,
         },
      });

      const prompt = `Is this message related to career development, skills, job search, or professional growth?

Message: "${message}"

Respond with ONLY: YES or NO`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim().toUpperCase();

      return response.includes("YES");
   } catch (error) {
      console.error("Moderation error:", error);
      return true; // Allow if moderation fails
   }
}

/**
 * Generate learning resources based on skills
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
            url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
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
            url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
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
            url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
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
            url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
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
