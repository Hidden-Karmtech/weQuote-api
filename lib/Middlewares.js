module.exports.create = function() {
	var forceHttps = function(req, res, next) {
		var schema = req.headers['x-forwarded-proto'];
		
		if (process.env.OPENSHIFT_NODEJS_IP) {	
			if (schema === 'https') {	
				next();
			} else {    
				res.redirect('https://' + req.headers.host + req.url);
			}
		} else {
			next();
		}
	};

	return {
		forceHttps: forceHttps
	};	
};