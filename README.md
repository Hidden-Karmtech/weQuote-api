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
		- deviceUUID: UUID dispositivo
		- [optional] limit: numero massimo di risultati 
		- [optional] maxlen: numero massimo di caratteri per la citazione		

- quoteExists
	- verb: GET
	- params:
		- search: Testo citazione

- share
	- verb: GET
	- params:
		- quoteId: Id citazione
		- deviceUUID: UUID dispositivo

- tags
	- verb: GET
	- params: -