var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	School = require('../../models/school'),
	Enquiry = require('../../models/enquiry'),
	utils = require('../utils/utils'),
	ejs = require('ejs'),
	fs = require('fs'),
	admissionFormEmailer = fs.readFileSync('templates/admissionFormEmailer.ejs', 'utf8'),
	nodemailer = require('nodemailer'),
	transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: 'opendaybeta@gmail.com',
			pass: "LxA-sf8-XYD-xRh"
		}
	});

module.exports = function(app) {

	app.get('/school/getEnquiryList', function(req, res) {
		Enquiry.find(
		{
			school: req.user._id
		},
		function(err, enquiry) {
			if (err)
				res.json({message: 'error', err: err});
			else
				res.json({message: 'success', enquiry: enquiry})
		})
	});

	app.post('/school/addEnquiry', function(req, res) {
		var enquiry = new Enquiry(req.body);
		enquiry.school = req.user._id;

		enquiry.save(function(err, e){
			if (err)
				res.json({message: 'error', err: err});
			else if (e) {
				if (req.body.email) {
					let options = {
						to: req.body.email,
						from: req.user.name + ' <opendaybeta@gmail.com>',
						replyTo: req.user.contact.email?req.user.contact.email:'opendaybeta@gmail.com',
						subject: 'Fill Admission Form',
						text: 'Fill admission form at this link https://openday.in',
						html: ejs.render(admissionFormEmailer, {
							name: req.user.name,
						})
					};

					if (req.user.contact.email)
						options.cc = req.user.contact.email;

					transporter.sendMail(options, function(err, resp) {
						if(err)
							console.log(err);
						else {
							console.log("Message response", resp.response);
							console.log("Accepted ", resp.accepted);
							console.log("Rejected ", resp.rejected);
						}
					});
				} else
					console.log('Enquiry form not emailed since no email was there in request body.');

				res.json({message: 'added'});
			}
		})
	});
}
