'use strict';

module.exports = function(mongoose, models) {
	var _ = require('underscore'),		
		MAX_LIMIT = 50;
	
	var dummyUserProfile = { 
		"__v" : 0 , 
		"_id" : { 
			"$oid" : "546ca41c1faaa000007e9655"
		}, 
		"familyName" : "di Prova", 
		"gender" : "male", 
		"givenName" : "Utente", 
		"id" : "111520471837709045589", 
		"link" : "https://plus.google.com/+UtentediProva", 
		"locale" : "it", 
		"name" : "Utente di Prova", 
		"picture" : "https://lh5.googleusercontent.com/-3UukMNBe6nw/AAAAAAAAAAI/AAAAAAAAAlg/asdfasdf/photo.jpg", 
		"provider" : "google",
		"credits": 0
	};
	
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
			skip = Math.floor((Math.random() * (count - limit)) + 1);
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
		
		console.log(JSON.stringify(toInsert));
		
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
			maxLimit = request.query.limit || MAX_LIMIT,
			userProfile = request.query.userProfile || dummyUserProfile;
		
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
				models.Quote.findRandom(conditions, null, getFindOptions(count, maxLimit), function (err, docs) {
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
		
		//TODO: sistemare
		
		/*models.Quote.aggregate({
			$project: {
				name: '$tag.name'
			},
			$group: {
				_id: 'name',
				count: { $sum: 1 }
			}}, function(err, result) {
				if (!err) {
					handleResponse(response, 200, _.sortBy(result, function(tag) {
						return tag.name;
					}));
				} else {
					handleResponse(response, 500, {
						error: err
					});
				}
			}
		);*/
	};
	
	/**
	 * Gestione risposta passport per autenticazione
	 */
	var handlePassportAuthentication = function(request, response) {
		handleResponse(response, 200, request.user);
	};
	
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