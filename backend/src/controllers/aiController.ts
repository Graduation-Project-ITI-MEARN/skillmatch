// src/controllers/aiController.ts
import { Request, Response } from "express";
import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import User from "../models/User";
import { catchError } from "../utils/catchAsync";
import {
   evaluateWithModel,
   getModelForChallenge,
   estimateEvaluationCost,
} from "../services/AIService";
import { transcribeVideo } from "../services/videoTranscription";
import {
   AI_MODELS,
   AIModel,
   PRICING_TIERS,
   PricingTier,
} from "../types/AIModels";

// ==========================================
// NEW: Multi-Model Evaluation Routes
// ==========================================

/**
 * @desc    Get Available AI Models and Pricing
 * @route   GET /api/ai/models
 * @access  Private
 */
export const getAvailableModels = catchError(
   async (req: Request, res: Response) => {
      const models = Object.values(AI_MODELS).map((model) => ({
         id: model.id,
         name: model.name,
         provider: model.provider,
         costPer1kTokens: model.costPer1kTokens,
         accuracyRating: model.accuracyRating,
         speed: model.speed,
         bestFor: model.bestFor,
         description: model.description,
         isFree: model.isFree,
         freeTierLimit: model.freeTierLimit,
         estimatedCostPerEval: model.isFree
            ? 0
            : (700 / 1000) * model.costPer1kTokens,
      }));

      const tiers = Object.values(PRICING_TIERS).map((tier) => ({
         tier: tier.tier,
         defaultModel: tier.defaultModel,
         estimatedCostPerEval: tier.estimatedCostPerEval,
         description: tier.description,
         modelDetails: AI_MODELS[tier.defaultModel],
      }));

      res.status(200).json({
         success: true,
         data: {
            models,
            pricingTiers: tiers,
            recommendation:
               "Start with 'free' tier using Gemini Flash + Groq Llama",
         },
      });
   }
);

/**
 * @desc    Evaluate Submission with Selected AI Model
 * @route   POST /api/ai/evaluate-submission
 * @access  Private
 */
export const evaluateSubmission = catchError(
   async (req: Request, res: Response) => {
      const { submissionId } = req.body;

      if (!submissionId) {
         return res.status(400).json({
            success: false,
            message: "submissionId is required",
         });
      }

      const submission = await Submission.findById(submissionId).populate(
         "challengeId"
      );

      if (!submission) {
         return res.status(404).json({
            success: false,
            message: "Submission not found",
         });
      }

      const challenge = submission.challengeId as any;

      // Determine which AI model to use
      const selectedModel = getModelForChallenge(
         challenge.aiConfig?.pricingTier || "free",
         challenge.aiConfig?.selectedModel
      );

      console.log(
         `Using AI Model: ${selectedModel} for challenge: ${challenge.title}`
      );

      // --- COMMENT OUT OR REMOVE THIS ENTIRE VIDEO TRANSCRIPTION BLOCK ---
      let videoTranscript = ""; // Initialize as empty string
      if (
         challenge.aiConfig?.requireVideoTranscript &&
         submission.videoExplanationUrl
      ) {
         try {
            console.log("Transcribing video...");
            const transcription = await transcribeVideo(
               submission.videoExplanationUrl
            );
            videoTranscript = transcription.text;
            console.log("Transcription completed!");
         } catch (error) {
            console.error("Video transcription failed:", error);
            // Continue without video transcript
         }
      }
      // --- END VIDEO TRANSCRIPTION BLOCK ---

      // Prepare submission content
      let submissionContent = "";
      if (submission.linkUrl) {
         submissionContent = `Link: ${submission.linkUrl}`;
      } else if (submission.textContent) {
         submissionContent = submission.textContent;
      } else if (submission.fileUrls && submission.fileUrls.length > 0) {
         submissionContent = `Files: ${submission.fileUrls.join(", ")}`;
      }

      // Evaluate with selected model
      const evaluationResult = await evaluateWithModel({
         challengeTitle: challenge.title,
         challengeDescription: challenge.description,
         difficulty: challenge.difficulty,
         category: challenge.category,
         tags: challenge.tags || [],
         submissionContent,
         // videoTranscript, // This line is also commented out in the EvaluationRequest interface now
         selectedModel,
      });

      // Update submission
      submission.aiScore = evaluationResult.overallScore;
      submission.status = "pending";
      submission.aiEvaluation = {
         technicalScore: evaluationResult.technicalScore,
         clarityScore: evaluationResult.clarityScore,
         communicationScore: evaluationResult.communicationScore,
         feedback: evaluationResult.feedback,
         strengths: evaluationResult.strengths,
         improvements: evaluationResult.improvements,
         modelUsed: evaluationResult.modelUsed,
         evaluatedAt: new Date(),
         videoTranscribed: videoTranscript !== "",
      };
      await submission.save();

      res.status(200).json({
         success: true,
         data: {
            submissionId: submission._id,
            scores: {
               technical: evaluationResult.technicalScore,
               clarity: evaluationResult.clarityScore,
               communication: evaluationResult.communicationScore,
               overall: evaluationResult.overallScore,
            },
            feedback: evaluationResult.feedback,
            strengths: evaluationResult.strengths,
            improvements: evaluationResult.improvements,
            evaluation: {
               modelUsed: evaluationResult.modelUsed,
               modelName: AI_MODELS[evaluationResult.modelUsed].name,
               costIncurred: evaluationResult.costIncurred,
            },
         },
      });
   }
);

/**
 * @desc    Get Cost Estimate for Challenge
 * @route   POST /api/ai/estimate-cost
 * @access  Private (Company)
 */
export const getEvaluationCostEstimate = catchError(
   async (req: Request, res: Response) => {
      const { pricingTier, customModel, expectedSubmissions } = req.body;

      if (!pricingTier) {
         return res.status(400).json({
            success: false,
            message:
               "pricingTier is required (free, budget, balanced, premium)",
         });
      }

      const costPerEval = estimateEvaluationCost(
         pricingTier as string,
         customModel as AIModel
      );

      const totalCost = costPerEval * (expectedSubmissions || 1);

      const model = getModelForChallenge(
         pricingTier as string,
         customModel as AIModel
      );

      res.status(200).json({
         success: true,
         data: {
            pricingTier,
            selectedModel: model,
            modelDetails: AI_MODELS[model],
            costPerEvaluation: costPerEval,
            expectedSubmissions: expectedSubmissions || 1,
            estimatedTotalCost: parseFloat(totalCost.toFixed(2)),
            isFree: AI_MODELS[model].isFree,
         },
      });
   }
);

/**
 * @desc    Batch Evaluate Multiple Submissions
 * @route   POST /api/ai/batch-evaluate
 * @access  Private (Company)
 */
export const batchEvaluateSubmissions = catchError(
   async (req: Request, res: Response) => {
      const { challengeId } = req.body;

      if (!challengeId) {
         return res.status(400).json({
            success: false,
            message: "challengeId is required",
         });
      }

      const challenge = await Challenge.findById(challengeId);
      if (!challenge) {
         return res.status(404).json({
            success: false,
            message: "Challenge not found",
         });
      }

      const submissions = await Submission.find({
         challengeId,
         status: "pending",
      });

      if (submissions.length === 0) {
         return res.status(404).json({
            success: false,
            message: "No submissions to evaluate",
         });
      }

      const results = [];
      let totalCost = 0;

      for (const submission of submissions) {
         try {
            const selectedModel = getModelForChallenge(
               challenge.aiConfig?.pricingTier || "free",
               challenge.aiConfig?.selectedModel
            );

            let submissionContent = "";
            if (submission.linkUrl) {
               submissionContent = `Link: ${submission.linkUrl}`;
            } else if (submission.textContent) {
               submissionContent = submission.textContent;
            }

            const evaluationResult = await evaluateWithModel({
               challengeTitle: challenge.title,
               challengeDescription: challenge.description,
               difficulty: challenge.difficulty,
               category: challenge.category,
               tags: challenge.tags || [],
               submissionContent,
               selectedModel,
            });

            submission.aiScore = evaluationResult.overallScore;
            submission.status = "pending";
            await submission.save();

            totalCost += evaluationResult.costIncurred;

            results.push({
               submissionId: submission._id,
               candidateId: submission.candidateId,
               score: evaluationResult.overallScore,
               modelUsed: evaluationResult.modelUsed,
               cost: evaluationResult.costIncurred,
            });
         } catch (error) {
            console.error(
               `Failed to evaluate submission ${submission._id}:`,
               error
            );
         }
      }

      // Sort by score and mark winner
      results.sort((a, b) => b.score - a.score);
      if (results.length > 0 && challenge.type === "prize") {
         await Submission.findByIdAndUpdate(results[0].submissionId, {
            isWinner: true,
            status: "accepted",
         });
      }

      res.status(200).json({
         success: true,
         data: {
            evaluatedCount: results.length,
            totalCost: parseFloat(totalCost.toFixed(4)),
            results: results.map((r, index) => ({
               ...r,
               rank: index + 1,
               isWinner: index === 0 && challenge.type === "prize",
            })),
         },
      });
   }
);

/**
 * @desc    Compare Models Performance
 * @route   POST /api/ai/compare-models
 * @access  Private (Admin only)
 */
export const compareModels = catchError(async (req: Request, res: Response) => {
   const { submissionId, modelsToTest } = req.body;

   if (!submissionId || !modelsToTest || !Array.isArray(modelsToTest)) {
      return res.status(400).json({
         success: false,
         message: "submissionId and modelsToTest array are required",
      });
   }

   const submission = await Submission.findById(submissionId).populate(
      "challengeId"
   );

   if (!submission) {
      return res.status(404).json({
         success: false,
         message: "Submission not found",
      });
   }

   const challenge = submission.challengeId as any;
   const comparisons = [];

   let submissionContent = submission.linkUrl || submission.textContent || "";

   for (const modelId of modelsToTest) {
      try {
         const result = await evaluateWithModel({
            challengeTitle: challenge.title,
            challengeDescription: challenge.description,
            difficulty: challenge.difficulty,
            category: challenge.category,
            tags: challenge.tags || [],
            submissionContent,
            selectedModel: modelId as AIModel,
         });

         comparisons.push({
            model: modelId,
            modelName: AI_MODELS[modelId as AIModel].name,
            scores: {
               technical: result.technicalScore,
               clarity: result.clarityScore,
               communication: result.communicationScore,
               overall: result.overallScore,
            },
            cost: result.costIncurred,
            feedback: result.feedback,
         });
      } catch (error) {
         console.error(`Model ${modelId} failed:`, error);
      }
   }

   res.status(200).json({
      success: true,
      data: {
         submissionId,
         comparisons,
      },
   });
});

// ==========================================
// LEGACY: Keep existing AI features
// ==========================================

/**
 * @desc    AI Career Coach Chat
 * @route   POST /api/ai/coach/chat
 * @access  Private
 */
// export const aiCoachChat = catchError(async (req: Request, res: Response) => {
//    const { message } = req.body;
//    const userId = req.user?._id;

//    if (!message) {
//       return res.status(400).json({
//          success: false,
//          message: "Message is required",
//       });
//    }

//    const user = await User.findById(userId);
//    const submissions = await Submission.find({
//       candidateId: userId,
//       status: "accepted",
//    })
//       .populate("challengeId")
//       .limit(5);

//    const userContext = `
// User Skills: ${user?.skills?.join(", ") || "Not specified"}
// Recent Challenges: ${submissions
//       .map((s: any) => s.challengeId.title)
//       .join(", ")}
// Average Score: ${
//       submissions.length > 0
//          ? Math.round(
//               submissions.reduce((sum: number, s: any) => sum + s.aiScore, 0) /
//                  submissions.length
//            )
//          : "No data"
//    }
//   `;

//    // Use free Gemini model for career coach
//    const { GoogleGenerativeAI } = require("@google/generative-ai");
//    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//    const prompt = `You are an AI Career Coach for SkillMatch AI platform. Help this candidate improve their skills.

// **Candidate Context:**
// ${userContext}

// **Candidate's Question:**
// ${message}

// Provide helpful, actionable advice. Be encouraging but realistic.`;

//    const result = await model.generateContent(prompt);
//    const reply = result.response.text();

//    res.status(200).json({
//       success: true,
//       data: { reply },
//    });
// });

/**
 * @desc    Get Challenge Recommendations
 * @route   GET /api/ai/recommendations
 * @access  Private (Candidate)
 */
export const getRecommendations = catchError(
   async (req: Request, res: Response) => {
      const userId = req.user?._id;
      const user = await User.findById(userId);

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const userSkills = user.skills || [];

      const completedSubmissions = await Submission.find({
         candidateId: userId,
         status: "accepted",
      }).select("challengeId");

      if (!completedSubmissions || completedSubmissions.length === 0) {
         return res.status(200).json({
            message: "No data yet, complete challenges to get recommendations",
            recommendations: [],
         });
      }

      const completedChallengeIds = completedSubmissions.map(
         (s: any) => s.challengeId
      );

      const challenges = await Challenge.find({
         _id: { $nin: completedChallengeIds },
         status: "published",
         tags: { $in: userSkills },
      })
         .limit(10)
         .lean();

      const recommended = challenges.map((challenge: any) => {
         const matchingTags = challenge.tags.filter((tag: string) =>
            userSkills.includes(tag)
         );

         let matchRatio = matchingTags.length / (challenge.tags.length || 1);
         if (matchRatio > 1) matchRatio = 1;

         const matchPercentage = Math.round(matchRatio * 100);

         return {
            _id: challenge._id,
            title: challenge.title,
            difficulty: challenge.difficulty,
            tags: challenge.tags,
            matchPercentage: matchPercentage < 40 ? 40 : matchPercentage,
            reason: `Matches your skills in ${matchingTags.join(", ")}`,
         };
      });

      recommended.sort((a, b) => b.matchPercentage - a.matchPercentage);

      res.status(200).json({
         success: true,
         data: recommended,
      });
   }
);

/**
 * @desc    Get Skill Gap Analysis
 * @route   GET /api/ai/skills-analysis
 * @access  Private (Candidate)
 */
// export const getSkillAnalysis = catchError(
//    async (req: Request, res: Response) => {
//       const userId = req.user?._id;

//       const submissions = await Submission.find({
//          candidateId: userId,
//          status: "accepted",
//       }).populate("challengeId");

//       if (!submissions || submissions.length === 0) {
//          return res.status(200).json({
//             success: true,
//             message: "No data yet. Complete challenges to get AI insights.",
//             data: {
//                gaps: [],
//                strengths: [],
//             },
//          });
//       }

//       const skillStats: Record<string, { totalScore: number; count: number }> =
//          {};

//       submissions.forEach((sub: any) => {
//          const tags = sub.challengeId.tags || [];
//          const score = sub.aiScore || 0;

//          tags.forEach((tag: string) => {
//             if (!skillStats[tag]) {
//                skillStats[tag] = { totalScore: 0, count: 0 };
//             }
//             skillStats[tag].totalScore += score;
//             skillStats[tag].count += 1;
//          });
//       });

//       const gaps: any[] = [];
//       const strengths: any[] = [];

//       Object.keys(skillStats).forEach((skill) => {
//          const avgScore = Math.round(
//             skillStats[skill].totalScore / skillStats[skill].count
//          );

//          const entry = {
//             skill,
//             score: avgScore,
//             submissionsAnalyzed: skillStats[skill].count,
//          };

//          if (avgScore < 70) {
//             gaps.push({
//                ...entry,
//                recommendation: `Focus on improving ${skill}. Try more challenges.`,
//             });
//          } else if (avgScore >= 80) {
//             strengths.push({
//                ...entry,
//                comment: "High proficiency detected.",
//             });
//          }
//       });

//       res.status(200).json({
//          success: true,
//          data: {
//             gaps,
//             strengths,
//          },
//       });
//    }
// );

/**
 * @desc    Enhanced Skill Analysis with AI Scores per Skill
 * @route   GET /api/ai/skills-analysis
 * @access  Private (Candidate)
 */
export const getSkillAnalysis = catchError(
   async (req: Request, res: Response) => {
      const userId = req.user?._id;

      const submissions = await Submission.find({
         candidateId: userId,
         status: { $in: ["accepted", "pending"] },
         aiEvaluation: { $exists: true },
      }).populate("challengeId", "tags");

      if (!submissions || submissions.length === 0) {
         return res.status(200).json({
            success: true,
            message:
               "No evaluated submissions yet. Complete challenges to build your skill profile!",
            data: {
               skills: [],
               totalSubmissions: 0,
               averageScore: 0,
            },
         });
      }

      // Aggregate scores by skill
      const skillStats: Record<
         string,
         {
            totalScore: number;
            count: number;
            submissions: Array<{ score: number; challengeTitle: string }>;
         }
      > = {};

      submissions.forEach((sub: any) => {
         const tags = sub.challengeId?.tags || [];
         const score = sub.aiEvaluation?.technicalScore || sub.aiScore || 0;
         const challengeTitle = sub.challengeId?.title || "Unknown Challenge";

         tags.forEach((tag: string) => {
            if (!skillStats[tag]) {
               skillStats[tag] = { totalScore: 0, count: 0, submissions: [] };
            }
            skillStats[tag].totalScore += score;
            skillStats[tag].count += 1;
            skillStats[tag].submissions.push({ score, challengeTitle });
         });
      });

      // Build skill profile
      const skills = Object.keys(skillStats).map((skill) => {
         const avgScore = Math.round(
            skillStats[skill].totalScore / skillStats[skill].count
         );

         let level: "beginner" | "intermediate" | "advanced" | "expert";
         if (avgScore >= 90) level = "expert";
         else if (avgScore >= 75) level = "advanced";
         else if (avgScore >= 60) level = "intermediate";
         else level = "beginner";

         return {
            skill,
            averageScore: avgScore,
            level,
            submissionsCount: skillStats[skill].count,
            recentScores: skillStats[skill].submissions.slice(-3),
            trend: calculateTrend(skillStats[skill].submissions),
         };
      });

      // Sort by score
      skills.sort((a, b) => b.averageScore - a.averageScore);

      const totalScore = skills.reduce((sum, s) => sum + s.averageScore, 0);
      const averageScore = Math.round(totalScore / skills.length);

      res.status(200).json({
         success: true,
         data: {
            skills,
            totalSubmissions: submissions.length,
            averageScore,
            strongestSkills: skills.slice(0, 3),
            skillsToImprove: skills.filter((s) => s.averageScore < 70),
         },
      });
   }
);

/**
 * Calculate skill trend (improving, stable, declining)
 */
function calculateTrend(
   submissions: Array<{ score: number }>
): "improving" | "stable" | "declining" {
   if (submissions.length < 2) return "stable";

   const recent = submissions.slice(-3);
   const older = submissions.slice(0, -3);

   if (older.length === 0) return "stable";

   const recentAvg =
      recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
   const olderAvg = older.reduce((sum, s) => sum + s.score, 0) / older.length;

   if (recentAvg > olderAvg + 5) return "improving";
   if (recentAvg < olderAvg - 5) return "declining";
   return "stable";
}

/**
 * @desc    Enhanced AI Career Coach with Recommendations & Resources
 * @route   POST /api/ai/coach/chat
 * @access  Private
 */
export const aiCoachChat = catchError(async (req: Request, res: Response) => {
   const { message } = req.body;
   const userId = req.user?._id;

   if (!message) {
      return res.status(400).json({
         success: false,
         message: "Message is required",
      });
   }

   // Get user profile and skill data
   const user = await User.findById(userId);
   const submissions = await Submission.find({
      candidateId: userId,
      status: { $in: ["accepted", "pending"] },
      aiEvaluation: { $exists: true },
   })
      .populate("challengeId", "title tags difficulty")
      .limit(10);

   // Build context
   const skillScores = submissions.map((s: any) => ({
      skill: s.challengeId?.tags?.[0],
      score: s.aiEvaluation?.technicalScore || 0,
   }));

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

   const weakSkills = skillScores
      .filter((s) => s.score < 70)
      .map((s) => s.skill)
      .slice(0, 3);

   const strongSkills = skillScores
      .filter((s) => s.score >= 80)
      .map((s) => s.skill)
      .slice(0, 3);

   // Get recommended challenges
   const recommendedChallenges = await Challenge.find({
      status: "published",
      tags: { $in: weakSkills },
      _id: {
         $nin: submissions.map((s: any) => s.challengeId._id),
      },
   })
      .limit(5)
      .select("title difficulty tags");

   const userContext = `
**User Profile:**
- Total Submissions: ${submissions.length}
- Average Score: ${averageScore}/100
- Strong Skills: ${strongSkills.join(", ") || "None yet"}
- Skills Needing Improvement: ${weakSkills.join(", ") || "None identified"}

**User's Question:**
${message}

**Your Task:**
Provide personalized career advice that includes:
1. Direct answer to their question
2. Skill gap recommendations
3. Learning resources (courses, books, tutorials)
4. Recommended challenges to practice
5. Career path suggestions

Be encouraging, specific, and actionable.
`;

   // Use free Gemini model
   const { GoogleGenerativeAI } = require("@google/generative-ai");
   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

   const result = await model.generateContent(userContext);
   const reply = result.response.text();

   res.status(200).json({
      success: true,
      data: {
         reply,
         recommendedChallenges: recommendedChallenges.map((c: any) => ({
            _id: c._id,
            title: c.title,
            difficulty: c.difficulty,
            tags: c.tags,
         })),
         skillGaps: weakSkills,
         learningResources: generateLearningResources(weakSkills),
      },
   });
});

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
   };

   return skills
      .filter((skill) => resourceMap[skill])
      .map((skill) => ({
         skill,
         resources: resourceMap[skill],
      }));
}

/**
 * @desc    Get Hiring Insights for Companies
 * @route   GET /api/ai/hiring-insights
 * @access  Private (Company/Admin)
 */
export const getHiringInsights = catchError(
   async (req: Request, res: Response) => {
      const userId = req.user?._id;

      // Get all challenges created by this company
      const challenges = await Challenge.find({ creatorId: userId });

      if (challenges.length === 0) {
         return res.status(200).json({
            success: true,
            message: "Start publishing challenges to get hiring insights!",
            data: {
               totalChallenges: 0,
               insights: null,
            },
         });
      }

      const challengeIds = challenges.map((c) => c._id);

      // Get all submissions for these challenges
      const submissions = await Submission.find({
         challengeId: { $in: challengeIds },
         aiEvaluation: { $exists: true },
      }).populate("candidateId", "name email skills");

      if (submissions.length === 0) {
         return res.status(200).json({
            success: true,
            message:
               "No submissions yet. Wait for candidates to submit solutions!",
            data: {
               totalChallenges: challenges.length,
               totalSubmissions: 0,
               insights: null,
            },
         });
      }

      // Calculate insights
      const totalSubmissions = submissions.length;
      const averageScore = Math.round(
         submissions.reduce(
            (sum, s) => sum + (s.aiEvaluation?.technicalScore || 0),
            0
         ) / totalSubmissions
      );

      const topCandidates = submissions
         .filter((s) => s.aiEvaluation && s.aiEvaluation.technicalScore >= 80)
         .sort(
            (a, b) =>
               (b.aiEvaluation?.technicalScore || 0) -
               (a.aiEvaluation?.technicalScore || 0)
         )
         .slice(0, 10)
         .map((s: any) => ({
            candidateId: s.candidateId._id,
            name: s.candidateId.name,
            email: s.candidateId.email,
            score: s.aiEvaluation?.technicalScore,
            skills: s.candidateId.skills,
         }));

      // Skill distribution
      const skillDistribution: Record<string, number> = {};
      challenges.forEach((c) => {
         c.tags?.forEach((tag) => {
            skillDistribution[tag] = (skillDistribution[tag] || 0) + 1;
         });
      });

      // Challenge performance
      const challengePerformance = await Promise.all(
         challenges.slice(0, 5).map(async (challenge) => {
            const subs = await Submission.find({
               challengeId: challenge._id,
               aiEvaluation: { $exists: true },
            });

            const avgScore =
               subs.length > 0
                  ? Math.round(
                       subs.reduce(
                          (sum, s) =>
                             sum + (s.aiEvaluation?.technicalScore || 0),
                          0
                       ) / subs.length
                    )
                  : 0;

            return {
               challengeId: challenge._id,
               title: challenge.title,
               difficulty: challenge.difficulty,
               submissionsCount: subs.length,
               averageScore: avgScore,
            };
         })
      );

      res.status(200).json({
         success: true,
         data: {
            totalChallenges: challenges.length,
            totalSubmissions,
            averageScore,
            topCandidates,
            skillDistribution,
            challengePerformance,
            insights: {
               mostPopularSkill: Object.keys(skillDistribution).sort(
                  (a, b) => skillDistribution[b] - skillDistribution[a]
               )[0],
               highQualityCandidates: topCandidates.length,
               recommendedAction:
                  totalSubmissions < 10
                     ? "Publish more challenges to attract more talent!"
                     : "Great! You have a strong talent pool. Review top candidates.",
            },
         },
      });
   }
);
