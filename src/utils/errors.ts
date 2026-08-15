class AppError extends Error {
  statusCode: number;
  status: string;
  errorCode?: string;
  isOperational: boolean;
  constructor(message: string, statusCode: number, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
