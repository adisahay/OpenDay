var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb://localhost/admin', function(err) {
    if (err) {
       console.log('Mongo Error ' + err);
    } else {
        console.log('MongoDB Connection Established');
    }
});

app.set('port', (process.env.PORT || 7000));
app.use(express.static(path.join(__dirname + '/public')));

// views is directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*app.use(session({
    secret : 'openday',
    maxAge: new Date(Date.now() + 31536000000),
    store: new MongoStore(
    {
        db:'admin', 
        host:'127.0.0.1',
        autoReconnect: true
    },
    function(err){
        console.log(err || 'connect-mongodb setup ok');
    }),
    resave: true,
    saveUninitialized: true
}));*/

app.use(session({
    secret : 'openday',
    maxAge: new Date(Date.now() + 31536000000),
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    },
    function(err){
        console.log(err || 'connect-mongodb setup ok');
    }),
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

require('./routes/site/site')(app);
require('./routes/school/login')(app);
require('./routes/teachers/login')(app);
app.use(function (req, res, next) {
    if (!req.isAuthenticated() && req.url.startsWith("/school"))
        res.redirect('/school/login');
    else if (!req.isAuthenticated() && req.url.startsWith("/teachers"))
        res.redirect('/teachers/login');
    else if (req.user && !req.user.name && req.body && !req.body.name && !req.url.startsWith("/school/setup"))
        res.redirect('/school/setup?f=0');
    else
        next();
})
require('./routes/school/setup')(app);
require('./routes/school/overview')(app);
require('./routes/school/teachers')(app);
require('./routes/school/classrooms')(app);
require('./routes/school/students')(app);
require('./routes/school/admissions')(app);
require('./routes/school/attendance')(app);
require('./routes/school/enquiry')(app);
require('./routes/school/broadcasts')(app);

require('./routes/teachers/overview')(app);
require('./routes/teachers/attendance')(app);
require('./routes/teachers/broadcast')(app);

require('./routes/parent/admissions')(app);

require('./routes/admin/language')(app);
require('./routes/admin/schools')(app);

var School = require('./models/school');
passport.use('school', new LocalStrategy(School.authenticate()));

var Teacher = require('./models/teachers');
passport.use('teacher', new LocalStrategy(Teacher.authenticate()));

passport.serializeUser(function(school, done) {
    done(null, school.id);
});

passport.deserializeUser(function(id, done) {
    School.findById(id, function(err, u) {
        if (u == null) {
            Teacher.findById(id, function(teacherError, teacher) {
                done(teacherError, teacher);
            });
        } else {
            done(err, u);
        }
    });
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
