var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	School = require('../../models/school'),
	Students = require('../../models/students'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/parent/admission', function(req, res) {
		School.findOne(
		{
			_id: req.query.sid
		},
		{
			name: 1
		},
		function(err, school){
			if (err || !school)
				return res.send('404 - Not Found');

			res.cookie('sid', req.query.sid);
			res.render('parent/admissions', {
				gatc: utils.getGATC(),
				school: school
			});
		})
	});

	app.post('/parent/submitEmail', function(req, res) {
		School.findOne(
		{
			_id: req.cookies.sid
		},
		function(err, school){
			if (err || !school)
				return res.json({status: 500, message: 'Internal Server Error'});

			Students.findOne(
			{
				school: req.cookies.sid,
				admissionEmail: req.body.email
			},
			function(err, student){
				if (err)
					return res.json({status: 500, message: 'Internal Server Error'});

				if (student) {
					student.otp.push({value: Math.floor(100000 + Math.random() * 900000), time: new Date()});
					student.save(function(err, s){
						if (err)
							return res.json({status: 500, message: 'Internal Server Error'});
						else {
							// send an email and then response back
							res.cookie('pid', s._id.toString());
							res.cookie('pemail', req.body.email);
							return res.json({status: 200});
						}
					})
				} else {
					var student = new Students({
						admissionEmail: req.body.email,
						school: req.cookies.sid,
						otp: []
					})
					student.otp.push({value: Math.floor(100000 + Math.random() * 900000), time: new Date()});
					console.log(student.otp)
					student.save(function(err, s){
						if (err)
							return res.json({status: 500, message: 'Internal Server Error'});
						else {
							// send an email and send response back
							res.cookie('pid', s._id.toString());
							res.cookie('pemail', req.body.email);
							return res.json({status: 200});
						}
					})
				}
			})
		})
	});

	app.post('/parent/verifyOTP', function(req, res) {
		Students.findOne(
		{
			_id: req.cookies.pid,
			school: req.cookies.sid,
			admissionEmail: req.cookies.pemail
		},
		function(err, student){
			if (err)
				return res.json({status: 500, message: 'Internal Server Error'});

			if (student) {
				var otpList = student.otp;
				if (req.body.otp == otpList[otpList.length-1].value) {
					res.cookie('o', true);
					return res.json({status: 200, message: 'OTP Validated'});
				} else{
					res.cookie('o', false);
					return res.json({status: 401, message: 'Wrong OTP.'});				
				}
			} else
				return res.json({status: 404, message: 'No Admission query found against email ' + req.cookies.pemail});
		})
	});

	app.post('/parent/addAdmissionEnquiry', function(req, res) {
		var student = new Students({
			status: 0,
			name: req.body.name,
			school: req.user._id,
			dob: new Date(req.body.dob),
			address: req.body.address,
			phone: req.body.phone,
			languages: req.body.languagest
		});

		student.save(function(err, s){
			if (err)
				res.json({message: 'error', err: err});
			else if (s)
				res.json({message: 'added', _id: s._id})
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
}
