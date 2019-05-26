var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Subscription = new Schema({
	email: String
});

module.exports = mongoose.model('Subscription', Subscription)
