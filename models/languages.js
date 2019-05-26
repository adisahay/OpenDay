var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Languages = new Schema({
	name: String,
	shortForm: {type: String, default: ''},		/* If any */

	createdTime: {type: Date, default: Date.now},
	modifiedTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Languages', Languages);
