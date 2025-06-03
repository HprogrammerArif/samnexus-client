export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this);
    }
  }
}

//not found error handler
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

//validation errror (use for joi/zod/react-hook-form validation)
export class ValidationError extends AppError {
  constructor(message: string = "Invalid request data", details?: any) {
    super(message, 400, true, details);
  }
}

// Authentication error (use for auth errors)
export class AuthError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

// Forbidden error (use for access denied errors)
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden access") {
    super(message, 403);
  }
}

// database error (use for database related errors)
export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", details?: any) {
    super(message, 500, true, details);
  }
}

// rate limit error (use for rate limiting errors)
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests, please try again later") {
    super(message, 429);
  }
}

// Internal server error (use for unexpected errors)
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", details?: any) {
    super(message, 500, false, details);
  }
}