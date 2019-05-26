var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	Subscription = require('../../models/subscription'),
	passport = require('passport'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/', function(req, res) {
		res.render('prelaunch', {
			gatc: utils.getGATC()
		});
	});

	app.post('/subscribe', function(req, res) {
		Subscription.findOne(
		{
			email: req.body.email
		},
		function(err, email) {
			if (err)
				res.send(err);
			if (email)
				res.send("You're already subscribed.");
			else if (!email) {
				var subscription = new Subscription({email: req.body.email});
				subscription.save(function (e, save) {
					if (e)
						return res.send(e);
					if (save) {
						// send email
						return res.send('subscribed');
					}
				})
			}
		})
	});
}
