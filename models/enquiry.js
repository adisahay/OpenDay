var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	School = require('./school');

var Enquiry = new Schema({
	name: String,
	email: {type: String, default: ''},
	phone: String,
	message: String,

	school: {type: Schema.Types.ObjectId, ref: 'School'},

	createdTime: {type: Date, default: Date.now},
	modifiedTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Enquiry', Enquiry);
