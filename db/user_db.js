require('module-alias/register');

var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');
var crypto = require('crypto');
const path = require('path');

mkdirp.sync(path.join(__dirname,'../var/db'));

var userdb = new sqlite3.Database(path.join(__dirname,'../var/db/users.db'));

userdb.serialize(function()
{
    // create the database schema for the user logins
    
    userdb.run("CREATE TABLE IF NOT EXISTS users ( \
      id INTEGER PRIMARY KEY, \
      username TEXT UNIQUE, \
      hashed_password BLOB, \
      salt BLOB \
    )");
    
    // create an initial user (username: alice, password: letmein)
    var salt = crypto.randomBytes(16);
    userdb.run('INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
      'alice',
      crypto.pbkdf2Sync('letmein', salt, 310000, 32, 'sha256'),
      salt
    ]);
});

module.exports = userdb;