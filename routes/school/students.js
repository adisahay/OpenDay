var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	School = require('../../models/school'),
	Teachers = require('../../models/teachers'),
	Classrooms = require('../../models/classrooms'),
	Students = require('../../models/students'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/school/students', function(req, res) {
		res.render('school/students', {
			gatc: utils.getGATC(),
			name: req.user.name,
			city: req.user.address.city
		});
	});

	app.get('/school/getStudents', function(req, res) {
		Classrooms.find(
		{
			school: req.user._id
		},
		function(err, classrooms) {
			if (err)
				return res.json({message: 'error', err: err});

			Students.find(
			{
				school: req.user._id,
				status: 4
			})
			.populate('languages')
			.exec(function(err, students) {
				if (err)
					res.json({message: 'error', err: err});
				else
					res.json({message: 'success', students: students, classrooms: classrooms})
			})
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

	app.post('/school/removeStudent', function(req, res) {
		Students.remove(
		{
			_id: req.body._id
		},
		function(err, s){
			if (err)
				res.json({message: 'error', err: err});
			else if (s){
				res.json({message: 'updated'});
			}
		})
	});

	app.post('/school/updateStudent', function(req, res) {
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
				family: req.body.family,
				email: req.body.email
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

	app.post('/school/assignOrUpdateStudentClass', function(req, res) {
		Students.update(
		{
			school: req.user._id,
			_id: req.body._id
		},
		{
			classRoom: req.body.classRoom,
			modifiedTime: new Date()
		},
		function(err, c) {
			if (err)
				return res.json({message: 'error', err: err});
			if (c) {
				Classrooms.update(
				{
					school: req.user._id,
					students: req.body._id
				},
				{
					$pull: {students: req.body._id},
					modifiedTime: new Date()
				},
				function(er, c) {
					if (er)
						return res.json({message: 'error', err: er});

					Classrooms.update(
					{
						_id: req.body.classRoom
					},
					{
						$push: {students: req.body._id},
						modifiedTime: new Date()
					},
					function(e, cu) {
						if (e)
							return res.json({message: 'error', err: e});

						res.json({message: 'updated'});
					})
				})
			}
		})
	});

	app.post('/school/assignOrUpdateStudentRollNo', function(req, res) {
		Students.update(
		{
			school: req.user._id,
			_id: req.body._id
		},
		{
			rollNo: req.body.rollNo,
			modifiedTime: new Date()
		},
		function(err, c) {
			if (err)
				return res.json({message: 'error', err: err});

			return res.json({message: 'updated'});
		})
	});
}
