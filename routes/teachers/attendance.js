var Attendance = require("../../models/attendance"),
    School = require("../../models/school")
    Classrooms = require("../../models/classrooms"),
    mongoose = require("mongoose"),
    ObjectId = mongoose.Types.ObjectId,
    emailer = require("../utils/emailer"),
    Students = require("../../models/students"),
    utils = require('../utils/utils');

module.exports = function(app) {
    app.get("/teachers/attendance", function(req, res) {
        Classrooms.findOne({
            _id: req.query.classroom
        }, function(err, classroom) {
            if (err || !classroom)
                return res.send("No classroom found");
            res.render("teachers/attendance", {
                gatc: utils.getGATC(),
                classroom: classroom._id,
                students: JSON.stringify(classroom.students)
            });
        });
    });

    app.get("/teachers/getAttendance", function(req, res) {
        console.log("/teachers/getAttendance called");

        var date = new Date();
        if (req.query.date)
            date = new Date(req.query.date);
        var sdate = new Date(date), edate = new Date(date);
        sdate.setHours(0, 0, 0, 0); edate.setHours(23, 59, 59, 999);
        
        Attendance.aggregate([{
            $match: {
                school: req.user.school,
                teacher: req.user._id,
                classroom: ObjectId(req.query.classroom),
                date: {
                    $gte: sdate,
                    $lte: edate
                }
            }
        }, {
            $group: {
                _id: {
                    "school": "$school",
                    "teacher": "$teacher",
                    "classroom": "$classroom"
                },
                records: {
                    $push: {
                        student: "$student",
                        absent: "$absent"
                    }
                }
            }
        }], function(err, attendance) {
            if (err || !attendance || attendance.length == 0)
                return res.json([]);
            return res.json(attendance[0]);
        });
    });

    app.post("/teachers/saveAttendance", function(req, res) {
        console.log("/teachers/saveAttendance called");
        if (!req.isAuthenticated())
            return res.send("request not authorized");
        var date = new Date(req.query.date);
        var startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        var endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        var presentees = [], absentees = [];
        var attendance = JSON.parse(req.query.attendance);
        var records = [];
        for (let stud = 0; stud < attendance.length; stud++) {
            records.push({
                school: req.user.school,
                classroom: ObjectId(req.query.classroom),
                teacher: req.user._id,
                date: date,
                absent: Boolean(attendance[stud].absent),
                student: ObjectId(attendance[stud]._id)
            });
            if (attendance[stud].absent)
                absentees.push(ObjectId(attendance[stud]._id));
            else
                presentees.push(ObjectId(attendance[stud]._id));
        }
        
        Attendance.findOne({
            classroom: ObjectId(req.query.classroom),
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            school: req.user.school,
            teacher: req.user._id
        }, function(err, atten) {
            if (err) {
                console.log("error finding attendance: " + err);
                return res.send("Error finding attendance");
            }
            
            if (!atten) {
                Attendance.collection.insert(records, function(err, done) {
                    if (err) {
                        console.log("error inserting attendance: " + err);
                        return res.send("Error inserting attendance");
                    }
                    return res.send({status: 200});
                });
            } else {
                Attendance.update({
                    school: req.user.school,
                    classroom: ObjectId(req.query.classroom),
                    teacher: req.user._id,
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                    student: {$in: absentees}
                }, {
                    absent: true
                }, {
                    multi: true
                }, function(err, absents) {
                    if (err) {
                        return res.send(err);
                    }
                    
                    Attendance.update({
                        school: req.user.school,
                        classroom: ObjectId(req.query.classroom),
                        teacher: req.user._id,
                        date: {
                            $gte: startOfDay,
                            $lte: endOfDay,
                        },
                        student: {$in: presentees}
                    }, {
                        absent: false
                    }, {
                        multi: true
                    }, function(err, presents) {
                        if (err)
                            return res.send(err);
                        return res.send({status: 200})
                    });
                });
            }
        });
    });

    app.post('/teachers/notifyAbsents', function(req, res) {
        console.log("/teachers/notifyAbsents called");
        School.findOne({
            _id: ObjectId(req.user.school)
        },
        {
            name: 1,
            contact: 1
        },
        function(e, school){
            if(e)
                return res.json({message: e});

            Students.find(
            {
                _id: {$in: req.body.absentees}
            },
            {
                email: 1
            },
            function(err, students) {
                if (err)
                    return res.json({message: err});

                var list = [];
                students.forEach(function(s){
                    s.email.forEach(function(e){
                        list.push(e.value);
                    })
                })

                emailer.sendMail(school.name, req.body.subject, req.body.text, list, school.contact.email, false, req.body.attachment);
                return res.json({status: 200});
            })
        })
    });
};
