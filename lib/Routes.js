'use strict';

module.exports.create = function(mongoRepository) {
	var _ = require('underscore'),
	    Analytics = require('./Analytics'),
	    analytics = Analytics.create(),
	    key = process.env.AUTH_KEY || require("./local").AUTH_KEY;
	
	/**
	 * Elenco di tutti gli autori e numero citazioni per ciascuno di essi
	 */
	var authors = function(request, response) {		
		mongoRepository.authors(request.query.maxlen, function(err, result) {			
			handleResponse(response, err, _.sortBy(adaptResults(result), function(author) {
				return author;
			}));
		});
	};
	
	/**
	 * Pulizia citazioni
	 */
	var clean = function(request, response) {		
		mongoRepository.clean(function(err, result) {
			handleResponse(response, err, result);
		});
	};
	
	/**
	 * Handshake
	 */
	var handshake = function(request, response) {		
		mongoRepository.handshake(function(err, result) {
			handleResponse(response, err, result);
		});
	};
	
	/**
	 * Inserimento di una nuova citazione
	 */
	var insert = function(request, response) {		
		if (key === request.headers['x-authkey']) {
			mongoRepository.insert(request.body.quote, function(err, result) {
				handleResponse(response, err, result);
			});			
		} else {
			response.send(401);
		}
	};
	
	/**
	 * Elenco citazioni
	 */
	var list = function(request, response) {
		var options = {
			search: request.query.search,
			author: request.query.author,
			tag: request.query.tag,
			limit: request.query.limit,
			maxlen: request.query.maxlen,
			deviceUUID: request.query.deviceUUID,
			userProfile: request.query.userProfile
		};
		
		mongoRepository.list(options, function(err, result) {
			if (result.length === 0) {
				analytics.insertNoResult(options);				
			}
			analytics.insertSearch(options);
			
			handleResponse(response, err, result);
		});
				
	};
	
	/**
	 * Controlla esistenza citazione
	 */
	var quoteExists = function(request, response) {
		mongoRepository.quoteExists(request.query.search, function(err, result) {
			handleResponse(response, err, result);
		});
	};
	
	/**
	 * Cancella citazione per id
	 */
	var remove = function(request, response) {
		if (key === request.headers['x-authkey']) {
			mongoRepository.remove(request.body.quoteId, function(err, result) {
				handleResponse(response, err, result);
			});
		} else {
			response.send(401);
		}
	};
	
	/**
	 * Rimozione citazioni errate
	 */
	var removeWrongQuotes = function(request, response) {
		mongoRepository.removeWrongQuotes(function(err, result) {
			handleResponse(response, err, result);
		});
	};
	
	/**
	 * Condivisione citazione
	 */
	var share = function(request, response) {
		var options = {
			quoteId: request.body.quoteId,
			deviceUUID: request.body.deviceUUID,
			userProfile: request.body.userProfile
		}; 
		
		mongoRepository.share(options, function(err, result) {
			analytics.insertShare(options);
			handleResponse(response, err, result);
		});		
	};
	
	/**
	 * Elenco di tutti i tag e numero di utilizzo nelle citazioni
	 */
	var tags = function(request, response) {		
		mongoRepository.tags(request.query.maxlen, function(err, result) {
			handleResponse(response, err, _.sortBy(adaptResults(result),function(tag) {
				return tag.name;
			}));
		});
	};
	
	/**
	 * Aggiorna citazione
	 */
	var update = function(request, response) {		
		if (key === request.headers['x-authkey']) {
			mongoRepository.update(request.body.quoteId, request.body.newQuote, function(err, result) {
				handleResponse(response, err, result);
			});
		} else {
			response.send(401);
		}
	};
	
	/**
	 * Gestione risposta
	 */
	var handleResponse = function(response, err, result) {
		var returnCode,
			returnMsg;
		
		if (err) {
			returnCode = 500;
			returnMsg = { error: result };
		} else {
			returnCode = 200;
			returnMsg = result;
		}
		
		response.writeHead(returnCode, { "Content-Type": "application/json; charset=utf-8" });
		response.end(JSON.stringify(returnMsg));
	};
	
	var adaptResults = function(results) {
		results = _.filter(results, function(element) {
			return element.value > 0;
		});
		
		_.each(results, function(element) {
			element['name'] = element._id;
			element['count'] = element.value;
			delete element._id;
			delete element.value;
		});
		
		return results;
	};
	
	return {
		authors: authors,
		clean: clean,
		handshake: handshake,
		insert: insert,
		list: list,
		quoteExists: quoteExists,
		remove: remove,
		removeWrongQuotes: removeWrongQuotes,
		share: share,		
		tags: tags,
		update: update
	};
};