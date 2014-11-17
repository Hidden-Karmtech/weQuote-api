'use strict';

module.exports = function(mongoose) {
	var models = require('./models')(mongoose),
		_ = require('underscore'),
		MAX_LIMIT = 50;

	/**
	 * Elenco di tutti gli autori
	 */
	var authors = function(request, response) {		
		models.Quote.distinct('author', function(err, result) {
			if (!err) {				
				handleResponse(response, 200, _.sortBy(result, function(author) {
					return author;
				}));
			} else {
				handleResponse(response, 500, {
					error: err
				});
			}
		});		
	};
	
	/**
	 * Restituisce l'oggetto options con valori randomici per la find
	 */
	var getFindOptions = function(count, maxLimit) {
		var skip,
			limit;
		
		if (count < maxLimit) {
			limit = count;
			skip = 0;
		} else {
			limit = maxLimit;
			skip = Math.floor((Math.random() * count - limit) + 1);
		}
		
		return {
			skip: skip,
			limit: limit
		};
	};

	/**
	 * Inserimento di una nuova citazione.
	 * In ingresso arriva il parametro 'quote', che rappresenta il modello da inserire.
	 * Restituisce il modello inserito.
	 */
	var insert = function(request, response) {
		var quote,
			toInsert = request.body.quote,
			i;
		
		// Mette i tag in minuscolo
		for (i = 0; i < toInsert.tags.length; i++) {
			toInsert.tags[i].name = toInsert.tags[i].name.toLowerCase();
		}
			 
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
	
	/**
	 * Elenco citazioni.
	 * In ingresso arriva il parametro 'search', che rappresenta la ricerca dell'utente
	 * (può essere un autore, un tag o un testo di una citazione).
	 * Restituisce un elenco di citazioni che soddisfano la ricerca.
	 */
	var list = function(request, response) {
		var search = eval('/' + request.query.search + '/i'),
			conditions = {},
			condition,
			maxLimit = request.query.limit || MAX_LIMIT;
		
		if (request.query.search) {		
			conditions.$or = [];
					
			// Ricerca per testo
			condition = {};
			condition.text = search;
			conditions.$or.push(condition);
			
			// Ricerca per tags
			condition = {};
			condition['tags.name'] = search;
			conditions.$or.push(condition);
	
			// Ricerca per autore
			condition = {};
			condition.author = search;
			conditions.$or.push(condition);
		}
		
		// Conta numero elementi
		models.Quote.count(conditions, function(err, count) {
			if (!err) {
				
				// Cerca elementi
				models.Quote.find(conditions, null, getFindOptions(count, maxLimit), function (err, docs) {
					if (!err) {
						handleResponse(response, 200, docs);
					} else {
						handleResponse(response, 500, {
							error: err
						});
					}
				});
			} else {
				handleResponse(response, 500, {
					error: err
				});
			}
		});		
	};
	
	/**
	 * Elenco di tutti i tags
	 */
	var tags = function(request, response) {
		models.Quote.distinct('tags.name', null, function(err, result) {
			if (!err) {
				handleResponse(response, 200, _.sortBy(result, function(tag) {
					return tag;
				}));
			} else {
				handleResponse(response, 500, {
					error: err
				});
			}
		});
	};
	
	/**
	 * Gestione risposta passport per autenticazione
	 */
	var handlePassportAuthentication = function(request, reponse) {
		//
	}
	
	var handleResponse = function(response, errorCode, toReturn) {
		response.writeHead(errorCode, {"Content-Type": "application/json"});
		response.end(JSON.stringify(toReturn));
	};
	
	return {
		authors: authors,
		insert: insert,
		list: list,
		tags: tags,
		handlePassportAuthentication: handlePassportAuthentication
	};
};