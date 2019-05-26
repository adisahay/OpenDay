var Classrooms = require("../../models/classrooms");
var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    School = require("../../models/school"),
    Students = require("../../models/students"),
    Broadcasts = require("../../models/broadcasts"),
    emailer = require("../utils/emailer"),
    utils = require('../utils/utils');

module.exports = function(app) {
    app.get('/teachers/broadcast', function(req, res) {
        Classrooms.findOne({
            _id: req.query.classroom
        }, function(err, classroom) {
            if (err || !classroom)
                return res.send("No classroom found");
            res.render('teachers/broadcast', {
                gatc: utils.getGATC(),
                className: classroom.name,
                classroom: classroom._id,
                students: JSON.stringify(classroom.students)
            });
        });
    });

    app.post('/teachers/broadcastEmail', function(req, res) {
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
                classRoom: ObjectId(req.body.classroom)
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

                emailer.sendMail(school.name, req.body.subject, req.body.text, list, school.contact.email, true, req.body.attachment);
                res.json({status: 200});

                Broadcasts.collection.insert({
                    school: ObjectId(school._id),
                    teacher: ObjectId(req.user._id),
                    classroom: ObjectId(req.body.classroom),
                    type: 1,
                    recipients: list,
                    time: new Date(),
                    subject: req.body.subject,
                    body: req.body.text,
                    attachment: JSON.parse(req.body.attachment)
                }, function(err, done) {
                    if (err)
                        console.log("Error saving broadcast details: " + err);
                    else
                        console.log("Broadcast details saved successfully");
                });
            })
        })
    });
};
