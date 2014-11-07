'use strict';

module.exports = function(mongoose) {
	var models = require('./models')(mongoose);

	/**
	 * Elenco citazioni.
	 * In ingresso arriva il parametro 'search', che rappresenta la ricerca dell'utente
	 * (può essere un autore, un tag o un testo di una citazione).
	 * Restituisce un elenco di citazioni che soddisfano la ricerca.
	 */
	var list = function(request, response) {
		console.log(request.query.search);
		models.Quote.find(null, null, null, function (err, docs) {
			if (!err) {
				handleResponse(response, 200, docs);
			} else {
				handleResponse(response, 500, {
					error: err
				});
			}
		});
	};

	/**
	 * Inserimento di una nuova citazione.
	 * In ingresso arriva il parametro 'quote', che rappresenta il modello da inserire.
	 * Restituisce il modello inserito.
	 */
	var insert = function(request, response) {
		var quote,
			toInsert = request.body.quote;
						
		quote = new models.Quote(toInsert);
		quote.save(function(err, inserted, affected) {
			if (!err && 1 === affected) {
				handleResponse(response, 200, inserted);
			} else {
				handleResponse(response, 500, {
					error: err
				});
			}
		});
	};
	
	var handleResponse = function(response, errorCode, toReturn) {
		response.writeHead(errorCode, {"Content-Type": "application/json"});
		response.end(JSON.stringify(toReturn));
	};
	
	return {
		list: list,
		insert: insert
	};
};