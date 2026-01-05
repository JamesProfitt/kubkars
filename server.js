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
    console.log(`Server is running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received: closing server');
    cubs_pool.close();
    scouts_pool.close();
    server.close(() => process.exit(0));
});
