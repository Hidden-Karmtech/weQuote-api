'use strict';

module.exports.define = function(app, routes) {	
	
	app.get('/authors', routes.authors);
	app.post('/insert', routes.insert);
	app.get('/list', routes.list);
	app.get('/quoteExists', routes.quoteExists);
	app.post('/share', routes.share);
	app.get('/tags', routes.tags);
	app.put('/update', routes.update);	
	
	// Utility
	app.get('/clean', routes.clean);
	app.get('/handshake', routes.handshake);
	app.get('/removeWrongQuotes', routes.removeWrongQuotes);
	app.del('/remove', routes.remove);
};