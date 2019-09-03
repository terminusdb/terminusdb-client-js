function authorityActionsToArr(action) {
	if (Array.isArray(action) === false) return [];

	return action.map(item => item['@id']);
}

module.exports = { authorityActionsToArr };
