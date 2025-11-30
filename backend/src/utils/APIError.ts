class APIError extends Error {
   status: number;
   errors?: any;
   constructor(status: number, message: string, errors?: any) {
      super(message);
      this.status = status;
      this.errors = errors;
      Error.captureStackTrace(this, this.constructor);
   }
}

export default APIError;
