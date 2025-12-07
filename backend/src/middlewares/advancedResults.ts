import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";

export const advancedResults =
  (model: Model<any>, populate?: any, fixedFilter: any = {}) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // --- 1) Filtering ---
      const reqQuery = { ...req.query };
      const removeFields = ["sort", "page", "limit"];
      removeFields.forEach((param) => delete reqQuery[param]);

      let queryStr = JSON.stringify(reqQuery);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt|in)\b/g,
        (match) => `$${match}`
      );

      const baseFilter = { ...JSON.parse(queryStr), ...fixedFilter };
      let query = model.find(baseFilter);

      // --- 2) Sorting ---
      if (req.query.sort) {
        const sortBy = (req.query.sort as string).split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query = query.sort("-createdAt");
      }

      // --- 3) Pagination ---
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const skip = (page - 1) * limit;

      const total = await model.countDocuments(baseFilter);

      query = query.skip(skip).limit(limit);

      const pagination: any = {};
      const endIndex = page * limit;

      if (endIndex < total) pagination.next = { page: page + 1, limit };
      if (skip > 0) pagination.prev = { page: page - 1, limit };

      // --- 4) Populate ---
      if (populate) query = query.populate(populate);

      // --- 5) Execute ---
      const results = await query;

      res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results,
      };

      next();
    } catch (error) {
      next(error);
    }
  };

