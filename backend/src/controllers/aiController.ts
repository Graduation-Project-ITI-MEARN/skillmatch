import { Request, Response } from "express";

import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import User from "../models/User";
import { catchError } from "../utils/catchAsync";

// Helper to generate mock advice based on skill name
const getAdviceForSkill = (skill: string): string => {
  const adviceMap: Record<string, string> = {
    React: "Focus on State Management and Custom Hooks.",
    "Node.js": "Review Event Loop mechanics and Async/Await patterns.",
    Python: "Practice list comprehensions and data manipulation libraries.",
    Design: "Work on typography hierarchy and color theory.",
    SQL: "Practice complex Joins and Indexing strategies.",
    Accounting: "Focus on tax concepts and accounting procedures.",
  };
  return (
    adviceMap[skill] ||
    `Complete beginner challenges tagged with ${skill} to build fundamentals.`
  );
};

/**
 * @desc    Get Challenge Recommendations based on User Skills
 * @route   GET /api/ai/recommendations
 * @access  Private (Candidate)
 */
const getRecommendations = catchError(async (req: Request, res: Response) => {
  // 1. Get current user skills
  const userId = req.user?._id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const userSkills = user.skills || []; // e.g., ['React', 'CSS', 'Node']

  // 2. Find challenges user has ALREADY completed (to exclude them)
  const completedSubmissions = await Submission.find({
    candidateId: userId,
    status: "accepted",
  }).select("challengeId");

  if (!completedSubmissions || completedSubmissions.length === 0) {
    return res
      .status(201)
      .json({ message: "No data yet, complete challenges" });
  }

  const completedChallengeIds = completedSubmissions.map(
    (s: any) => s.challengeId
  );

  // 3. Find relevant challenges
  // Logic: Challenges that have at least one tag matching user skills, are published, and not completed
  const challenges = await Challenge.find({
    _id: { $nin: completedChallengeIds },
    status: "published",
    tags: { $in: userSkills },
  })
    .limit(10)
    .lean();

  // 4. Calculate "Match Percentage" and structure response
  const recommended = challenges.map((challenge: any) => {
    // Intersection of challenge tags and user skills
    const matchingTags = challenge.tags.filter((tag: string) =>
      userSkills.includes(tag)
    );

    // Simple logic: If you have 2 of the 3 required tags, it's a 66% match.
    // We floor it at 50% just to make it look encouraging.
    let matchRatio = matchingTags.length / (challenge.tags.length || 1);
    if (matchRatio > 1) matchRatio = 1;

    const matchPercentage = Math.round(matchRatio * 100);

    return {
      _id: challenge._id,
      title: challenge.title,
      difficulty: challenge.difficulty,
      tags: challenge.tags,
      matchPercentage: matchPercentage < 40 ? 40 : matchPercentage, // Minimum mock floor
      reason: `Matches your skills in ${matchingTags.join(", ")}`,
    };
  });

  // Sort by highest match
  recommended.sort((a, b) => b.matchPercentage - a.matchPercentage);

  res.status(200).json(recommended);
});

/**
 * @desc    Get Skill Gap Analysis based on Submission Scores
 * @route   GET /api/ai/skills-analysis
 * @access  Private (Candidate)
 */
const getSkillAnalysis = catchError(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  // 1. Fetch all graded submissions
  const submissions = await Submission.find({
    candidate: userId,
    status: "accepted",
  }).populate("challengeId");

  if (!submissions || submissions.length === 0) {
    return res.status(200).json({
      message: "No data yet. Complete challenges to get AI insights.",
      gaps: [],
      strengths: [],
    });
  }

  // 2. Aggregate scores by Skill (Tag)
  const skillStats: Record<string, { totalScore: number; count: number }> = {};

  submissions.forEach((sub: any) => {
    const tags = sub.challenge.tags || [];
    const score = sub.score || 0; // Overall score (0-100)

    tags.forEach((tag: string) => {
      if (!skillStats[tag]) {
        skillStats[tag] = { totalScore: 0, count: 0 };
      }
      skillStats[tag].totalScore += score;
      skillStats[tag].count += 1;
    });
  });

  // 3. Analyze Averages
  const gaps: any[] = [];
  const strengths: any[] = [];

  Object.keys(skillStats).forEach((skill) => {
    const avgScore = Math.round(
      skillStats[skill].totalScore / skillStats[skill].count
    );

    const entry = {
      skill,
      score: avgScore,
      submissionsAnalyzed: skillStats[skill].count,
    };

    if (avgScore < 70) {
      gaps.push({
        ...entry,
        recommendation: getAdviceForSkill(skill),
      });
    } else if (avgScore >= 80) {
      strengths.push({
        ...entry,
        comment: "High proficiency detected.",
      });
    }
  });

  res.status(200).json({
    gaps,
    strengths,
  });
});

/**
 * @desc    Mock AI Career Coach Chat
 * @route   POST /api/ai/coach/chat
 * @access  Private
 */

const getCoachReply = (message: string): string => {
  const msg = message.toLowerCase();

  if (msg.includes("backend")) {
    return "To improve backend skills, focus on Node.js performance, database design, and building secure REST APIs.";
  }

  if (msg.includes("frontend") || msg.includes("react")) {
    return "Strengthen your React fundamentals and consider learning Next.js for full-stack development.";
  }

  if (msg.includes("interview")) {
    return "Prepare by practicing system design basics, explaining your projects clearly, and revising core concepts.";
  }

  if (msg.includes("database")) {
    return "Work on data modeling, indexing, and understanding SQL vs NoSQL trade-offs.";
  }

  return "Keep building real-world projects and improving problem-solving skills to grow faster.";
};

const aiCoachChat = catchError(async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: "Message is required",
    });
  }

  const reply = getCoachReply(message);

  setTimeout(() => {
    res.status(200).json({
      success: true,
      data: {
        reply,
      },
    });
  }, 1500);
});

/**
 * @desc    Mock AI Video Evaluation
 * @route   POST /api/ai/evaluate
 * @access  Private
 */
const aiVideoEvaluation = catchError(async (req: Request, res: Response) => {
  const { videoUrl, challengeId } = req.body;

  if (!videoUrl || !challengeId) {
    return res.status(400).json({
      success: false,
      message: "videoUrl and challengeId are required",
    });
  }

  setTimeout(() => {
    res.status(200).json({
      success: true,
      data: {
        score: 88,
        feedback:
          "Strong logic and clean structure. Your explanation of the solution was clear and confident.",
        breakdown: {
          clarity: 90,
          technical: 85,
          soft_skills: 92,
        },
      },
    });
  }, 3000);
});

export {
  getAdviceForSkill,
  getRecommendations,
  getSkillAnalysis,
  getCoachReply,
  aiCoachChat,
  aiVideoEvaluation,
};
