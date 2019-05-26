var Teacher = require("../../models/teachers"),
    passport = require('passport'),
    utils = require('../utils/utils');

module.exports = function(app) {
    app.get("/teachers/login", function(req, res) {
        if (req.isAuthenticated())
            return res.redirect("/teachers/overview");
        res.render("teachers/login", {
            gatc: utils.getGATC()
        });
    });

    app.post("/teachers/isUser", function(req, res) {
        Teacher.findOne(
        {
            username: req.body.username
        },
        function(err, teacher) {
            if (err)
                res.send(err);
            else if (teacher)
                res.json({status: 200, teacher: teacher});
            else
                res.json({status: 100});
        });
    });

    app.post("/teachers/requestLogin", function(req, res) {
        passport.authenticate('teacher', function(err, user, info) {
            console.log("err: " + err);
            console.log("user: " + user);
            console.log("info: " + info);
            if(err || !user) {
                console.log(err);
                return res.json({
                    status: 100,
                    message: "Incorrect Password"
                });
            }
            console.log("logging in");

            req.logIn(user, function(err) {
                if (err) {
                    console.log(err);
                    return res.json({
                        status: 101,
                        message: "Login error"
                    });
                }

                res.cookie('connect.sid', req.cookies['connect.sid'] , {
                    maxAge : 315360000000,
                    httpOnly : true
                });

                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                res.header("Pragma", "no-cache");
                res.header("Expires", 0);

                Teacher.findOne(
                {
                    username: req.body.username
                },
                function(err, teacher) {
                    if (err)
                        res.send(err);
                    console.log("redirecting to overview page");
                    return res.send({status: 200, message: "Login successful"});
                })
            })
        })(req, res);
    });

    app.get('/teachers/logout',function (req, res){
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        req.logout();
        res.redirect('/teachers/login');
    });
};
