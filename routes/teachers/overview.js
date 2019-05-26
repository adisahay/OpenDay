var Students = require("../../models/students"),
    Classrooms = require("../../models/classrooms"),
    utils = require('../utils/utils');

module.exports = function(app) {
    app.get('/teachers/overview', function(req, res) {
        Classrooms.find({
            school: req.user.school,
            classTeacher: req.user._id
        }, function(err, classrooms) {
            if (err || !classrooms)
                res.render({
                    gatc: utils.getGATC(),
                    teacherName: req.user.name,
                    classrooms: {name: "No class assigned"}
                });
            res.render('teachers/overview', {
                gatc: utils.getGATC(),
                teacherName: req.user.name,
                classrooms: JSON.stringify(classrooms),
                currentClassroomId: (req.query.classroom ? req.query.classroom : classrooms[0]._id)
            });
        });
    });

    app.get("/teachers/students", function(req, res) {
        console.log("/teachers/students called");
        Classrooms.find({
            _id: req.query.classroom
        }, {
            students: 1
        }, function(classError, classrooms) {
            if (classError || !classrooms) {
                console.log("Error finding classrooms: " + classError);
                return res.json([]);
            }
            
            var studentIds = [];
            for (let room = 0; room < classrooms.length; room++)
                studentIds = studentIds.concat(classrooms[room].students)
            
            Students.find({
                _id: {$in: studentIds}
            }, {
                name: 1,
                rollNo: 1
            }, function(err, students) {
                if (err) {
                    console.log("Error finding students: " + err);
                    return res.send(err);
                } else if (!students) {
                    console.log("no student found");
                    return res.json([]);
                }
                return res.json(students);
            });
        });
    });

    app.get("/teachers/getClassrooms", function(req, res) {
        console.log("/teachers/getClassrooms called");

        Classrooms.find({
            classTeacher: req.user._id
        }, function(err, classrooms) {
            if (err || !classrooms)
                return res.json([]);
            return res.json(classrooms);
        });
    });
};
