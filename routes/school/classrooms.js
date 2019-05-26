var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	School = require('../../models/school'),
	Teachers = require('../../models/teachers'),
	Classrooms = require('../../models/classrooms'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/school/classrooms', function(req, res) {
		res.render('school/classrooms', {
			gatc: utils.getGATC(),
			name: req.user.name,
			city: req.user.address.city
		});
	});

	app.get('/school/getClassrooms', function(req, res) {
		Classrooms.find({
			school: req.user._id
		})
		.populate('classTeacher')
		.populate('subCT')
		.exec(function(err, classrooms) {
			if (err)
				res.json({message: 'error', err: err});
			else
				res.json({message: 'success', classrooms: classrooms})
		})
	});

	app.post('/school/addClassroom', function(req, res) {
		var classroom = new Classrooms({
			name: req.body.name,
			classTeacher: req.body.classTeacher,
			subCT: req.body.subCT,
			school: req.user._id
		});

		classroom.save(function(err, c){
			if (err)
				return res.json({message: 'error', err: err});

			if (c) {
				Teachers.update(
				{
					_id: req.body.classTeacher
				},
				{
					$push: {classrooms: c._id}
				},
				function(e, t) {
					if (e)
						return res.json({message: 'error', err: e});
					res.json({message: 'added'});
				})
			}
		})
	});

	app.post('/school/updateClassroom', function(req, res) {
		Classrooms.update(
		{
			_id: req.body._id
		},
		{
			name: req.body.name,
			subCT: req.body.subCT,
			classTeacher: req.body.classTeacher
		},
		function(err, c) {
			if (err)
				return res.json({message: 'error', err: err});

			Teachers.update(
			{
				classrooms: req.body._id
			},
			{
				$pull: {classrooms: req.body._id}
			},
			{
				multi: true
			},
			function(er, u){
				if (er)
					return res.json({message: 'error', err: er});

				Teachers.update(
				{
					_id: req.body.classTeacher
				},
				{
					$push: {classrooms: req.body._id}
				},
				function(e, t) {
					if (e)
						return res.json({message: 'error', err: e});
					res.json({message: 'updated'});
				})
			})
		})
	});
}
