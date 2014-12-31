'use strict';

module.exports.create = function(mongoose, models) {
	var _ = require('underscore'),	
		q = require('q'),
		async = require('async'),
		moment = require('moment'),
		Utils = require('./Utils'),
		utils = Utils.create(),
		MAX_LIMIT = 50,
		MAX_LEN = 9999,
		MIN_LEN = 15;
	
	var systemProfile = { 
		"__v" : 0 , 
		"_id" : { 
			"$oid" : "5473270c5ac1ed0000e3e18d"
		}, 
		"familyName" : "system", 
		"gender" : "male", 
		"givenName" : "system", 
		"id" : "111520471837709045589", 
		"link" : "", 
		"locale" : "it", 
		"name" : "system", 
		"picture" : "", 
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
				handleResponse(response, 500, { error: err });
			}
		});				
	};
		
	/**
	 * Pulizia citazioni
	 */
	var clean = function(request, response) {		
		models.Quote.find({}, function(err, docs) {
			if (!err) {
				docs.forEach(function(elem, index, array) {
					
					// Pulisce i tag
					_.each(elem.tags, function(tag) {
						tag.name = utils.cleanTagName(tag.name);
					});
					
					// Trim author
					elem.author = elem.author.trim();
					
					// Valorizza campo omniSearch
					elem.omniSearch = utils.getOmniSearch(elem);
					
					elem.save();					
				});				
				
				handleResponse(response, 200, docs.length);
			} else {
				handleResponse(response, 500, { error: err });
			}			
		});
	};
	
	/**
	 * Handshake
	 */
	var handshake = function(request, response) {		
		handleResponse(response, 200, moment().toDate());
	};

	/**
	 * Rimozione citazioni errate
	 * - Testo troppo corto
	 * - Autore con iniziali non alfanumeriche 
	 * - Citazioni doppie
	 */
	var removeWrongQuotes = function(request, response) {
		var count = 0,
			functions = [];
		
		models.Quote.find({}, function(err, docs) {
			if (!err) {
				console.log("Numero totale di citazioni: " + docs.length);
				
				docs.forEach(function(elem, index, array) {	
					functions.push(function(callback) {
						checkWrongQuote(elem).then(function(promiseResult) {
							count++;
							callback(null, true);
						}, function(promiseError) {
							callback(null, false);
						});
					});
				});			
				
				async.series(functions, function(errAsync, results) {
					if (errAsync) {
						handleResponse(response, 500, { error: errAsync });
					} else {
						console.log("Citazioni rimosse: " + count);
						handleResponse(response, 200, count);						
					}
				});
				
			} else {
				handleResponse(response, 500, { error: err });
			}
		});
	};
	
	var checkWrongQuote = function(quote) {
		var toRemove,
			deferred = q.defer();

		countElements(models.Quote, { 'text': quote.text }).then(function(result) {
			
			// Rimuove citazioni doppie
			toRemove = result > 1;
			
			// Autore con iniziali non alfanumeriche 
			if(quote.author.search(/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝßĀĂĄĆĈĊČĎĒĔĖĘĚĜĞĢĤ]/) !== 0) {						
				toRemove = true;
			}					
			
			// Testo troppo corto
			if (quote.text.length < MIN_LEN) {						
				toRemove = true;
			}
			
			if (toRemove) {
				quote.remove(function(err) {
					if (err) {
						deferred.reject();
					} else {
						deferred.resolve();
					}
				});
			} else {
				deferred.reject();
			}															
		});
		
		return deferred.promise;
	};
		
	/**
	 * Cancella citazione per id
	 * In ingresso arriva il parametro 'quoteId', che rappresenta l'id dela citazione 
	 */
	var removeQuote = function(request, response) {
		var quoteId = request.body.quoteId;			
				
		models.Quote.findOne({ "_id": quoteId }, function(err, doc) {
			if (!err) {		
				doc.remove(function(errRemove) {
					if (errRemove) {
						handleResponse(response, 500, { error: errRemove });
					} else {
						handleResponse(response, 200, quoteId);
					}
				});
			} else {
				handleResponse(response, 500, { error: err });
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
		
		// Sistema i tag
		_.each(toInsert.tags, function(tag) {
			tag.name = utils.cleanTagName(tag.name);
		});
		
		// Valorizza omniSearch
		toInsert.omniSearch = utils.getOmniSearch(toInsert);
		
		quote = new models.Quote(toInsert);
		quote.save(function(err, inserted, affected) {
			if (!err && 1 === affected) {
				handleResponse(response, 200, inserted);
			} else {
				handleResponse(response, 500, { error: err });
			}
		});
	};
	
	var countElements = function(model, conditions) {
		var deferred = q.defer();
		
		model.count(conditions, function(err, count) {
			if (err) {
				deferred.reject(err);
			} else {
				deferred.resolve(count);
			}
		});
		
		return deferred.promise;
	};
	
	var findRandomElements = function(model, conditions, count, maxLimit) {
		var deferred = q.defer();
		
		models.Quote.findRandom(conditions, null, getFindOptions(count, maxLimit), function (err, docs) {
			if (err) {
				deferred.reject(err);
			} else {
				deferred.resolve(docs);
			}
		});
		
		return deferred.promise;
	};
	
	var initConditions = function(conditions, maxlen, additionalKeys) {		
		var condition;
		
		conditions.$and = [];
		condition = {};
		condition.$where = 'this.text.length < ' + maxlen;
		conditions.$and.push(condition);
		
		_.each(additionalKeys, function(key) {
			conditions[key] = [];
		});		
	};
	
	var addCondition = function(conditions, key, value, operator) {
		var condition = {};
		condition[key] = value;
		conditions[operator].push(condition);
	};
	
	var addOmniSearchConditions = function(conditions, search, operator) {
		var searchTokens,
			i;
		
		searchTokens = search.split(' ');
		searchTokens = _.filter(searchTokens, function(token) {
			return token.length > 2;
		});
		
		// Cerca per ciascun token			
		for (i = 0; i < searchTokens.length; i++) {				
			addCondition(conditions, 'omniSearch', eval('/' + searchTokens[i] + '/i'), operator);
		}						
	};
	
	var setDeviceAssociation = function(deviceUUID, userProfile) {
		
		// TODO Verificare il caso in cui l'utente non esiste (v2.0)
		
		models.UserProfile.findOne({ id: userProfile.id }, function(err, result) {
			if (!err) {				
				var countDeviceUUID = _.countBy(result.devices, function(device) {
					if (deviceUUID === device.UUID) {
						return 'count';
					}
				});
				
				if (!(_.has(countDeviceUUID, 'count'))) {
					result.devices = [];
					result.devices.push({ UUID: deviceUUID });
					result.save();
				}
			}
		});
	};
	
	var saveHistory = function(userProfileId, deviceUUID, eventType, queryData, shareData) {
		var history = new models.History({
			userProfileId: userProfileId,
			deviceUUID: deviceUUID,
			eventType: eventType,
			eventDateTime: moment().toDate(),
			query: queryData || {},
			share: shareData || {}
		});
		history.save(function(err, inserted, affected) {
			if (err) {							
				console.log("Errore salvataggio history");
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
			maxLimit = request.query.limit || MAX_LIMIT,
			maxlen = request.query.maxlen || MAX_LEN,
			deviceUUID = request.query.deviceUUID || 'testclient',
			userProfile = request.query.userProfile || systemProfile;
		
		// Associa device a utente 
		setDeviceAssociation(deviceUUID, userProfile);
		
		// Log ricerche
		var queryData = {
			tag: tag,
			author: author,
			omniSearch: search
		};
		saveHistory(userProfile.id, deviceUUID, 'search', queryData);
		
		// Aggiunge condizione sulla lunghezza della citazione
		initConditions(conditions, maxlen);
		
		if (author) {			
			
			// Ricerca per autore
			addCondition(conditions, 'author', eval('/' + author + '/i'), '$and');
		} else if (tag) {		
			
			// Ricerca per tag			
			addCondition(conditions, 'tags.name', tag, '$and');			
		} else if (search) {
			
			// OmniSearch
			addOmniSearchConditions(conditions, search, '$and');
		}		
		
		// Conta numero elementi
		countElements(models.Quote, conditions).then(function(result) {						
			
			// Se OmniSearch e nessun risultato trovato, mette OR or anzichè in AND
			if (0 === result && search) {
				initConditions(conditions, maxlen, ['$or']);
				addOmniSearchConditions(conditions, search, '$or');
				countElements(models.Quote, conditions)
					.then(function(result) {
						return findRandomElements(models, conditions, result, maxLimit);
					})
					.then(function(docs) {						
						handleResponse(response, 200, docs);
					})
					.catch(function(err) {
						handleResponse(response, 500, { error: err });				
					});					
			} else {
				findRandomElements(models, conditions, result, maxLimit).then(function(docs) {
					handleResponse(response, 200, docs);
				}, function(err) {
					handleResponse(response, 500, { error: err });				
				});
			}			
		}, function(err) {
			handleResponse(response, 500, { error: err });			
		});		
	};
	
	/**
	 * Ricerca citazione per testo preciso.
	 * In ingresso arriva il parametro 'search', che rappresenta la ricerca dell'utente
	 * Restituisce la citazione che soddisfano la ricerca.
	 */
	var quoteExists = function(request, response) {
		var search = request.query.search;
				
		// Conta numero elementi
		countElements(models.Quote, { 'text': search }).then(function(result) {									
			handleResponse(response, 200, result !== 0);
		}, function(err) {
			handleResponse(response, 500, { error: err });			
		});		
	};

	/**
	 * Condivisione citazione
	 * In ingresso arriva il parametro 'quoteId', che rappresenta la citazione condivisa
	 */
	var share = function(request, response) {
		var quoteId = request.body.quoteId,
			deviceUUID = request.body.deviceUUID || 'testclient',
			userProfile = request.body.userProfile || systemProfile;
		
		saveHistory(userProfile.id, deviceUUID, 'share', null, { quoteId: quoteId });
		handleResponse(response, 200, quoteId);
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
				handleResponse(response, 500, { error: err });
			}
		});
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
		clean: clean,
		handshake: handshake,
		insert: insert,
		list: list,
		quoteExists: quoteExists,
		removeQuote: removeQuote,
		removeWrongQuotes: removeWrongQuotes,
		share: share,		
		tags: tags
	};
};