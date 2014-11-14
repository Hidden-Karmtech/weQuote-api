module.exports = function(passport) {
	var GoogleStrategy = require('passport-google').Strategy;
	
	/*passport.use(new GoogleStrategy({
	returnURL: 'http://www.example.com/auth/google/return',
	realm: 'http://www.example.com/'
}, function(identifier, profile, done) {
	// TODO
}));*/
	
	var initGoogleConfig = function() {
	};

	var initFacebookConfig = function() {
	};
	
	return {
		initGoogleConfig: initGoogleConfig,
		initFacebookConfig: initFacebookConfig
	};
	
};