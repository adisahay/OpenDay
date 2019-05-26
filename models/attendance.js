var mongoose = require("mongoose"),
	Schema = mongoose.Schema,
    School = require('./school'),
    Classrooms = require('./classrooms'),
    Students = require('./students'),
    Teachers = require('./teachers'),
    Languages = require('./languages');

var Attendance = new Schema({
    school: {
        type: mongoose.Schema.ObjectId,
        ref: "School"
    },
    classroom: {
        type: mongoose.Schema.ObjectId,
        ref: "Classrooms"
    },
    teacher: {
        type: mongoose.Schema.ObjectId,
        ref: "Teachers"
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: "Students"
    },
	date: {
        type: Date,
        default: Date.now
    },
    absent: {
        type: Boolean,
        default: true
    },
});

module.exports = mongoose.model("Attendance", Attendance);
