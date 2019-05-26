var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	Attendance = require('../../models/attendance'),
	School = require('../../models/school'),
	Teachers = require('../../models/teachers'),
	Classrooms = require('../../models/classrooms'),
	Students = require('../../models/students'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/school/attendance', function(req, res) {
		res.render('school/attendance', {
			gatc: utils.getGATC(),
			name: req.user.name,
			city: req.user.address.city
		});
	});

	app.get('/school/getAttendance', function(req, res) {
		Classrooms.find(
		{
			school: req.user._id
		},
		{
			name: 1
		},
		function(err, classrooms) {
			if (err)
				return res.json({message: 'error', err: err});

			var sDate = new Date(),
				eDate = new Date();
			sDate.setHours(0,0,0,0);
			eDate.setHours(23,59,59,999);

			if (req.query.date) {
				sDate = new Date(req.query.date);
				eDate = new Date(req.query.date);
				sDate.setHours(0,0,0,0);
				eDate.setHours(23,59,59,999);
			}

			Attendance.find(
			{
				date: {$gte: sDate, $lte: eDate},
				school: req.user._id
			})
			.populate('student', 'name rollNo')
			.populate('classroom', 'name')
			.exec(function(err, attendance) {
				if (err)
					return res.json({message: 'error', err: err});

				res.json({message: 'success', attendance: attendance, classrooms: classrooms});
			})
		})
	});
}
