module.exports = {
    /**
     * @type {typeof import('./lib/woqlClient')}
     */
    WOQLClient: require('./lib/woqlClient'),
    /**
     * @type {import('./lib/utils')}
     */
    UTILS: require('./lib/utils'),
    /**
     * @type {import('./lib/woqlView')}
     */
    View: require('./lib/viewer/woqlView'),
    /**
     * @type {import('./lib/woql')}
     */
    WOQL: require('./lib/woql'),
    /**
     * @type {import('./lib/viewer/woqlResult')}
     */
    WOQLResult: require('./lib/viewer/woqlResult'),
    /**
     * @type {typeof import('./lib/viewer/woqlTable')}
     */
    WOQLTable: require('./lib/viewer/woqlTable'),
    /**
     * @type {typeof import('./lib/viewer/woqlGraph')}
     */
    WOQLGraph: require('./lib/viewer/woqlGraph'),
    /**
     * @type {typeof import('./lib/axiosInstance')}
     */
    axiosInstance: require('./lib/axiosInstance'),
}
