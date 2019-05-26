var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	School = require('./school'),
	Teachers = require('./teachers'),
	Students = require('./students');

var Classrooms = new Schema({
	name: String,
	classTeacher: {type: mongoose.Schema.ObjectId, ref: 'Teachers'},
	subCT: {type: mongoose.Schema.ObjectId, ref: 'Teachers'},
	assistantCT: String,
	students: [{type: mongoose.Schema.ObjectId, ref: 'Students'}],
	maxRollCount: {type: Number, default: 50},
	school: {type: mongoose.Schema.ObjectId, ref: 'School'},

	createdTime: {type: Date, default: Date.now},
	modifiedTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Classrooms', Classrooms);
