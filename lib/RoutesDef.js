'use strict';

module.exports.define = function(express, routes) {	
	
	var router = router = express.Router();
	
	router.get('/authors', routes.authors);
	router.post('/insert', routes.insert);
	router.get('/list', routes.list);
	router.post('/logEvent', routes.logEvent);				// Attiva dal 09/02/2015
	router.get('/quoteExists', routes.quoteExists);		
	router.post('/share', routes.share);					// Deprecata dal 09/02/2015
	router.get('/tags', routes.tags);
	router.put('/update', routes.update);	
	
	// Utility
	router.get('/clean', routes.clean);
	router.get('/handshake', routes.handshake);
	router.get('/removeWrongQuotes', routes.removeWrongQuotes);
	router.delete('/remove', routes.remove);
	
	return router;
};