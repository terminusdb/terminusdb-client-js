
module.exports = Object.freeze({
	CONNECT: 'connect',
	GET_SCHEMA: 'get_schema',
	UPDATE_SCHEMA: 'update_schema',
	UPDATE_DOCUMENT: 'update_document',
	CLASS_FRAME: 'class_frame',
	WOQL_SELECT: 'woql_select',
	GET_DOCUMENT: 'get_document',
	DELETE_DATABASE: 'delete_database',
	DELETE_DOCUMENT: 'delete_document',
	CREATE_DATABASE: 'create_database',
	CREATE_DOCUMENT: 'create_document',
	WOQL_UPDATE: 'woql_update'
});

/*
{"extends": "strongloop",
  "env": {
		"browser": true,
		"node": true,
		"es6": true
  },
  "rules":{"max-len": ["error", { "code": 100 }]},
 "parserOptions": { "ecmaVersion": 6 }}
*/
