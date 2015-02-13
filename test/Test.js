'use strict';

var mocha = require('mocha'),
	chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	express = require('express'),
	moment = require('moment'),
	Config = require('../lib/Config'),
	config = Config.create(),
	Middlewares = require('../lib/Middlewares'),
	middlewares = Middlewares.create(),
	Utils = require('../lib/Utils'),
	utils = Utils.create(),
	mongoose = require('mongoose'),
	Models = require('../lib/Models'),
	models = Models.create(mongoose),
	MongoRepository = require('../lib/MongoRepository'),
	mongoRepository = MongoRepository.create(mongoose, models),
	Routes = require('../lib/Routes'),
	routes = Routes.create(mongoRepository),
	Analytics = require('../lib/Analytics'),
	analytics = Analytics.create();

chai.use(sinonChai);

describe('Il modulo Config', function() {
	
	it('deve esistere', function() {
		expect(Config).not.to.be.undefined;
	});
	
	it('deve consentire la creazione di un nuovo oggetto config', function() {
		expect(config).not.to.be.undefined;
	});
	
	it('deve contenere le impostazioni di configurazione per MongoDb', function() {
		expect(config.mongo).not.to.be.undefined;
	});
	
	it('deve contenere le impostazioni di configurazione per il server', function() {
		expect(config.node).not.to.be.undefined;
	});
	
	describe('Le impostazioni per MongoDb', function() {

		it('devono restituire dei valori di default se non presenti le variabili di ambiente di OpenShift', function() {
			expect(config.mongo.host).to.equal('127.0.0.1');
			expect(config.mongo.port).to.equal(27017);
			expect(config.mongo.username).to.equal('admin');
			expect(config.mongo.password).to.equal('ywWPTDjb64Zt');
		});
		
		it('devono restituire la stringa di connessione', function() {
			expect(config.mongo.getConnectionString()).not.to.be.empty;
		});
		
		it('devono restituire la stringa di connessione con dei valori di default se non presenti le variabili di ambiente di OpenShift', function() {
			expect(config.mongo.getConnectionString()).to.equal('mongodb://admin:ywWPTDjb64Zt@127.0.0.1:27017/api');
		});
		
	});
	
	describe('Le impostazioni per il server Node', function() {
		
		it('devono restituire dei valori di default se non presenti le variabili di ambiente di OpenShift', function() {
			expect(config.node.host).to.equal('127.0.0.1');
			expect(config.node.port).to.equal(3000);
		});
		
	});
	
});

describe('Il modulo Middlewares', function() {
	
	it('deve esistere', function() {
		expect(Middlewares).not.to.be.undefined;
	});
	
	it('deve consentire la creazione di un nuovo oggetto middlewares', function() {
		expect(middlewares).not.to.be.undefined;
	});
	
	describe('Un oggetto middlewares', function() {

		it('deve avere il metodo forceHttps', function() {
			expect(middlewares).have.property('forceHttps');
		});
		
	});
	
});

describe('Il modulo Analytics', function() {
	
	it('deve esistere', function() {
		expect(Analytics).not.to.be.undefined;
	});
	
	it('deve consentire la creazione di un nuovo oggetto analytics', function() {
		expect(analytics).not.to.be.undefined;
	});
	
	describe('Un oggetto analytics', function() {

		it('deve avere il metodo insertLogEvent', function() {
			expect(analytics).have.property('insertLogEvent');
		});
				
	});
	
});

describe('Il modulo Utils', function() {
	
	it('deve esistere', function() {
		expect(Utils).not.to.be.undefined;
	});
	
	it('deve consentire la creazione di un nuovo oggetto utils', function() {
		expect(utils).not.to.be.undefined;
	});
	
	describe('Un oggetto utils', function() {

		it('deve avere il metodo getOmniSearch', function() {
			expect(utils).have.property('getOmniSearch');
		});
		
		it('deve avere il metodo cleanTagName', function() {
			expect(utils).have.property('cleanTagName');
		});
		
		describe('Il metodo getOmniSearch', function() {
			
			it('deve generare l\'omniSearch partendo da quote, concatenando titolo, autore e tags', function() {
				var quote = {
					text: "Testo della citazione",
					author: "Frank Johnson",
					tags: [
					{
						name: 'amore'
					}, 
					{
						name: 'poesia'
					}]
				}
				expect(utils.getOmniSearch(quote)).to.equal('testo della citazione|frank johnson|amore|poesia');
			});
			
		});

		describe('Il metodo cleanTagName', function() {
			
			it('deve mettere il tag in minuscolo e togliere gli spazi', function() {
				expect(utils.cleanTagName(" Amore")).to.equal('amore');
			});
			
		});
		
	});
	
});

describe('Il modulo Models', function() {
	
	it('deve esistere', function() {
		expect(Models).not.to.be.undefined;
	});
	
	it('deve consentire la creazione di un nuovo oggetto models', function() {
		expect(models).not.to.be.undefined;
	});
		
});

describe('Il modulo MongoRepository', function() {
	
	it('deve esistere', function() {
		expect(MongoRepository).not.to.be.undefined;
	});
	
	it('deve consentire la creazione di un nuovo oggetto mongoRepository', function() {
		expect(mongoRepository).not.to.be.undefined;
	});
	
});

describe('Il modulo Routes', function() {
	var responseStub = sinon.stub(express.response),
		responseContentType = { "Content-Type": "application/json; charset=utf-8" };
	
	it('deve esistere', function() {
		expect(Routes).not.to.be.undefined;
	});
	
	it('deve consentire la creazione di un nuovo oggetto routes', function() {
		expect(routes).not.to.be.undefined;
	});
	
	describe('La route \'authors\'', function() {
		var authorsRequest = [{"_id":"A.C. Bhaktivedanta Swami Prabhupada","value":1}],
			authorsResult = [{"name":"A.C. Bhaktivedanta Swami Prabhupada","count":1}],
			authorsStub = sinon.stub(mongoRepository, 'authors').callsArgWith(1, false, authorsRequest),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository);
		
		dummyRequest.query = {};
		dummyRequest.query.maxlen = 50;
		dummyRoutes.authors(dummyRequest, responseStub);
		
		it('deve chiamare la funzione \'authors\' del repository', function() {
			expect(authorsStub.calledOnce).to.be.true;
		});
		
		it('in caso di esito positivo, deve rispondere con status = 200', function() {
			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
		it('in caso di esito positivo, deve rispondere con un elenco di autori e numero di citazioni per autore', function() {				
			expect(responseStub.end.calledWith(JSON.stringify(authorsResult))).to.be.true;
		});
		
	});
	
	describe('La route \'clean\'', function() {
		var cleanStub = sinon.stub(mongoRepository, 'clean').callsArgWith(0, false, null),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository);
		
		dummyRoutes.clean(dummyRequest, responseStub);
		
		it('deve chiamare la funzione \'clean\' del repository', function() {
			expect(cleanStub.calledOnce).to.be.true;
		});
		
		it('deve rispondere sempre con status = 200', function() {
			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
	});
	
	describe('La route \'handshake\'', function() {
		var handshakeStub = sinon.stub(mongoRepository, 'handshake').callsArgWith(0, false, moment().toDate()),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository);
		
		dummyRoutes.handshake(dummyRequest, responseStub);
		
		it('deve chiamare la funzione \'handshake\' del repository', function() {
			expect(handshakeStub.calledOnce).to.be.true;
		});
		
		it('deve rispondere sempre con status = 200', function() {
			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
	});
	
	describe('La route \'insert\'', function() {
		var goodQuote = {
				author: "Autore di prova",
				text: "Questo è il testo di prova della citazione di prova",
				tags: [{
					name: "amore",
				}],
				source: "nessuna"
			},
			badQuote = {
				text: "Questo è il testo di prova della citazione di prova errata",
				tags: [{
					name: "odio",
				}],
				source: "nessuna"
			},
			insertStub = sinon.stub(mongoRepository, 'insert'),
			dummyRequest = {},			
			dummyRoutes = Routes.create(mongoRepository),
			errorMessage = "Autore obbligatorio";
		
		insertStub.withArgs(goodQuote).callsArgWith(1, false, goodQuote);
		insertStub.withArgs(badQuote).callsArgWith(1, true, errorMessage);
		
		dummyRequest.headers = {};
		dummyRequest.headers['x-authkey'] = require('../lib/local').AUTH_KEY;
		
		it('deve chiamare la funzione \'insert\' del repository', function() {			
			dummyRequest.body = {};			
			dummyRoutes.insert(dummyRequest, responseStub);

			expect(insertStub.calledOnce).to.be.true;
		});

		it('in caso di esito positivo, deve rispondere con status = 200', function() {
			dummyRequest.body = { quote: goodQuote };
			dummyRoutes.insert(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
		it('in caso di esito positivo, deve ritornare il modello appena inserito', function() {
			dummyRequest.body = { quote: goodQuote };
			dummyRoutes.insert(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify(goodQuote))).to.be.true;
		});
		
		it('in caso di modello non valido, deve rispondere con status = 500', function() {
			dummyRequest.body = { quote: badQuote };
			dummyRoutes.insert(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(500, responseContentType)).to.be.true;
		});
				
		it('in caso di modello non valido, deve ritornare un messaggio di errore', function() {
			dummyRequest.body = { quote: badQuote };
			dummyRoutes.insert(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify({ error: errorMessage }))).to.be.true;
		});
		
	});
	
	describe('La route \'list\'', function() {
		var listStub = sinon.stub(mongoRepository, 'list'),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository),
			goodOptions = {
				search: undefined,
				author: "Papa Giovanni Paolo II",
				tag: undefined,
				limit: undefined,
				maxlen: undefined,
				deviceUUID: undefined,
				userProfile: undefined
			},
			badOptions = {
				search: undefined,
				author: "simula un errore",
				tag: undefined,
				limit: undefined,
				maxlen: undefined,
				deviceUUID: undefined,
				userProfile: undefined
			},
			dummyResponse = [{
				"text":"Tutta la grandezza del lavoro è dentro l'uomo.",
				"author":"Papa Giovanni Paolo II",
				"source":"",
				"omniSearch":"tutta la grandezza del lavoro è dentro l'uomo.papa giovanni paolo iiuniverso",
				"_id":"549351eb85ca049ca121e5fd",
				"__v":0,
				"r":{"coordinates":[0.41940971021540463,0.15254574501886964],"type":"Point"},
				"tags":[{"name":"universo","_id":"549351eb85ca049ca121e5fe"}]
			}],
			errorMessage = 'errore interno';
		
		listStub.withArgs(goodOptions).callsArgWith(1, false, dummyResponse);
		listStub.withArgs(badOptions).callsArgWith(1, true, errorMessage);
		
		it('deve chiamare la funzione \'list\' del repository', function() {
			dummyRequest.query = {};
			dummyRoutes.list(dummyRequest, responseStub);
			
			expect(listStub.calledOnce).to.be.true;
		});
		
		it('in caso di esito positivo, deve rispondere con status = 200', function() {
			dummyRequest.query = { author: "Papa Giovanni Paolo II"	};
			dummyRoutes.list(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});

		it('in caso di esito positivo, deve restituire l\'elenco delle citazioni che soddisfano i criteri di ricerca', function() {
			dummyRequest.query = { author: "Papa Giovanni Paolo II"	};
			dummyRoutes.list(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify(dummyResponse))).to.be.true;
		});
		
		it('in caso di esito negativo, deve rispondere con status = 500', function() {
			dummyRequest.query = { author: "simula un errore"	};
			dummyRoutes.list(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
		it('in caso di esito negativo, deve ritornare un messaggio di errore', function() {
			dummyRequest.query = { author: "simula un errore"	};
			dummyRoutes.list(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify({ error: errorMessage }))).to.be.true;
		});
		
	});
	
	describe('La route \'quoteExists\'', function() {
		var quoteExistsStub = sinon.stub(mongoRepository, 'quoteExists'),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository),
			goodText = 'testo che esiste',
			badText = 'testo che non esiste',
			errText = 'simula errore',
			errorMessage = 'errore interno',
			dummyID = "549351f485ca049ca121e70d";
		
		quoteExistsStub.withArgs(goodText).callsArgWith(1, false, dummyID);
		quoteExistsStub.withArgs(badText).callsArgWith(1, false, -1);
		quoteExistsStub.withArgs(errText).callsArgWith(1, true, errorMessage);
		
		it('deve chiamare la funzione \'quoteExists\' del repository', function() {
			dummyRequest.query = {};			
			dummyRoutes.quoteExists(dummyRequest, responseStub);

			expect(quoteExistsStub.calledOnce).to.be.true;
		});

		it('in caso di esito positivo, deve rispondere con status = 200', function() {
			dummyRequest.query = { search: goodText };
			dummyRoutes.quoteExists(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});

		it('in caso di esito positivo, deve restituire l\'ID della citazione se esiste', function() {
			dummyRequest.query = { search: goodText };
			dummyRoutes.quoteExists(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify(dummyID))).to.be.true;
		});
		
		it('in caso di esito positivo, deve restituire -1 se la citazione non esiste', function() {
			dummyRequest.query = { search: badText };
			dummyRoutes.quoteExists(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify(-1))).to.be.true;
		});

		it('in caso di esito negativo, deve rispondere con status = 500', function() {
			dummyRequest.query = { search: errText };
			dummyRoutes.quoteExists(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(500, responseContentType)).to.be.true;
		});

		it('in caso di esito negativo, deve ritornare un messaggio di errore', function() {
			dummyRequest.query = { quote: errText };
			dummyRoutes.quoteExists(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify({ error: errorMessage }))).to.be.true;
		});
		
	});
	
	describe('La route \'remove\'', function() {
		var goodQuoteId = '12345678',
			badQuoteId = '13572468',
			errorMessage = 'internal error',
			removeQuoteStub = sinon.stub(mongoRepository, 'remove'),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository);
		
		removeQuoteStub.withArgs(goodQuoteId).callsArgWith(1, false, goodQuoteId);
		removeQuoteStub.withArgs(badQuoteId).callsArgWith(1, true, errorMessage);
		
		dummyRequest.headers = {};
		dummyRequest.headers['x-authkey'] = require('../lib/local').AUTH_KEY;
		
		it('deve chiamare la funzione \'remove\' del repository', function() {
			dummyRequest.body = {};
			dummyRoutes.remove(dummyRequest, responseStub);

			expect(removeQuoteStub.calledOnce).to.be.true;
		});
		
		it('in caso di esito positivo, deve rispondere con status = 200', function() {
			dummyRequest.body = { quoteId: goodQuoteId };
			dummyRoutes.remove(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
		it('in caso di esito positivo, deve ritornare l\'id della citazione appena rimossa', function() {
			dummyRequest.body = { quoteId: goodQuoteId };
			dummyRoutes.remove(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify(goodQuoteId))).to.be.true;
		});
		
		it('in caso di esito negativo, deve rispondere con status = 500', function() {
			dummyRequest.body = { quoteId: badQuoteId };
			dummyRoutes.remove(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(500, responseContentType)).to.be.true;
		});
		
		it('in caso di esito negativo, deve ritornare un messaggio di errore', function() {
			dummyRequest.body = { quoteId: badQuoteId };
			dummyRoutes.remove(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify({ error: errorMessage }))).to.be.true;
		});
		
	});
	
	describe('La route \'removeWrongQuotes\'', function() {
		var removeWrongQuotesStub = sinon.stub(mongoRepository, 'removeWrongQuotes').callsArgWith(0, null),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository);
		
		dummyRoutes.removeWrongQuotes(dummyRequest, responseStub);
		
		it('deve chiamare la funzione \'removeWrongQuotes\' del repository', function() {
			expect(removeWrongQuotesStub.calledOnce).to.be.true;
		});
		
		it('in caso di esito positivo, deve rispondere con status = 200', function() {
			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
	});
	
	describe('La route \'share\'', function() {
		var shareStub = sinon.stub(mongoRepository, 'share').callsArgWith(1, null),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository);
		
		dummyRequest.body = {};
		
		dummyRoutes.share(dummyRequest, responseStub);
		
		it('deve chiamare la funzione \'share\' del repository', function() {
			expect(shareStub.calledOnce).to.be.true;
		});
		
		it('deve rispondere sempre con status = 200', function() {
			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
	});
	
	describe('La route \'tags\'', function() {
		var tagsRequest = [{"_id":"alcol","value":54}],
			tagsResult = [{"name":"alcol","count":54}],
			tagsStub = sinon.stub(mongoRepository, 'tags').callsArgWith(1, false, tagsRequest),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository);
				
		dummyRequest.query = {};
		dummyRoutes.tags(dummyRequest, responseStub);
		
		it('deve chiamare la funzione \'tags\' del repository', function() {
			expect(tagsStub.calledOnce).to.be.true;
		});
		
		it('in caso di esito positivo, deve rispondere con status = 200', function() {
			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
		it('in caso di esito positivo, deve rispondere con un elenco di tag e numero di citazioni per tag', function() {
			expect(responseStub.end.calledWith(JSON.stringify(tagsResult))).to.be.true;
		});
		
	});
	
	describe('La route \'update\'', function() {
		var dummyId = "549351f485ca049ca121e70d",
			goodQuote = {
				author: "Autore di prova",
				text: "Questo è il testo di prova della citazione di prova modificata",
				tags: [{
					name: "amore",
				}],
				source: "nessuna"
			},
			badQuote = {
				text: "Questo è il testo di prova della citazione di prova errata",
				tags: [{
					name: "odio",
				}],
				source: "nessuna"
			},
			updateStub = sinon.stub(mongoRepository, 'update'),
			dummyRequest = {},
			dummyRoutes = Routes.create(mongoRepository),
			errorMessage = "Autore obbligatorio";
		
		updateStub.withArgs(dummyId, goodQuote).callsArgWith(2, false, goodQuote);
		updateStub.withArgs(dummyId, badQuote).callsArgWith(2, true, errorMessage);
		
		dummyRequest.headers = {};
		dummyRequest.headers['x-authkey'] = require('../lib/local').AUTH_KEY;
		
		it('deve chiamare la funzione \'update\' del repository', function() {
			dummyRequest.body = {};			
			dummyRoutes.update(dummyRequest, responseStub);

			expect(updateStub.calledOnce).to.be.true;
		});

		it('in caso di esito positivo, deve rispondere con status = 200', function() {
			dummyRequest.body = { quoteId: dummyId, newQuote: goodQuote };
			dummyRoutes.update(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(200, responseContentType)).to.be.true;
		});
		
		it('in caso di esito positivo, deve ritornare il modello modificato', function() {
			dummyRequest.body = { quoteId: dummyId, newQuote: goodQuote };
			dummyRoutes.update(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify(goodQuote))).to.be.true;
		});
		
		it('in caso di modello non valido, deve rispondere con status = 500', function() {
			dummyRequest.body = { quoteId: dummyId, newQuote: badQuote };
			dummyRoutes.update(dummyRequest, responseStub);

			expect(responseStub.writeHead.calledWith(500, responseContentType)).to.be.true;
		});
				
		it('in caso di modello non valido, deve ritornare un messaggio di errore', function() {
			dummyRequest.body = { quoteId: dummyId, newQuote: badQuote };
			dummyRoutes.update(dummyRequest, responseStub);

			expect(responseStub.end.calledWith(JSON.stringify({ error: errorMessage }))).to.be.true;
		});
		
		
	});
	
});