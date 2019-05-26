var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	School = require('../../models/school'),
	Students = require('../../models/students'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/school/admissions', function(req, res) {
		res.render('school/admissions', {
			gatc: utils.getGATC(),
			name: req.user.name,
			city: req.user.address.city
		});
	});

	app.get('/school/appliedForAdmission', function(req, res) {
		Students.find(
		{
			school: req.user._id,
			status: 0
		})
		.populate('languages')
		.exec(function(err, students) {
			if (err)
				res.json({message: 'error', err: err});
			else
				res.json({message: 'success', students: students})
		})
	});

	app.post('/school/addStudent', function(req, res) {
		var student = new Students({
			name: req.body.name,
			school: req.user._id,
			dob: new Date(req.body.dob),
			address: req.body.address,
			phone: req.body.phone,
			languages: req.body.languages
		});

		student.save(function(err, s){
			if (err)
				res.json({message: 'error', err: err});
			else if (s)
				res.json({message: 'added', _id: s._id})
		})
	});

	app.post('/school/updateAdmissionForm', function(req, res) {
		var update = {};
		if (req.query.student) {
			update = {
				name: req.body.name,
				dob: new Date(req.body.dob),
				address: req.body.address,
				phone: req.body.phone,
				languages: req.body.languages
			};
		} else if (req.query.family) {
			update = {
				family: req.body.family
			}
		} else if (req.query.health) {
			update = {
				health: req.body.health,
				specialNeed: req.body.specialNeed
			}

			update.health.dewormed = new Date(req.body.health.dewormed);
			update.health.annualMedical = new Date(req.body.health.annualMedical);
		}

		update.modifiedTime = new Date();

		Students.update(
		{
			_id: req.body._id
		},
		update,
		function(err, c) {
			if (err)
				res.json({message: 'error', err: err});
			else if (c)
				res.json({message: 'updated'});
		})
	});
}
