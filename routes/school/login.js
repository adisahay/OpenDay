var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	School = require('../../models/school'),
	passport = require('passport'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/school/login', function(req, res) {
		if (req.isAuthenticated()) {
			School.findOne(
			{
				username: req.user.username
			},
			function(err, school) {
				if (err)
					res.send(err);
				else if (school)
					res.redirect('/school/overview');
			});
		} else {
			res.header("Cache-Control", "no-cache, no-store, must-revalidate");
			res.header("Pragma", "no-cache");
			res.header("Expires", 0);
			res.render('school/login', {
				gatc: utils.getGATC()
			});
		}
	});

	app.get('/school/loginfailure', function(req, res) {

		res.header("Cache-Control", "no-cache, no-store, must-revalidate");
		res.header("Pragma", "no-cache");
		res.header("Expires", 0);
		res.render('school/login', {
			gatc: utils.getGATC(),
			message: 'Invalid Username or Password'
		});
	});

	app.post('/school/requestLogin', function(req, res){
		passport.authenticate('school', function(err, user, info) {
			if(err || !user)
				return res.redirect("/school/loginfailure");

			req.logIn(user, function(err) {
				if (err)
					return res.redirect("/school/loginfailure");

				if(req.body.remember)
					res.cookie('connect.sid', req.cookies['connect.sid'] , {
						maxAge : 315360000000,
						httpOnly : true
					});

				res.header("Cache-Control", "no-cache, no-store, must-revalidate");
				res.header("Pragma", "no-cache");
				res.header("Expires", 0);

				School.findOne(
				{
					username: req.body.username
				},
				function(err, school) {
					if (err)
						res.send(err);

					res.redirect('/school/overview');
				})
			})
		})(req, res);
	});

	app.post('/school/isUser', function(req, res) {
		School.findOne(
		{
			username: req.body.username
		},
		function(err, school) {
			if (err)
				res.send(err);
			else if (school)
				res.json({status: 200});
			else
				res.json({status: 100});
		});
	});

	/*app.post('/school/register', function(req, res) {
		School.register(new School({
			username : req.body.username,
		}), req.body.password, function(err, account) {
			if (err)
				res.send(err);

			passport.authenticate('school')(req, res, function() {
				res.redirect('/school/overview');
			});
		});
	});*/

	app.get('/school/logout',function (req, res){
		res.header("Cache-Control", "no-cache, no-store, must-revalidate");
		res.header("Pragma", "no-cache");
		res.header("Expires", 0);
		req.logout();
		res.redirect('/school/login');
	});
}
