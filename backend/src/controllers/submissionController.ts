import { Request, Response } from 'express';
import Submission, { ISubmission, SubmissionType } from '../models/Submission';
import mongoose from 'mongoose';

// Custom error class
class SubmissionError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Create a new submission
 * POST /api/submissions
 * Protected Route - Candidate Only
 */
export const createSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      challengeId,
      videoExplanationUrl,
      submissionType,
      linkUrl,
      fileUrls,
      textContent
    } = req.body;

    // Get candidate ID from authenticated user
    const candidateId = req.user?._id;

    if (!candidateId) {
      throw new SubmissionError('User not authenticated', 401);
    }

    // Basic validation
    if (!challengeId) {
      throw new SubmissionError('Challenge ID is required');
    }

    if (!videoExplanationUrl || videoExplanationUrl.trim() === '') {
      throw new SubmissionError('Video explanation URL is mandatory for all submissions');
    }

    if (!submissionType) {
      throw new SubmissionError('Submission type is required');
    }

    // Validate submission type
    if (!Object.values(SubmissionType).includes(submissionType)) {
      throw new SubmissionError(
        `Invalid submission type. Must be one of: ${Object.values(SubmissionType).join(', ')}`
      );
    }

    // Type-specific validation
    switch (submissionType) {
      case SubmissionType.LINK:
        if (!linkUrl || linkUrl.trim() === '') {
          throw new SubmissionError('Link URL is required for link-type submissions');
        }
        break;

      case SubmissionType.FILE:
        if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
          throw new SubmissionError('At least one file URL is required for file-type submissions');
        }
        break;

      case SubmissionType.TEXT:
        if (!textContent || textContent.trim() === '') {
          throw new SubmissionError('Text content is required for text-type submissions');
        }
        break;
    }

    // Check for duplicate submission
    const existingSubmission = await Submission.findOne({
      challengeId: new mongoose.Types.ObjectId(challengeId),
      candidateId: new mongoose.Types.ObjectId(candidateId)
    });

    if (existingSubmission) {
      throw new SubmissionError('You have already submitted for this challenge', 409);
    }

    // Create submission
    const submission: ISubmission = await Submission.create({
      challengeId,
      candidateId,
      videoExplanationUrl: videoExplanationUrl.trim(),
      submissionType,
      linkUrl: linkUrl?.trim(),
      fileUrls,
      textContent: textContent?.trim(),
      aiScore: 0
    });

    // Populate references
    await submission.populate([
      { path: 'challengeId', select: 'title category difficulty' },
      { path: 'candidateId', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: submission
    });

  } catch (error: any) {
    if (error instanceof SubmissionError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else if (error.code === 11000) {
      // Duplicate key error
      res.status(409).json({
        success: false,
        message: 'You have already submitted for this challenge'
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((e: any) => e.message)
      });
    } else {
      console.error('Create submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create submission',
        error: error.message
      });
    }
  }
};

/**
 * Get all submissions for a specific challenge
 * GET /api/submissions/challenge/:id
 * Protected Route - Company/Challenger/Admin Only
 */
export const getSubmissionsByChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate challenge ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new SubmissionError('Invalid challenge ID', 400);
    }

    // Get all submissions for this challenge
    const submissions = await Submission.find({ challengeId: id })
      .populate('candidateId', 'name email profilePicture')
      .populate('challengeId', 'title category difficulty')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });

  } catch (error: any) {
    if (error instanceof SubmissionError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Get submissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve submissions',
        error: error.message
      });
    }
  }
};

/**
 * Get a single submission by ID
 * GET /api/submissions/:id
 * Protected Route
 */
export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new SubmissionError('Invalid submission ID', 400);
    }

    const submission = await Submission.findById(id)
      .populate('candidateId', 'name email profilePicture')
      .populate('challengeId', 'title category difficulty');

    if (!submission) {
      throw new SubmissionError('Submission not found', 404);
    }

    res.status(200).json({
      success: true,
      data: submission
    });

  } catch (error: any) {
    if (error instanceof SubmissionError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Get submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve submission',
        error: error.message
      });
    }
  }
};

/**
 * Update AI score for a submission
 * PATCH /api/submissions/:id/score
 * Protected Route - Admin Only
 */
export const updateAIScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { aiScore } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new SubmissionError('Invalid submission ID', 400);
    }

    if (typeof aiScore !== 'number' || aiScore < 0 || aiScore > 100) {
      throw new SubmissionError('AI score must be a number between 0 and 100');
    }

    const submission = await Submission.findByIdAndUpdate(
      id,
      { aiScore },
      { new: true, runValidators: true }
    ).populate('candidateId', 'name email');

    if (!submission) {
      throw new SubmissionError('Submission not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'AI score updated successfully',
      data: submission
    });

  } catch (error: any) {
    if (error instanceof SubmissionError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Update AI score error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update AI score',
        error: error.message
      });
    }
  }
};