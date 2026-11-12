const pino = require('pino');
const logger = pino({
  formatters: {
    level(label) {
      return { level: label } 
    }
  }
})

const errorHandler = require('./errorHandler');

process.on('unhandledRejection', (err, p) => {
  throw err;
});

process.on('uncaughtException', (err) => {
  errorHandler(err);
});

require('module-alias/register');

const app = require('./app')
var http = require('http');
const port = 80;

////////////////////////////////////////////////////////////
//// 
//// START THE SERVERS
//// 
////////////////////////////////////////////////////////////

// Start the server

app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received: closing server');
    cubs_pool.close();
    scouts_pool.close();
    server.close(() => process.exit(0));
});
