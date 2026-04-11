export class AppError extends Error {
  constructor({ status, errorCode, message }) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    this.name = "AppError";

    Error.captureStackTrace(this, this.constructor);
  }
}


