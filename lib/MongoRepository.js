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
	var authors = function(callback) {		
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
			if (err) {
				callback(true, err);
			} else {
				callback(false, result);
			}
		});				
	};
		
	/**
	 * Pulizia citazioni
	 * Effettua le seguenti operazioni:
	 *	- Pulizia dei tag
	 *	- Trim autore
	 *	- Valorizzazione campo omniSearch
	 */
	var clean = function(callback) {		
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
				
				callback(false, docs.length);
			} else {
				callback(true, err);
			}			
		});
	};
	
	/**
	 * Handshake
	 * Restituisce la data e ora auttuale.
	 */
	var handshake = function(callback) {		
		callback(false, moment().toDate());
	};
	
	/**
	 * Inserimento di una nuova citazione.
	 * In ingresso arriva il parametro 'toInsert', che rappresenta il modello citazione da inserire.
	 * Restituisce la citazione inserita.
	 */
	var insert = function(toInsert, callback) {
		var quote;
		
		// Sistema i tag
		_.each(toInsert.tags, function(tag) {
			tag.name = utils.cleanTagName(tag.name);
		});
		
		// Valorizza omniSearch
		toInsert.omniSearch = utils.getOmniSearch(toInsert);
		
		// Inserisce citazione
		quote = new models.Quote(toInsert);
		quote.save(function(err, inserted, affected) {
			if (!err && 1 === affected) {
				callback(false, inserted);
			} else {
				callback(true, err);
			}
		});
	};
	
	/**
	 * Elenco citazioni.
	 * In ingresso arriva il parametro 'options', che rappresenta la ricerca dell'utente
	 * (può essere un autore, un tag o un testo di una citazione).
	 * Restituisce un elenco di citazioni che soddisfano la ricerca.
	 */
	var list = function(options, callback) {
		var search = options.search,
			author = options.author,
			tag = options.tag,
			conditions = {},
			maxLimit = options.limit || MAX_LIMIT,
			maxlen = options.maxlen || MAX_LEN,
			deviceUUID = options.deviceUUID || 'testclient',
			userProfile = options.userProfile || systemProfile;
		
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
						callback(false, docs);
					})
					.catch(function(err) {
						callback(true, err);				
					});					
			} else {
				findRandomElements(models, conditions, result, maxLimit).then(function(docs) {
					callback(false, docs);
				}, function(err) {
					callback(true, err);				
				});
			}			
		}, function(err) {
			callback(true, err);			
		});		
	};
	
	/**
	 * Ricerca citazione per testo preciso.
	 * In ingresso arriva il parametro 'search', che rappresenta la ricerca dell'utente
	 * Restituisce true se la citazione esiste, altrimenti false.
	 */
	var quoteExists = function(search, callback) {
		countElements(models.Quote, { 'text': search }).then(function(result) {									
			callback(false, result !== 0);
		}, function(err) {
			callback(true, err);			
		});		
	};
	
	/**
	 * Cancella citazione per id
	 * In ingresso arriva il parametro 'quoteId', che rappresenta l'id dela citazione.
	 * Restituisce l'id della citazione rimossa se esito positivo, altrimenti errore. 
	 */
	var remove = function(quoteId, callback) {	
		models.Quote.findOne({ "_id": quoteId }, function(err, doc) {
			if (!err) {		
				doc.remove(function(errRemove) {
					if (errRemove) {
						callback(true, errRemove);
					} else {
						callback(false, quoteId);
					}
				});
			} else {
				callback(true, err);
			}			
		});
	};
	
	/**
	 * Rimozione citazioni errate
	 * - Testo troppo corto
	 * - Autore con iniziali non alfanumeriche 
	 * - Citazioni doppie
	 */
	var removeWrongQuotes = function(callback) {
		var count = 0,
			functions = [];
		
		models.Quote.find({}, function(err, docs) {
			if (!err) {
				console.log("Numero totale di citazioni: " + docs.length);
				
				docs.forEach(function(elem, index, array) {	
					functions.push(function(handler) {
						checkWrongQuote(elem).then(function(promiseResult) {
							count++;
							handler(null, true);
						}, function(promiseError) {
							handler(null, false);
						});
					});
				});			
				
				async.series(functions, function(errAsync, results) {
					if (errAsync) {
						callback(true, errAsync);
					} else {
						console.log("Citazioni rimosse: " + count);
						callback(false, count);						
					}
				});
				
			} else {
				callback(true, err);
			}
		});
	};
	
	/**
	 * Condivisione citazione
	 * In ingresso arriva il parametro 'options', che rappresenta le opzioni di condivisione:
	 *	- quoteId: Id citazione
	 *	- deviceUUID: Id dispositivo
	 *	- userProfile: Profilo utente
	 * Restituisce id della citazione condivisa
	 */
	var share = function(options, callback) {
		var quoteId = options.quoteId,
			deviceUUID = options.deviceUUID || 'testclient',
			userProfile = options.userProfile || systemProfile;
		
		saveHistory(userProfile.id, deviceUUID, 'share', null, { quoteId: quoteId });
		callback(false, quoteId);
	};
	
	/**
	 * Elenco di tutti i tag e numero di utilizzo nelle citazioni
	 */
	var tags = function(callback) {		
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
			if (err) {
				callback(true, err);
			} else {
				callback(false, result);
			}
		});
	};
	
	/**
	 * Controlla singola citazione
	 */
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
	 * Conta elementi di una collection, in funzione dei criteri di ricerca
	 */
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
	
	/**
	 * Effettua ricerca casuale di elementi di una collection
	 */
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
	
	/**
	 * Inizializza condizioni di ricerca per list
	 */
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
	
	/**
	 * Aggiunge condizione di ricerca
	 */
	var addCondition = function(conditions, key, value, operator) {
		var condition = {};
		condition[key] = value;
		conditions[operator].push(condition);
	};
	
	/**
	 * Aggiunge condizione di ricerca per omniSearch
	 */
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
	
	/**
	 * Efettua associazione tra Id dispositivo e profilo utente
	 */
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
	 * Effettua salvataggio della history
	 */
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
		tags: tags
	};
};