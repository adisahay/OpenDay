var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	School = require('../../models/school'),
	passport = require('passport'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/school/setup', function(req, res) {
		res.render('school/setup', {
			gatc: utils.getGATC(),
			name: req.user.name,
			city: req.user.address.city,
			f: req.query.f?req.query.f:1
		});
	});

	app.get('/school/getSchool', function(req, res) {
		School.findOne({
			_id: req.user._id
		},
		function(err, school){
			if (err)
				res.json({message: 'error', err: err});
			else
				res.json({message: 'success', school: school});
		})
	});

	app.post('/school/saveSchool', function(req, res) {
		School.update({
			_id: req.user._id
		},
		{
			modifiedTime: new Date(),
			name: req.body.name,
			contact: req.body.contact,
			address: req.body.address,
			owner: req.body.owner,
			principal: req.body.principal
		},
		function(err, school){
			if (err)
				res.json({message: 'error', err: err});
			else
				res.json({message: 'updated'});
		})
	});
}
