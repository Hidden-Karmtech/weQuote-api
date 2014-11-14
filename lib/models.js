'use strict';

module.exports = function(mongoose) {
	
	/**
	 * Schemi
	 */
	var QuoteSchema = new mongoose.Schema({
		text: {type: String, required: true},
		author: {type: String, required: true},
		tags: [{
			name: {type: String, required: true}
		}],
		source: String
	}, {
		collection: 'quote'
	});
	
	var UserProfileSchema = new mongoose.Schema({
		provider: {type: String, required: true},
		id: {type: String, required: true},
		displayName: {type: String, required: true},
		name: {
			familyName: {type: String},
			givenName: {type: String},
			middleName: {type: String},
		},
		emails: [{
			value: {type: String},
			type: {type: String}
		}],
		photos: [{
			value: {type: String},			
		}]
	}, {
		collection: 'userProfile'
	}); 
	
	/**
	 * Modelli
	 */
	var Quote = mongoose.model('Quote', QuoteSchema),
		UserProfile = mongoose.model('UserProfile', UserProfileSchema);
	
	return {
		Quote: Quote,
		UserProfile: UserProfile
	};
};