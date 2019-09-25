function authorityActionsToArr(action) {
	if (Array.isArray(action) === false) return [];

	return action.map(item => item['@id']);
}

function URIEncodePayload(payload) {
	if (typeof payload === 'string') return encodeURIComponent(payload);
	const payloadArr = [];
	for (const key of Object.keys(payload)) {
		if (typeof payload[key] === 'object') {
			for (const keyElement of Object.keys(payload[key])) {
				 const valueElement = payload[key][keyElement];
				 payloadArr.push(`${encodeURIComponent(keyElement)}=${encodeURIComponent(valueElement)}`);
			}
		} else {
			payloadArr.push(`${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`);
		}
	}
	return payloadArr.join('&');
}

module.exports = { authorityActionsToArr, URIEncodePayload };
