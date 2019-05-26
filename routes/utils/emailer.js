var nodemailer = require('nodemailer'),
	transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: 'opendaybeta@gmail.com',
			pass: "LxA-sf8-XYD-xRh"
		}
	});

exports.sendMail = function(name, subject, text, list, replyTo, cc, attachment) {
	let options = {
		//to: list,
		bcc: list.toString(),
		from: name + ' <opendaybeta@gmail.com>',
		replyTo: replyTo?replyTo:'opendaybeta@gmail.com',
		subject: subject,
		html: text,
		text: text,
		attachment: attachment
	};

	if (replyTo && cc)
		options.cc = replyTo;

	transporter.sendMail(options, function(err, resp) {
		if(err)
			console.log(err);
		else {
			console.log("Message response", resp.response);
			console.log("Accepted ", resp.accepted);
			console.log("Rejected ", resp.rejected);
		}
	});
}
