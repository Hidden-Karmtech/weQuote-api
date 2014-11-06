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
	
	/*
	 * Mock
	 */
	var insertMockData = function() {		
		var quote;
		
		quote = new Quote({
			text: "Innamorarsi è lasciare i piedi vagare per le lande senza una bussola: gli occhi sono l'unica realtà.",
			author: "Jim Morrison",
			tags: [{
				name: "musica"
			}, {
				name: "poesia"
			}],
			source: "http://it.wikiquote.org/wiki/Jim_Morrison"
		});
		quote.save();		
	};
	
	return {
		Quote: Quote,
		insertMockData: insertMockData
	};	
};