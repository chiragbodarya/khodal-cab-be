const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Log error details using Winston
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  res.status(statusCode).json({
    status: statusCode,
    code: errorCode,
    message: err.message || 'Internal Server Error'
  });
};
