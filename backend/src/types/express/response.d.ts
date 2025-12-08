
declare namespace Express {
  export interface Response {
    advancedResults?: {
      success: boolean;
      count: number;
      pagination?: any;
      data: any;
    };
  }
}