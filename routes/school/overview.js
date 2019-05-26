var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	School = require('../../models/school'),
	passport = require('passport'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/school/overview', function(req, res) {
		res.redirect('/school/students')
		/*res.render('school/overview', {
			gatc: utils.getGATC(),
			name: req.user.name,
			city: req.user.address.city
		});*/
	});
}
