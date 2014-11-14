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
	
	/**
	 * Modelli
	 */
	var Quote = mongoose.model('Quote', QuoteSchema);
	
	return {
		Quote: Quote
	};
};