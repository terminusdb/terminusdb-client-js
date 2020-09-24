
module.exports = {
    WOQLClient:require('./lib/woqlClient'),
    UTILS:require('./lib/utils'),
    View:require('./lib/viewer/woqlView'),
    WOQL:require('./lib/woql'),
    WOQLResult:require('./lib/viewer/woqlResult'),
    WOQLTable:require('./lib/viewer/woqlTable'),
    WOQLGraph:require('./lib/viewer/woqlGraph'),
    axiosInstance:require('./lib/axiosInstance')
};