var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	Broadcasts = require('../../models/broadcasts'),
	School = require('../../models/school'),
	Students = require('../../models/students'),
    emailer = require("../utils/emailer"),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get('/school/broadcasts', function(req, res) {
		res.render('school/broadcasts', {
			gatc: utils.getGATC(),
			name: req.user.name,
			city: req.user.address.city
		});
	});

	app.get('/school/getBroadcasts', function(req, res) {
		Broadcasts.find(
		{
			school: req.user._id
		})
		.populate('classrooms teacher')
		.exec(function(err, broadcasts) {
			if (err)
				res.json({message: 'error', err: err});
			else
				res.json({message: 'success', broadcasts: broadcasts})
		})
	});

	app.post('/school/broadcastEmail', function(req, res) {
        School.findOne(
        {
            _id: ObjectId(req.user._id)
        },
        {
            name: 1,
            contact: 1,
            classrooms: 1
        },
        function(e, school){
            if(e)
                return res.json({message: e});

            Students.find(
            {
                school: ObjectId(req.user._id)
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
                res.json({status: 200, message: 'Sucessfully sent emails.'});

                Broadcasts.collection.insert({
                    school: ObjectId(school._id),
                    classroom: school.classrooms,
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
}
