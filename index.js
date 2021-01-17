
module.exports = {
    WOQLClient:require('./lib/woqlClient'),
    /**
     * @type {typeof import('./lib/utils')}
     */
    UTILS:require('./lib/utils'),
    /**
     * @type {typeof import('./lib/viewer/woqlView')}
     */
    View:require('./lib/viewer/woqlView'),
    /**
     * @type {typeof import('./lib/woql')}
     */
    WOQL:require('./lib/woql'),
    WOQLResult:require('./lib/viewer/woqlResult'),
    WOQLTable:require('./lib/viewer/woqlTable'),
    WOQLGraph:require('./lib/viewer/woqlGraph'),
    axiosInstance:require('./lib/axiosInstance')
};
