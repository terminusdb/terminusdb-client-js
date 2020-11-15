const UTILS = require('../utils.js')
const WOQL = require('../woql.js')
const WOQLQ = require('./woqlPaging')
/**
 * @file WOQL Result Object
 * @license Apache Version 2
 * Object representing the result of a WOQL Query
 * @param {Object} results result JSON object as returned by WOQL query
 * @param {WOQLQuery} query the query object that generated the result
 * @param {Object} [config] optional result configuration options object
 *                 [config.no_compress] by default all URLs are compressed where possible (v:X rather than http://.../variable/x) set to true to return non-compressed values
 *                 [config.context] specify the JSON-LD context to use for compressing results - by default the query context will be used
 */
function WOQLResult(results, query, config) {
    this.bindings = results ? results.bindings : []
    this.insert_count = results ? results.inserts : 0
    this.delete_count = results ? results.deletes : 0
    this.transaction_retry_count = results ? results.transaction_retry_count : 0
    this.variable_names = results ? results['api:variable_names'] : false
    //console.log(results, this.variable_names)
    this.query = query ? query : WOQL.query()
    this.cursor = 0
    //if (!(config && config.no_compress)) {
    //    const context = results && results.prefixes ? results.prefixes : false
    //    this.compress(context)
    //}
}

/**
 * @param {Object} [context] optional context to use for compression - if ommitted query context is used
 */
WOQLResult.prototype.compress = function(context) {
    context = context || this.query.getContext()
    if(context){
        for (let i = 0; i < this.bindings.length; i++) {
            for (const prop of Object.keys(this.bindings[i])) {         
                const nprop = UTILS.shorten(prop, context)
                var nval = this.bindings[i][prop]
                if (typeof this.bindings[i][prop] == 'string') {
                    nval = UTILS.shorten(this.bindings[i][prop], context)
                } else if (Array.isArray(this.bindings[i][prop])) {
                    nval = []
                    for (var j = 0; j < this.bindings[i][prop].length; j++) {
                        let oval = this.bindings[i][prop][j]
                        if (typeof oval == 'string') oval = UTILS.shorten(oval, context)
                        else if (Array.isArray(oval)) {
                            let noval = []
                            for (var k = 0; k < oval.length; k++) {
                                let kval = oval[k]
                                if (typeof kval == 'string') kval = UTILS.shorten(kval, context)
                                noval.push(kval)
                            }
                            oval = noval
                        }
                        nval.push(oval)
                    }
                }
                delete this.bindings[i][prop]
                this.bindings[i][nprop] = nval
            }
        }
    }
    //console.log(this.bindings)
    return this
}

/**
 * Returns true if there are any results
 */
WOQLResult.prototype.hasBindings = function() {
    if (this.bindings && this.count()) return true
    return false
}

/**
 * Returns true if there are any results
 */
WOQLResult.prototype.hasUpdates = function() {
    if (this.inserts() > 0 || this.deletes() > 0) return true
    return false
}

/**
 * Returns original array of bindings returned by API
 */
WOQLResult.prototype.getBindings = function() {
    return this.bindings
}

WOQLResult.prototype.rows = function() {
    return this.bindings
}

/**
 * Returns list of variables returned in bindings from API
 */
WOQLResult.prototype.getVariableList = function() {
    if(this.variable_names){
        return this.variable_names
    }
    if (this.bindings && this.bindings[0]) {
        return Object.keys(this.bindings[0])
    }
    return []
}

/**
 * Number of rows in bound results
 */
WOQLResult.prototype.count = function() {
    return this.bindings.length
}

/**
 * Number of reported inserts
 */
WOQLResult.prototype.inserts = function() {
    return this.insert_count
}

/**
 * Number of reported inserts
 */
WOQLResult.prototype.deletes = function() {
    return this.delete_count
}

/**
 * Result set navigation
 */
WOQLResult.prototype.first = function() {
    this.cursor = 0
    return this.bindings[0]
}

WOQLResult.prototype.last = function() {
    this.cursor = this.bindings.length - 1
    return this.bindings[this.bindings.length - 1]
}

WOQLResult.prototype.next = function() {
    if (this.cursor >= this.bindings.length) return false
    const res = this.bindings[this.cursor]
    this.cursor++
    return res
}

WOQLResult.prototype.prev = function() {
    if (this.cursor > 0) {
        this.cursor--
        return this.bindings[this.cursor]
    }
}

/**
 * Normally sorting of results is the job of the query - this is just in case you want to resort results according to some key (variable)
 */
WOQLResult.prototype.sort = function(key, asc_or_desc) {
    this.bindings.sort((a, b) => {
        return this.compareValues(a[key], b[key], asc_or_desc)
    })
    this
}

/**
 * Compares results a, b according to "asc" or "desc" order
 */
WOQLResult.prototype.compareValues = function(a, b, asc_or_desc = 'asc') {
    if (!a || !b) return 0
    if (typeof a['@value'] != 'undefined' && typeof b['@value'] != 'undefined') {
        a = a['@value']
        b = b['@value']
    }
    if (a > b) {
        return asc_or_desc && asc_or_desc == 'asc' ? 1 : -1
    }
    if (b > a) {
        return asc_or_desc && asc_or_desc == 'asc' ? -1 : 1
    }
}

module.exports = WOQLResult
