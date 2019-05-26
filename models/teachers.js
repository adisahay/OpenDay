var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Languages = require('./languages'),
	passportLocalMongoose = require('passport-local-mongoose');

var Teachers = new Schema({
	username: String,
	name: String,
	phone: String,
	email: String,
	school: {type: Schema.Types.ObjectId, ref: 'School'},
	classrooms: [{type: Schema.Types.ObjectId, ref: 'Classrooms'}],
	students: [{type: Schema.Types.ObjectId, ref: 'Students'}],

	languages: [{type: Schema.Types.ObjectId, ref: 'Languages'}],

	createdTime: {type: Date, default: Date.now},
	modifiedTime: {type: Date, default: Date.now}
});

Teachers.plugin(passportLocalMongoose);
module.exports = mongoose.model('Teachers', Teachers);
