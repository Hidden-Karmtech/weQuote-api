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
		name: {type: String, required: true},
		givenName: {type: String},
		familyName: {type: String},		
		link: {type: String},
		picture: {type: String},
		gender: {type: String},
		locale: {type: String},
		credits: {type: Number, min: 0}
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