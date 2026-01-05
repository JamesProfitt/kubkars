// Instead of a trusted connection, it might be safer to create a userid that has limited access
// within the database.
// 
// This is because, if there is SQL Injection, the user that submits anonymous SQL from the web 
// cannot drop tables, delete data, etc
// 
// The user should only only have SELECT access to the required tables in dbo
// 
// INSERT access to HeatAudit, RunOffAudit
//
// UPDATE access to Heats, Runoffs
//
// No other access should be allowed.

const dbconfig_cubs = {
  server: 'localhost',
  database: 'SCOUTS_SAMPLE',
  user: 'node_user',
  password: 'node_user',
  options: {
    trustServerCertificate: true // for local dev / self-signed certs
  }
};

// This config can also be a connection string:
// No "Driver" required
//const dbconfig_cubs = "server=localhost;Database=KUB_KAR;user=node_user;password=node_user"

export { dbconfig_cubs };


