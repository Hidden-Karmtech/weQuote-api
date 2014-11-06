module.exports = function(mongoose) {
	var models = require('./lib/models')(mongoose);

	/**
	 * Elenco citazioni
	 */
	var list = function(request, response) {
		
	};

	/**
	 * Inserimento di una nuova citazione
	 */
	var insert = function(request, response) {
		quote = new models.Quote(request.params['quote']);
		quote.save();		
	};

	return {
		list: list,
		insert: insert
	};
};