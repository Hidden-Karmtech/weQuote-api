'use strict';

var mocha = require('mocha'),
	chai = require('chai'),
	expect = chai.expect;

describe('Il modulo Config', function() {
	var Config,
		config;
	
	beforeEach(function() {
		Config = require('../lib/Config');
		config = Config.create();
	});
	
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