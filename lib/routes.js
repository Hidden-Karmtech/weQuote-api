'use strict';

module.exports.create = function(mongoose, models) {
	var _ = require('underscore'),		
		Utils = require('./Utils'),
		utils = Utils.create(),
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
	 * Elenco di tutti gli autori e numero citazioni per ciascuno di essi
	 */
	var authors = function(request, response) {		
		models.Quote.aggregate([
			{
				$group: {
					_id: '$author',					
					count: { $sum: 1 }
				}
			},
			{
				$sort: {
					_id: 1
				}
			}
		], 
		function(err, result) {
			if (!err) {
				handleResponse(response, 200, _.sortBy(adaptResults(result, 'name'), function(author) {
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
		
		// Valorizza omniSearch
		toInsert.omniSearch = utils.getOmniSearch(toInsert);
		
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
		var search = request.query.search,
			author = request.query.author,
			tag = request.query.tag,
			conditions = {},
			condition,
			searchTokens,
			i,
			maxLimit = request.query.limit || MAX_LIMIT,
			maxlen = request.query.maxlen || 0,
			userProfile = request.query.userProfile || dummyUserProfile;
				
		if (author) {			
			
			// Ricerca per autore
			conditions.$and = [];
			condition = {};
			condition.author = author;
			conditions.$and.push(condition);
		} else if (tag) {		
			
			// Ricerca per tag
			conditions.$and = [];
			condition = {};
			condition['tags.name'] = tag;
			conditions.$and.push(condition);	
		} else if (search) {
			
			// OmniSearch
			// Ricava token da stringa, eliminando quelli minori di 3 caratteri
			searchTokens = search.split(' ');
			searchTokens = _.filter(searchTokens, function(token) {
				return token.length > 2;
			});
			
			// Cerca per token
			conditions.$and = [];
			for (i = 0; i < searchTokens.length; i++) {				
				condition = {};
				condition.omniSearch = eval('/' + searchTokens[i] + '/i');
				conditions.$and.push(condition);					
			}
			
			//TODO: completare
		}		
		
		/*
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
			
			condition = {};
			condition.$where = 'this.text.length < 20';
			conditions.$or.push(condition);			
		}*/
				
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
	 * Elenco di tutti i tag e numero di utilizzo nelle citazioni
	 */
	var tags = function(request, response) {		
		models.Quote.aggregate([
			{
				$project: {
					name: '$tags.name'
				}
			}, 
			{
				$unwind: '$name'
			},
			{
				$group: {
					_id: '$name',					
					count: { $sum: 1 }
				}
			},
			{
				$sort: {
					name: 1
				}
			}
		], 
		function(err, result) {
			if (!err) {
				handleResponse(response, 200, _.sortBy(adaptResults(result, 'name'), function(tag) {
					return tag.name;
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
	var handlePassportAuthentication = function(request, response) {
		handleResponse(response, 200, request.user);
	};
	
	/**
	 * Gestione risposta
	 */
	var handleResponse = function(response, errorCode, toReturn) {
		response.writeHead(errorCode, {"Content-Type": "application/json"});
		response.end(JSON.stringify(toReturn));
	};
	
	/**
	 * Cambia proprietà '_id' dell'array dei risultati da restituire
	 */
	var adaptResults = function(results, keyPropertyName) {
		_.each(results, function(element) {
			element[keyPropertyName] = element._id;
			delete element._id;
		});
		
		return results;
	};
	
	return {
		authors: authors,
		insert: insert,
		list: list,
		tags: tags,
		handlePassportAuthentication: handlePassportAuthentication
	};
};