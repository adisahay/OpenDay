var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	Languages = require('../../models/languages'),
	utils = require('../utils/utils');

module.exports = function(app) {
	app.get("/admin/languages", function(req, res) {
		res.render('admin/languages', {
			gatc: utils.getGATC()
		})
	});

	app.get("/admin/getLanguages", function(req, res) {
		Languages.find(
		{},
		function(err, languages) {
			if (err)
				return res.json({message: 'error', err: err});

			return res.json({message: 'success', languages: languages});
		})
	});

	app.post("/admin/addLanguage", function(req, res) {
		var language = new Languages(req.body);

		language.save(function(err, l){
			if (err)
				return res.json({message: 'error', err: err});
			return res.json({message: 'success'});
		})
	});

	app.post("/admin/updateLanguage", function(req, res) {

		Languages.update(
		{
			_id: ObjectId(req.body._id)
		},
		{
			name: req.body.name,
			shortForm: req.body.shortForm
		},
		function(err, l){
			if (err)
				return res.json({message: 'error', err: err});
			console.log(l)
			return res.json({message: 'success'});
		})
	});
};