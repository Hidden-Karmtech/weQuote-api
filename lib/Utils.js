'use strict';

module.exports.create = function() {
	var _ = require('underscore');
	
	var getOmniSearch = function(quote) {
		var toReturn = quote.text + quote.author + _.reduce(quote.tags, function(memo, tag) {
			return memo + tag.name;
		}, '');
		return toReturn.trim().toLowerCase();
	};
	
	return {
		getOmniSearch: getOmniSearch,		
	};
};