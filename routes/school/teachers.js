var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	School = require('../../models/school'),
	Classrooms = require('../../models/classrooms'),
	Teachers = require('../../models/teachers'),
	passport = require('passport'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/school/teachers', function(req, res) {
		res.render('school/teachers', {
			gatc: utils.getGATC(),
			name: req.user.name,
			city: req.user.address.city
		});
	});

	app.get('/school/getTeachers', function(req, res) {
		Teachers.find({
			school: req.user._id
		})
		.populate('classrooms')
		.exec(function(err, teachers) {
			if (err)
				res.json({message: 'error', err: err});
			else
				res.json({message: 'success', teachers: teachers})
		})
	});

	app.post('/school/addTeacher', function(req, res) {
		Teachers.register(new Teachers({
			username : req.body.username,
			name: req.body.name,
			email: req.body.email,
			classrooms: req.body.classrooms,
			school: req.user._id
		}), req.body.password, function(err, teacher) {
			if (err)
				return res.json({message: 'error', err: err});

			if (req.body.classrooms.length) {
				Classrooms.update(
				{
					_id: {$in: req.body.classrooms}
				},
				{
					classTeacher: teacher._id
				},
				{
					multi: true
				},
				function(err, c){
					if (err)
						return res.json({message: 'error', err: err});
					res.json({message: 'success'});
				})
			} else
				res.json({message: 'success'});
		});
	});

	app.post('/school/updateTeacher', function(req, res) {
		Teachers.update(
		{
			classrooms: {$in: req.body.classrooms}
		},
		{
			$pullAll: {classrooms: req.body.classrooms}
		},
		{
			multi: true
		},
		function(error, tu){
			if (error)
				return res.json({message: 'error', err: error});
			Teachers.update(
			{
				_id: req.body._id
			},
			{
				name: req.body.name,
				username: req.body.username,
				email: req.body.email,
				classrooms: req.body.classrooms
			},
			function(err, t) {
				if (err)
					res.json({message: 'error', err: err});
				else if (t) {
					Classrooms.update(
					{
						classTeacher: req.body._id
					},
					{
						classTeacher: null
					},
					{
						multi: true
					},
					function(er, u){
						if (er)
							return res.json({message: 'error', err: er});
						Classrooms.update(
						{
							_id: {$in: req.body.classrooms}
						},
						{
							classTeacher: req.body._id
						},
						{
							multi: true
						},
						function(e, c){
							if (e)
								return res.json({message: 'error', err: e});

							res.json({message: 'updated'});
						})
					})
				}
			})
		})
	});
}
