var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Broadcast = new Schema({
    school: {type: Schema.Types.ObjectId, ref: 'School'},
    teacher: {type: Schema.Types.ObjectId, ref: 'Teachers'},
    classroom: [{type: Schema.Types.ObjectId, ref: 'Classrooms'}],
    type: {type: Number, default: 1}, // 0 - SMS, 1 - Email
    recipients: [String],
    time: {type: Date, default: Date.now},
    subject: String,
    body: String,
    attachment: [{
        type: String,
        name: String,
        content: String,
    }],
});

module.exports = mongoose.model('Broadcasts', Broadcast);
