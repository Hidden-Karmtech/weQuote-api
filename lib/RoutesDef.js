'use strict';

module.exports.define = function(app, routes) {
	
	// Versione 0.1
	app.get('/authors', routes.authors);
	app.post('/insert', routes.insert);
	app.get('/list', routes.list);
	app.get('/quoteExists', routes.quoteExists);
	app.post('/share', routes.share);
	app.get('/tags', routes.tags);
	app.put('/update', routes.update);	
	app.get('/clean', routes.clean);
	app.get('/handshake', routes.handshake);
	app.get('/removeWrongQuotes', routes.removeWrongQuotes);
	app.del('/remove', routes.remove);

	// Versione 1
	app.get('/v1/authors', routes.authors);
	app.post('/v1/insert', routes.insert);
	app.get('/v1/list', routes.list);
	app.get('/v1/quoteExists', routes.quoteExists);
	app.post('/v1/share', routes.share);
	app.get('/v1/tags', routes.tags);
	app.put('/v1/update', routes.update);
	app.get('/v1/clean', routes.clean);
	app.get('/v1/handshake', routes.handshake);
	app.get('/v1/removeWrongQuotes', routes.removeWrongQuotes);
	app.del('/v1/remove', routes.remove);

	//Versione 2
	app.get('/v2/authors', routes.authors);
	app.post('/v2/insert', routes.insert);
	app.get('/v2/list', routes.list);
	app.get('/v2/quoteExists', routes.quoteExists);
	app.post('/v2/share', routes.share);
	app.get('/v2/tags', routes.tags);
	app.put('/v2/update', routes.update);
	app.get('/v2/clean', routes.clean);
	app.get('/v2/handshake', routes.handshake);
	app.get('/v2/removeWrongQuotes', routes.removeWrongQuotes);
	app.del('/v2/remove', routes.remove);
};