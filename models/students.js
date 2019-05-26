var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	School = require('./school'),
	Classrooms = require('./classrooms'),
	Teachers = require('./teachers'),
	Languages = require('./languages');

var Students = new Schema({
	name: String,
	rollNo: {type: String, default: ''},
	address: String,
	dob: {type: Date},
	phone: {
		residence: String,
		parent: String
	},
	admissionEmail: String,
	otp: [{value: String, time: {type: Date, default: Date.now}}],
	email: [{value: String, active: {type: Boolean, default: true}}],
	languages: [{type: Schema.Types.ObjectId, ref: 'Languages'}],
	family: {
		father: {
			name: {type: String, default: ''},
			occupation: String,
			designation: String,
			officeAddress: String,
			phone: {
				office: {type: String, default: ''},
				mobile: String
			},
			emailId: String
		},
		mother: {
			name: {type: String, default: ''},
			occupation: String,
			designation: String,
			officeAddress: String,
			phone: {
				office: {type: String, default: ''},
				mobile: String
			},
			emailId: String
		},
		siblings: [{
			name: String,
			age: Number
		}],
	},
	health: {
		emergency: {
			name: {type: String, default: ''},
			mobile: String
		},
		doctor: {
			name: {type: String, default: ''},
			mobile: String
		},
		immunization: [String],
		dewormed: Date,
		annualMedical: Date,
		healthProblem: String,
		allergies: String,
		delivery: String,
	},
	specialNeed: String,

	/*
		0 - Form Submitted 
		1 - Not Eligible,
		2 - Eligible,
		3 - Rejected,
		4 - Approved,
		5 - Left School
	*/
	status: {type: Number, default: 4},

	school: {type: Schema.Types.ObjectId, ref: 'School'},
	classRoom: {type: Schema.Types.ObjectId, ref: 'Classrooms'},
	classTeacher: {type: Schema.Types.ObjectId, ref: 'Teachers'},

	createdTime: {type: Date, default: Date.now},
	modifiedTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Students', Students);
