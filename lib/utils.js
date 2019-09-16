function authorityActionsToArr(action) {
	if (Array.isArray(action) === false) return [];

	return action.map(item => item['@id']);
}
function URIEncodePayload (pl){
    if(typeof pl == "string") return encodeURIComponent(pl);
    var str = "";
    var first = true;
    for(var k in pl){
        if(!first){
            str += "&";
        }
        first = false;
        if(typeof pl[k] == "object"){
            var fobj = true;
            for(var key in pl[k]){
                if(!fobj){
                    str += "&";
                }
                fobj = false;
                str += encodeURIComponent(k + '[' + key + ']') + "=" + encodeURIComponent(pl[k][key]);
            }
        }
        else {
            str += encodeURIComponent(k) + "=" + encodeURIComponent(pl[k]);
        }
    }
    return str;
}

module.exports = { authorityActionsToArr,URIEncodePayload };
