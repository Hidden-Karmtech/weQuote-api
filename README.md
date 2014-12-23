### API

- authors
	- verb: GET
	- params: -
	- return: lista autori e numero di citazioni per autore
	
- handshake
	- verb: GET
	- params: -
	- return: data/ora
	
- insert
	- verb: POST
	- params:
		- quote: modello da inserire
	- return: citazione inserita
	
- list
	- verb: GET
	- params:
		- search: OmniSearch
		- tag: Ricerca mirata per tag
		- author: Ricerca mirata per autore
		- deviceUUID: UUID dispositivo
		- [optional] limit: numero massimo di risultati 
		- [optional] maxlen: numero massimo di caratteri per la citazione		
	- return: elenco citazioni che soddisfano i criteri di ricerca
	
- quoteExists
	- verb: GET
	- params:
		- search: Testo citazione
	- return: true se la citazione esiste, altrimenti false

- share
	- verb: POST
	- params:
		- quoteId: Id citazione
		- deviceUUID: UUID dispositivo
	- return: -

- tags
	- verb: GET
	- params: -
	- return: lista tag e numero di citazioni per tag