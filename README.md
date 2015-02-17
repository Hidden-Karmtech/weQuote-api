## API

### v1.0

- authors
	- verb: GET
	- params: 
		- [optional] maxlen: numero massimo di caratteri per la citazione
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

- logEvent
	- verb: POST
	- params:
		- quoteId: Id citazione
		- deviceUUID: UUID dispositivo
		- data: valori dinamici
	- return: -
	
- quoteExists
	- verb: GET
	- params:
		- search: Testo citazione
	- return: id della citazione se esiste, altrimenti -1

- share (Deprecato)
	- verb: POST
	- params:
		- quoteId: Id citazione
		- deviceUUID: UUID dispositivo
	- return: -

- tags
	- verb: GET
	- params: 
		- [optional] maxlen: numero massimo di caratteri per la citazione
	- return: lista tag e numero di citazioni per tag
	
- update
	- verb: PUT
	- params: 
		- quoteId: ID citazione
		- newQuote: Citazione da aggiornare
	- return: citazione modificata