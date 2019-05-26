exports.getGATC = function() {
	if (process.env.NODE_ENV == 'production')
		return "UA-110016648-1";
	else
		return "UA-112755479-1";
};