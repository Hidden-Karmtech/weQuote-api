### API

- authors
	- verb: GET
	- params: -
	
- insert
	- verb: POST
	- params:
		- quote: modello da inserire
	
- list
	- verb: GET
	- params:
		- search: OmniSearch
		- tag: Ricerca mirata per tag
		- author: Ricerca mirata per autore
		- [optional] limit: numero massimo di risultati 
		- [optional] maxlen: numero massimo di caratteri per la citazione

- tags
	- verb: GET
	- params: -