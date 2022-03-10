module.exports = {
  onlyNode: {
    '@type': 'AddTriple',
	                    subject: {
	                        '@type': 'NodeValue',
	                        variable: 'Bike_URL',
	                    },
	                    predicate: {
	                        '@type': 'NodeValue',
	                        node: 'rdf:type',
	                    },
	                    object: {
	                        '@type': 'Value',
	                        node: '@schema:Bicycle',
	                    },
	                },
	            withGraph: {},
	        };
