
/*
[
      {"@id":"terminus:class_frame", "@type":"terminus:DBAction"},
      {"@id":"terminus:create_database", "@type":"terminus:DBAction"},
      {"@id":"terminus:create_document", "@type":"terminus:DBAction"},
      {"@id":"terminus:delete_database", "@type":"terminus:DBAction"},
      {"@id":"terminus:delete_document", "@type":"terminus:DBAction"},
      {"@id":"terminus:get_document", "@type":"terminus:DBAction"},
      {"@id":"terminus:get_schema", "@type":"terminus:DBAction"},
      {"@id":"terminus:update_document", "@type":"terminus:DBAction"},
      {"@id":"terminus:update_schema", "@type":"terminus:DBAction"},
      {"@id":"terminus:woql_select", "@type":"terminus:DBAction"},
      {"@id":"terminus:woql_update", "@type":"terminus:DBAction"}
    ] */
function authorityActionsToArr(action) {
	if (Array.isArray(action) === false) return [];

	return action.map(item => item['@id']);
}

module.exports = {
	authorityActionsToArr,
};
