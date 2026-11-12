const pino = require('pino');
const logger = pino({
  formatters: {
    level(label) {
      return { level: label } 
    }
  }
})

const errorHandler = (err, req, res, next) => {
  
  logger.error({
      err: err,
      url: req.url,
      user: req.user,
      method: req.method,
      path: req.path,
      query: req.query,
  });
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Production vs Development response toggle
  if (process.env.NODE_ENV === 'development') 
  {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production: Don't leak internal programming details to users
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong!'
    });
  }
};

module.exports = errorHandler;