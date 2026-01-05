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

const dbconfig_scouts = {
  server: 'localhost',
  database: 'TREVOR_DB_SCOUTS',
  user: 'node_user',
  password: 'node_user',
  options: {
    trustServerCertificate: true // for local dev / self-signed certs
  }
};

export { dbconfig_scouts };


