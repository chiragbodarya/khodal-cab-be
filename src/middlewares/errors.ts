import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

const errorHandler = (err: any, req: any, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Log error details using Winston
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  res.status(statusCode).json({
    status: statusCode,
    code: errorCode,
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
