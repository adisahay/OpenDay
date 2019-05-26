var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	Schools = require('../../models/school'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get("/admin/schools", function(req, res) {
		res.render('admin/schools', {
			gatc: utils.getGATC()
		})
	});

	app.get("/admin/getSchools", function(req, res) {
		Schools.find(
		{},
		{
			name: 1,
			address: 1,
			username: 1
		},
		function(err, schools) {
			if (err)
				return res.json({message: 'error', err: err});

			return res.json({message: 'success', schools: schools});
		})
	});

	app.post('/admin/addSchool', function(req, res) {
		Schools.register(new Schools({
			username : req.body.username,
			name: req.body.name,
			"address.city": req.body.city
		}), req.body.password, function(err, school) {
			if (err)
				return res.json({message: 'error', err: err});

			res.json({message: 'success'});
		});
	});
};