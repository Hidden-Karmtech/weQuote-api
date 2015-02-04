'use strict';

module.exports.create = function() {
	var _ = require('underscore');
	
	var getOmniSearch = function(quote) {
		var toReturn = quote.text + '|' + quote.author + _.reduce(quote.tags, function(memo, tag) {
			return memo + '|' + tag.name;
		}, '');
		return toReturn.trim().toLowerCase();
	};
	
	var cleanTagName = function(tagName) {
		return tagName.toLowerCase().trim();
	};
	
	return {
		getOmniSearch: getOmniSearch,	
		cleanTagName: cleanTagName
	};
};