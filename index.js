module.exports = {
    /**
     * @type {typeof import('./lib/woqlClient').WOQLClient}
     */
    WOQLClient: require('./lib/woqlClient'),
    /**
     * @type {typeof import('./lib/utils').UTILS}
     */
    UTILS: require('./lib/utils'),
    /**
     * @type {typeof import('./lib/woqlView').View}
     */
    View: require('./lib/viewer/woqlView'),
    /**
     * @type {typeof import('./lib/woql').WOQL}
     */
    WOQL: require('./lib/woql'),
    /**
     * @type {typeof import('./lib/viewer/woqlResult').WOQLResult}
     */
    WOQLResult: require('./lib/viewer/woqlResult'),
    /**
     * @type {typeof import('./lib/viewer/woqlTable').WOQLTable}
     */
    WOQLTable: require('./lib/viewer/woqlTable'),
    /**
     * @type {typeof import('./lib/viewer/woqlGraph').WOQLGraph}
     */
    WOQLGraph: require('./lib/viewer/woqlGraph'),
    /**
     * @type {typeof import('./lib/axiosInstance').axiosInstance}
     */
    axiosInstance: require('./lib/axiosInstance'),
}
