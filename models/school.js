var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passportLocalMongoose = require('passport-local-mongoose');

var School = new Schema({
	username: String,
	name: String,
	owner: {
		name: String,
		phone: String
	},
	principal: {
		name: String,
		phone: String
	},
	address: {
		fulladdress: String,
		city: String,
		state: String,
		postal_code: String
	},
	contact: {
		phone: [String],
		email: String
	},
	teachers: [mongoose.Schema.ObjectId],
	classrooms: [mongoose.Schema.ObjectId],

	createdTime: {type: Date, default: Date.now},
	modifiedTime: {type: Date, default: Date.now}
});

School.plugin(passportLocalMongoose);
module.exports = mongoose.model('School', School);
