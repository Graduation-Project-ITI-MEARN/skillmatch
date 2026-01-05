// src/services/validationService.ts
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ValidationResult {
   isValid: boolean;
   issues: string[];
   warnings: string[];
   plagiarismScore: number; // 0-100 (0 = original, 100 = copied)
   confidence: number; // 0-100
}

/**
 * Validate GitHub Repository Link
 * Checks if the repo exists and is not a fake/placeholder
 */
export const validateGitHubLink = async (
   githubUrl: string
): Promise<{ isValid: boolean; message: string; repoData?: any }> => {
   console.log("--- START validateGitHubLink ---");
   console.log("GitHub URL received:", githubUrl);

   try {
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      console.log("URL Match result:", match); // CRITICAL: Check this

      if (!match) {
         console.log(
            "Validation Failed: Invalid GitHub URL format (regex mismatch)"
         );
         return {
            isValid: false,
            message: "Invalid GitHub URL format",
         };
      }

      const [, username, repoName] = match;
      const cleanRepoName = repoName.replace(/\.git$/, "").replace(/\/$/, "");

      console.log(
         `Extracted Username: "${username}", Clean Repo Name: "${cleanRepoName}"`
      );

      const apiUrl = `https://api.github.com/repos/${username}/${cleanRepoName}`;
      console.log("Calling GitHub API URL:", apiUrl); // CRITICAL: Ensure this URL is correct

      const response = await axios.get(apiUrl, {
         headers: {
            "User-Agent": "SkillMatch-AI",
         },
         timeout: 5000,
      });

      console.log("GitHub API Response Status:", response.status);
      // console.log("GitHub API Response Data:", response.data); // Optional: log full data if needed

      const repo = response.data;

      // ... (your existing warning checks) ...
      const warnings: string[] = [];
      // Check 1: Empty or very small repo
      if (repo.size === 0) {
         warnings.push("Repository appears to be empty");
      }
      // Check 2: No recent activity
      const lastUpdated = new Date(repo.updated_at);
      const daysSinceUpdate = Math.floor(
         (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceUpdate > 365) {
         warnings.push("Repository hasn't been updated in over a year");
      }
      // Check 3: Fork without modifications
      if (repo.fork) {
         warnings.push(
            "This is a forked repository. Ensure you made significant modifications."
         );
      }
      // Check 4: Default or template repo
      const suspiciousNames = [
         "test",
         "example",
         "demo",
         "template",
         "sample",
         "placeholder",
      ];
      if (
         suspiciousNames.some((name) =>
            cleanRepoName.toLowerCase().includes(name)
         )
      ) {
         warnings.push(
            "Repository name suggests this might be a demo/template"
         );
      }
      console.log("Repository warnings:", warnings);

      console.log("Validation Succeeded: Repository is valid.");
      return {
         isValid: true,
         message:
            warnings.length > 0 ? warnings.join(". ") : "Valid repository",
         repoData: {
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            size: repo.size,
            language: repo.language,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            hasIssues: repo.has_issues,
            isPrivate: repo.private, // This will be false for public repos
            warnings,
         },
      };
   } catch (error: any) {
      console.error("Error caught in validateGitHubLink:", error.message);
      if (error.response) {
         console.error("Error Response Status:", error.response.status);
         console.error("Error Response Data:", error.response.data); // CRITICAL: Look here for GitHub's error message
      } else if (error.request) {
         console.error("Error Request (no response received):", error.request);
      } else {
         console.error(
            "Error Message (Axios config/other error):",
            error.message
         );
      }

      if (error.response?.status === 404) {
         console.log("Validation Failed: GitHub API returned 404.");
         return {
            isValid: false,
            message: "GitHub repository not found. Please check the URL.",
         };
      }
      if (error.code === "ECONNABORTED") {
         // Axios timeout error
         console.log("Validation Failed: GitHub API request timed out.");
         return {
            isValid: false,
            message: "GitHub API request timed out. Please try again later.",
         };
      }

      console.log(
         "Validation Failed: General error during GitHub link validation."
      );
      return {
         isValid: false,
         message:
            "Could not validate GitHub link. Please ensure it's accessible.",
      };
   } finally {
      console.log("--- END validateGitHubLink ---");
   }
};

/**
 * Check Video Relevance to Challenge
 * Uses AI to verify if video content matches the challenge
 */
export const validateVideoRelevance = async (
   videoTranscript: string,
   challengeTitle: string,
   challengeDescription: string
): Promise<{
   isRelevant: boolean;
   confidence: number;
   reason: string;
}> => {
   try {
      if (!videoTranscript || videoTranscript.length < 50) {
         return {
            isRelevant: false,
            confidence: 0,
            reason: "Video transcript is too short or empty",
         };
      }

      const model = genAI.getGenerativeModel({
         model: "gemini-1.5-flash",
         generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
         },
      });

      const prompt = `You are a content validation expert.

**Challenge:**
Title: ${challengeTitle}
Description: ${challengeDescription}

**Video Transcript:**
${videoTranscript.substring(0, 2000)} ${
         videoTranscript.length > 2000 ? "..." : ""
      }

**Task:**
Determine if this video is genuinely explaining the solution to this challenge, or if it's:
- Unrelated content
- Generic/placeholder content
- AI-generated nonsense
- Wrong challenge explanation

Respond ONLY with this JSON format:
{
  "isRelevant": true/false,
  "confidence": 0-100,
  "reason": "Brief explanation"
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      const cleaned = responseText
         .replace(/```json\n?/g, "")
         .replace(/```\n?/g, "")
         .trim();

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         throw new Error("Invalid JSON response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
         isRelevant: parsed.isRelevant || false,
         confidence: parsed.confidence || 0,
         reason: parsed.reason || "Could not determine relevance",
      };
   } catch (error) {
      console.error("Video relevance check failed:", error);
      // If validation fails, allow submission but with warning
      return {
         isRelevant: true,
         confidence: 50,
         reason: "Could not validate video content",
      };
   }
};

/**
 * Plagiarism Detection using AI
 * Checks if the submission is suspiciously similar to common solutions
 */
export const checkPlagiarism = async (
   submissionContent: string,
   challengeCategory: string
): Promise<{
   plagiarismScore: number;
   isSuspicious: boolean;
   details: string;
}> => {
   try {
      const model = genAI.getGenerativeModel({
         model: "gemini-1.5-flash",
         generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
         },
      });

      const prompt = `You are a plagiarism detection expert for coding challenges.

**Challenge Category:** ${challengeCategory}

**Submission Content:**
${submissionContent.substring(0, 2000)}

**Task:**
Analyze this submission for signs of plagiarism or copying:
- Is it too generic/boilerplate?
- Does it look like a copy-paste from tutorials?
- Is it suspiciously polished for a quick challenge?
- Does it contain obvious copied comments/variable names?
- Are there signs of AI-generated code (too perfect, unusual patterns)?

Score from 0-100:
- 0-30: Original work
- 31-60: Some borrowed concepts (acceptable)
- 61-80: Likely copied with modifications
- 81-100: Definitely plagiarized

Respond ONLY with JSON:
{
  "plagiarismScore": 0-100,
  "isSuspicious": true/false,
  "details": "Brief explanation of findings"
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const cleaned = responseText
         .replace(/```json\n?/g, "")
         .replace(/```\n?/g, "")
         .trim();

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         throw new Error("Invalid JSON response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
         plagiarismScore: parsed.plagiarismScore || 0,
         isSuspicious: parsed.isSuspicious || false,
         details: parsed.details || "Analysis completed",
      };
   } catch (error) {
      console.error("Plagiarism check failed:", error);
      return {
         plagiarismScore: 0,
         isSuspicious: false,
         details: "Could not perform plagiarism check",
      };
   }
};

/**
 * Comprehensive Submission Validation
 * Runs all checks and returns aggregated results
 */
export const validateSubmission = async (
   submission: {
      linkUrl?: string;
      textContent?: string;
      videoTranscript?: string;
   },
   challenge: {
      title: string;
      description: string;
      category: string;
   }
): Promise<ValidationResult> => {
   const issues: string[] = [];
   const warnings: string[] = [];
   let plagiarismScore = 0;

   // 1. Validate GitHub link if provided
   if (submission.linkUrl && submission.linkUrl.includes("github.com")) {
      const githubValidation = await validateGitHubLink(submission.linkUrl);

      if (!githubValidation.isValid) {
         issues.push(githubValidation.message);
      } else if (githubValidation.repoData?.warnings?.length > 0) {
         warnings.push(...githubValidation.repoData.warnings);
      }
   }

   // 2. Check video relevance if transcript available
   if (submission.videoTranscript) {
      const videoValidation = await validateVideoRelevance(
         submission.videoTranscript,
         challenge.title,
         challenge.description
      );

      if (!videoValidation.isRelevant && videoValidation.confidence > 70) {
         issues.push(
            `Video content may not be related to this challenge. ${videoValidation.reason}`
         );
      } else if (
         !videoValidation.isRelevant &&
         videoValidation.confidence > 40
      ) {
         warnings.push(`Video relevance uncertain: ${videoValidation.reason}`);
      }
   }

   // 3. Plagiarism check on text content
   if (submission.textContent) {
      const plagiarismCheck = await checkPlagiarism(
         submission.textContent,
         challenge.category
      );

      plagiarismScore = plagiarismCheck.plagiarismScore;

      if (plagiarismCheck.isSuspicious) {
         if (plagiarismCheck.plagiarismScore > 80) {
            issues.push(
               `High plagiarism detected (${plagiarismCheck.plagiarismScore}%). ${plagiarismCheck.details}`
            );
         } else if (plagiarismCheck.plagiarismScore > 60) {
            warnings.push(
               `Possible plagiarism detected (${plagiarismCheck.plagiarismScore}%). ${plagiarismCheck.details}`
            );
         }
      }
   }

   // 4. Check for fake/placeholder links
   const suspiciousPatterns = [
      "example.com",
      "test.com",
      "placeholder",
      "fake",
      "demo.com",
      "localhost",
   ];

   if (submission.linkUrl) {
      const lowerUrl = submission.linkUrl.toLowerCase();
      const hasSuspiciousPattern = suspiciousPatterns.some((pattern) =>
         lowerUrl.includes(pattern)
      );

      if (hasSuspiciousPattern) {
         issues.push(
            "Submission contains a placeholder or fake URL. Please provide a real project link."
         );
      }
   }

   // Calculate overall confidence
   const confidence = issues.length === 0 ? 90 - warnings.length * 10 : 40;

   return {
      isValid: issues.length === 0,
      issues,
      warnings,
      plagiarismScore,
      confidence: Math.max(0, Math.min(100, confidence)),
   };
};

/**
 * Quick validation for common fake GitHub repos
 */
export const isFakeGitHubUrl = (url: string): boolean => {
   const fakePatterns = [
      "github.com/example",
      "github.com/test",
      "github.com/placeholder",
      "github.com/fake",
      "github.com/demo",
      "github.com/sample",
   ];

   return fakePatterns.some((pattern) => url.toLowerCase().includes(pattern));
};

export default validateSubmission;
