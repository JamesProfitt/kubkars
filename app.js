require('module-alias/register');

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var cors = require('cors');
var passport = require('passport');
var logger = require('morgan');
var util = require('util');
//var helmet = require('helmet');
var bodyParser = require('body-parser');
const path = require('path');
const nocache = require('nocache');

const { csrfSync } = require("csrf-sync");

const {
    invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
    generateToken, // Use this in your routes to generate, store, and get a CSRF token.
    getTokenFromRequest, // use this to retrieve the token submitted by a user
    getTokenFromState, // The default method for retrieving a token from state.
    storeTokenInState, // The default method for storing a token in state.
    revokeToken, // Revokes/deletes a token by calling storeTokenInState(undefined)
    csrfSynchronisedProtection, // This is the default CSRF protection middleware.
} = csrfSync();

const dbop = require('@db/db_operations');

// pass the session to the connect sqlite3 module
// allowing it to inherit from session.Store
var SQLiteStore = require('connect-sqlite3')(session);

var authRouter = require('@routes/auth');
var apiRouter = require('@routes/routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Helmet broke everything, disable it for now. I'm sure there's a way to configure it properly.
//app.use(helmet.contentSecurityPolicy({
//  directives: {
//    defaultSrc: ["'self'"],
//    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
//  }
//}));


app.use(nocache());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended:  true }));
app.use(bodyParser.json());

app.set('x-powered-by', false);

app.use(passport.initialize());

app.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname,'./var/db') })
}));

app.use(passport.session());
app.use(passport.authenticate('session'));

app.get('/csrf-token', (req, res) => {
    res.json({ token: generateToken(req) });
});

// CSRF disabled for now. I'm sure there's a way to configure it properly. I'm probably missing something.
//app.use(csrfSynchronisedProtection);

// Process Messages
app.use(function(req, res, next) {
    var msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !! msgs.length;
    req.session.messages = [];
    next();
});

app.get('/api/me', (req, res) => {
    if (!req.isAuthenticated())
    {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    // send only safe fields
    res.json({ id: req.user.id, username: req.user.username });
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/libs', express.static(path.join(__dirname, 'libs')));

app.use('/', authRouter);
app.use('/api', authRouter);
app.use('/api', apiRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = req.session.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;