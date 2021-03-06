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
		var optionsAnalytics = {},
			options = {
			search: request.query.search,
			author: request.query.author,
			tag: request.query.tag,
			limit: request.query.limit,
			maxlen: request.query.maxlen,
			deviceUUID: request.query.deviceUUID,
			userProfile: request.query.userProfile
		};
		
		mongoRepository.list(options, function(err, result) {									
			optionsAnalytics.deviceUUID = options.deviceUUID;
			optionsAnalytics.userProfile = options.userProfile;
			optionsAnalytics.event = 'search';
			optionsAnalytics.data = {
				nresults: result.length,
				search: options.search,
				author: options.author,
				tag: options.tag,
			};
								
			analytics.insertLogEvent(optionsAnalytics);				
			handleResponse(response, err, result);
		});				
	};
	
	/**
	 * Log evento
	 */
	var logEvent = function(request, response) {
		var options = {
			deviceUUID: request.body.deviceUUID,
			event: request.body.event,
			userProfile: request.body.userProfile,
			data: request.body
		}; 
		
		mongoRepository.logEvent(options, function(err, result) {
			analytics.insertLogEvent(options);
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
	 * Deprecato
	 */
	var share = function(request, response) {
		var options = {			
			deviceUUID: request.body.deviceUUID,
			userProfile: request.body.userProfile,
			event: 'share',
			data: request.body
		}; 
				
		mongoRepository.share(options, function(err, result) {
			analytics.insertLogEvent(options);
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
		logEvent: logEvent,
		quoteExists: quoteExists,
		remove: remove,
		removeWrongQuotes: removeWrongQuotes,
		share: share,		
		tags: tags,
		update: update
	};
};