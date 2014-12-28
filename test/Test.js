'use strict';

var mocha = require('mocha'),
	chai = require('chai'),
	expect = chai.expect,
	Config = require('../lib/Config'),
	config = Config.create(),
	Middlewares = require('../lib/Middlewares'),
	middlewares = Middlewares.create(),
	Utils = require('../lib/Utils'),
	utils = Utils.create(),
	mongoose = require('mongoose'),
	Models = require('../lib/Models'),
	models = Models.create(mongoose),
	Routes = require('../lib/Routes'),
	routes = Routes.create(mongoose, models);

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
			expect(config.mongo.password).to.equal('a43H9aZb6iuE');
		});
		
		it('devono restituire la stringa di connessione', function() {
			expect(config.mongo.getConnectionString()).not.to.be.empty;
		});
		
		it('devono restituire la stringa di connessione con dei valori di default se non presenti le variabili di ambiente di OpenShift', function() {
			expect(config.mongo.getConnectionString()).to.equal('mongodb://admin:a43H9aZb6iuE@127.0.0.1:27017/api');
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
				expect(utils.getOmniSearch(quote)).to.equal('testo della citazionefrank johnsonamorepoesia');
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

describe('Il modulo Routes', function() {
	
	it('deve esistere', function() {
		expect(Routes).not.to.be.undefined;
	});
	
	it('deve consentire la creazione di un nuovo oggetto routes', function() {
		expect(routes).not.to.be.undefined;
	});
		
});