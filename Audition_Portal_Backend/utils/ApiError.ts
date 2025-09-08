class ApiError extends Error {
  statusCode: number;
  data: any;
  success: boolean;
  errors: string[];
  stack?: string;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    stack: string = "",
    errors: string[] = []
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
