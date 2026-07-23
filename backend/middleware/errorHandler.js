import logger from '../config/logger.js';

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(`[DevError] ${err.statusCode} - ${err.message}\nStack: ${err.stack}`);
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Operational errors (trusted): send message to client
  if (err.isOperational) {
    logger.warn(`[OperationalError] ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or unknown errors: don't leak details
  logger.error(`[UnhandledError] ${err.statusCode} - ${err.message}\nStack: ${err.stack}`);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong on the server'
  });
};

export default globalErrorHandler;
