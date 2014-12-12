'use strict';

module.exports.create = function(mongoose, models) {
	var _ = require('underscore'),	
		q = require('q'),
		Utils = require('./Utils'),
		utils = Utils.create(),
		MAX_LIMIT = 50,
		MAX_LEN = 9999;
	
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
			deviceUUID = request.query.deviceUUID,
			userProfile = request.query.userProfile || systemProfile;
		
		// Associa device a utente 
		setDeviceAssociation(deviceUUID, userProfile);
		
		// Aggiunge condizione sulla lunghezza della citazione
		initConditions(conditions, maxlen);
		
		if (author) {			
			
			// Ricerca per autore
			addCondition(conditions, 'author', author, '$and');
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
						//TODO log
						handleResponse(response, 200, docs);
					})
					.catch(function(err) {
						handleResponse(response, 500, { error: err });				
					});					
			} else {
				findRandomElements(models, conditions, result, maxLimit).then(function(docs) {
					//TODO log
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
		insert: insert,
		list: list,
		tags: tags
	};
};