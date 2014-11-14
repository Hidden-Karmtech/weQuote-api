var forceHttps = function(req, res, next) {
	var schema = req.headers['x-forwarded-proto'];
	
	if (schema === 'https') {	
		next();
	} else {    
		res.redirect('https://' + req.headers.host + req.url);
	}
};

module.exports = {
	forceHttps: forceHttps
};