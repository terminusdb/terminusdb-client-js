/**
 * @file Terminus Client Utility Functions
 * @license Apache Version 2
 * Object for bunding up common Terminus Utility Functions
 */
const Utils = {}

/**
 * default set of prefixes that will be used for URL compression
 */
Utils.standard_urls = {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    xdd: 'http://terminusdb.com/schema/xdd#',
    owl: 'http://www.w3.org/2002/07/owl#',
    system: 'http://terminusdb.com/schema/system#',
    vio: 'http://terminusdb.com/schema/vio#',
    repo: 'http://terminusdb.com/schema/repository#',
    layer: 'http://terminusdb.com/schema/layer#',
    woql: 'http://terminusdb.com/schema/woql#',
    ref: 'http://terminusdb.com/schema/ref#',
    api: 'http://terminusdb.com/schema/api#',
}

/**
 * Encode document payload for GET
 */
Utils.URIEncodePayload = function(payload) {
    if (typeof payload === 'string') return encodeURIComponent(payload)
    const payloadArr = []
    for (const key of Object.keys(payload)) {
        if (typeof payload[key] === 'object') {
            for (const keyElement of Object.keys(payload[key])) {
                const valueElement = payload[key][keyElement]
                payloadArr.push(
                    `${encodeURIComponent(keyElement)}=${encodeURIComponent(valueElement)}`,
                )
            }
        } else {
            payloadArr.push(`${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`)
        }
    }
    return payloadArr.join('&')
}

/**
 * Adds an entry to the list of known standard URL prefixes
 */
Utils.addURLPrefix = function(prefix, url) {
    this.standard_urls[prefix] = url
}

/**
 * is the object empty?
 * returns true if the json object is empty
 */
Utils.empty = function(obj) {
    // null and undefined are "empty"
    if (!obj) return true
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false
    if (obj.length === 0) return true
    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    // for (const key in obj) {
    if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) return false
        }
    }
    return true
}

/**
 * Generates a unique node id
 */
Utils.genBNID = function(base) {
    base = base || ""
    const r = Math.random()
        .toString(36)
        .substring(7)
    const d = new Date()
    const bnid = `doc:${base}${r}${d.getTime()}`
    return bnid
}

/**
 * Returns the shorthand version (compressed to prefix:id ) of a url or false if there is none known for that URL
 */
Utils.getShorthand = function(link) {
    if (typeof link === 'object' && link.length) link = link[0]
    if (link && typeof link === 'string') {
        for (const pref of Object.keys(this.standard_urls)) {
            const full = this.standard_urls[pref]
            if (link.substring(0, full.length) === full) {
                const sh = `${pref}:${link.substring(full.length)}`
                return sh
            }
        }
    }
    return false
}

/**
 * Compares 2 IRIs for equality by checking compressed and expanded versions of both sides
 */
Utils.compareIDs = function(ida, idb) {
    if (ida === idb) return true
    if (this.unshorten(ida) === idb) return true
    if (this.shorten(ida) === idb) return true
    if (this.unshorten(ida) === this.unshorten(idb)) return true
    return false
}

/**
 * Shortens a URL to its compressed format - returns the full URL if not possible
 */
Utils.shorten = function(url, prefixes) {
    if(!url) return url
    prefixes = prefixes || Utils.standard_urls
    for (const pref in prefixes) {
        if (prefixes[pref] == url.substring(0, prefixes[pref].length)) {
            return `${pref}:${url.substring(prefixes[pref].length)}`
        }
    }
    return url
}

/**
 * Expands a URL to its full URL format - returns the passed string if not possible to expand
 */
Utils.unshorten = function(url) {
    if(!url) return url
    if (this.validURL(url)) return url
    if (!url) return url
    const bits = url.split(':')
    if (bits[1]) {
        if (this.standard_urls[bits[0]]) {
            return this.standard_urls[bits[0]] + bits[1]
        }
    }
    return url
}

/**
 * Tests a string to see if it is a valid URL -
 * Valid URLs are those that start with http:// or https://
 */
Utils.validURL = function(str) {
    if(str && typeof str != "string") str = "" + str
    if (str && (str.substring(0, 7) === 'http://' || str.substring(0, 8) === 'https://'))
        return true
    return false
}

/**
 * Tests a string to see if it is a valid URL -
 * Valid URLs are those that start with http:// or https://
 */
Utils.isIRI = function(str, context, allow_shorthand) {
    if(!str) return false
    if(allow_shorthand && context && context[str.split(":")[0]]) return true
    if(context){
        for(pref in context){
            if(str.substring(0, context[pref].length) == context[pref]) return true
        }
    }
    let prot = str.split(":")[0]
    let valids = ["http", "https", "terminusdb"]
    if(valids.indexOf(prot) != -1) return true
    return false
}


/**
 * Generates a text label from a URL
 */
Utils.labelFromURL = function(url) {
    let nurl = this.urlFragment(url)
    nurl = nurl || url
    if (nurl.lastIndexOf('/') < nurl.length - 1) {
        nurl = nurl.substring(nurl.lastIndexOf('/') + 1)
    }
    nurl = nurl.replace(/_/g, ' ')
    return nurl.charAt(0).toUpperCase() + nurl.slice(1)
}

/**
 * Generates a text label from a URL
 */
Utils.labelFromVariable = function(v) {
    v = v.replace(/_/g, ' ')
    return v.charAt(0).toUpperCase() + v.slice(1)
}

/**
 * returns the fragment part of a URL (whether compressed or not)
 */
Utils.urlFragment = function(url) {
    url = typeof url !== 'string' ? window.location.href : url
    let bits = url.split('#')
    if (bits.length <= 1) {
        if (!this.validURL(url)) {
            bits = url.split(':')
        }
    }
    if (bits.length >= 1) {
        const [, urlStr] = bits

        if (urlStr) {
            const [baseUrl] = urlStr.split('?')
            url = baseUrl
        }
    }
    return url
}

/**
 * returns the last part of a URL after the last /
 */
Utils.lastURLBit = function(url) {
    url = typeof url === 'undefined' ? window.location.href : url
    const [urlFirst] = url.split('#')
    const [urlTmp] = urlFirst.split('?')
    url = urlTmp.substring(url.lastIndexOf('/') + 1)
    return url
}

/**
 * returns the a standard URL associated with a given prefix and extension
 */
Utils.getStdURL = function(pref, ext, url) {
    if (this.standard_urls[pref]) {
        if (url) {
            if (url === this.standard_urls[pref] + ext) return url
        } else {
            return this.standard_urls[pref] + ext
        }
    }
    return false
}

/*
 * Utility function adds v: to variables...
 */
Utils.addNamespacesToVariables = function(vars) {
    var nvars = []
    for (var i = 0; i < vars.length; i++) {
        if (vars[i]) nvars.push(this.addNamespaceToVariable(vars[i]))
    }
    return nvars
}

Utils.addNamespaceToVariable = function(v) {
    if (typeof v == 'string' && v.substring(0, 2) != 'v:') return 'v:' + v
    return v
}

/*
 * Utility function removes v: prefix from a variable...
 */
Utils.removeNamespaceFromVariable = function(mvar) {
    if (mvar.substring(0, 2) == 'v:') return mvar.substring(2)
    return mvar
}

/*
 * Utility function removes v: prefix from an array of variables
 */
Utils.removeNamespacesFromVariables = function(vars) {
    var nvars = []
    for (var i = 0; i < vars.length; i++) {
        nvars.push(this.removeNamespaceFromVariable(vars[i]))
    }
    return nvars
}

/*
 * Utility function to extract a value from a config rule - if the value is a variable, take the value of that variable instead
 */
Utils.getConfigValue = function(val, row) {
    if (typeof val == 'string') val = this.removeNamespaceFromVariable(val)
    if (typeof val == 'string' && row[val]) {
        var rad = row[val]
        if (rad && rad['@value']) return rad['@value']
        return rad
    } else {
        return val
    }
}

/**
 * TypeHelper bundles together utility functions dealing with datatypes
 */
Utils.TypeHelper = {}

/**
 * Returns true if the passed type is an xsd:string (compressed or not)
 */
Utils.TypeHelper.isStringType = function(stype) {
    if (stype === 'http://www.w3.org/2001/XMLSchema#string') return true
    if (stype === 'xsd:string') return true
    return false
}

Utils.TypeHelper.isDatatype = function(stype) {
    var sh = Utils.shorten(stype)
    if ((sh && sh.substring(0, 4) == 'xsd:') || sh.substring(0, 4) == 'xdd:') return true
    return false
}

/**
 * Adds 3 order magnitude separators ( default ,) into big numbers for legibility
 */
Utils.TypeHelper.numberWithCommas = function(value, separator) {
    separator = separator || ','
    if (value >= 1000 || value <= -1000) {
        const parts = value.toString().split('.')
        if (value <= -1000) parts[0] = parts[0].substring(1)
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
        if (value <= -1000) value = `-${parts.join('.')}`
        else value = parts.join('.')
    }
    return value
}

Utils.TypeHelper.formatBytes = function (bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * List of supported datatypes
 */
Utils.TypeHelper.datatypes = [
    'xdd:coordinate',
    'xdd:coordinatePolyline',
    'xdd:coordinatePolygon',
    'xdd:dateRange',
    'xdd:gYearRange',
    'xdd:integerRange',
    'xdd:decimalRange',
    'xdd:cc',
    'xdd:email',
    'xdd:html',
    'xdd:url',
    'xsd:anySimpleType',
    'xsd:string',
    'xsd:boolean',
    'xsd:decimal',
    'xsd:double',
    'xsd:float',
    'xsd:time',
    'xsd:date',
    'xsd:dateTime',
    'xsd:dateTimeStamp',
    'xsd:gYear',
    'xsd:gMonth',
    'xsd:gDay',
    'xsd:gYearMonth',
    'xsd:gMonthDay',
    'xsd:duration',
    'xsd:yearMonthDuration',
    'xsd:dayTimeDuration',
    'xsd:byte',
    'xsd:short',
    'xsd:integer',
    'xsd:long',
    'xsd:unsignedByte',
    'xsd:unsignedInt',
    'xsd:unsignedLong',
    'xsd:nonNegativeInteger',
    'xsd:positiveInteger',
    'xsd:negativeInteger',
    'xsd:nonPositiveInteger',
    'xsd:base64Binary',
    'xsd:anyURI',
    'xsd:language',
    'xsd:normalizedString',
    'xsd:token',
    'xsd:NMTOKEN',
    'xsd:Name',
    'xsd:NCName',
    'xsd:NOTATION',
    'xsd:QName',
    'xsd:ID',
    'xsd:IDREF',
    'xsd:ENTITY',
    'rdf:XMLLiteral',
    'rdf:PlainLiteral',
    'rdfs:Literal',
    'xdd:json',
]

Utils.TypeHelper.parseRangeValue = function(val, dividor) {
    dividor = dividor || ','
    let vals = []
    if (typeof val === 'object' && val.length) {
        vals = val
    } else if (val) {
        if (typeof val !== 'string') {
            val = `${val}`
        }
        if (val.length && val.charAt(0) === '[' && val.charAt(val.length - 1) === ']') {
            vals.push(val.substring(1, val.indexOf(dividor)))
            vals.push(val.substring(val.indexOf(dividor) + 1, val.length - 1))
        } else {
            vals.push(val)
        }
    }
    return vals
}

/**
 * DateHelper bundles together utility functions dealing with xsd date types
 */
Utils.DateHelper = {}

/**
 * Takes an xsd time string and returns a structure {hour: HH, minute: MM, second ss.ssssss, timezone: tz}
 */
Utils.DateHelper.parseXsdTime = function(val) {
    if (!val) return {}
    const tz = this.extractXsdTimezone(val)
    if (tz) {
        val = val.substring(0, val.length - tz.length)
    }
    const parsed = {
        hour: val.substring(0, 2),
        minute: val.substring(3, 5),
        second: val.substring(6),
        timezone: tz,
    }
    return parsed
}

/**
 * Takes an xsd time string and returns a structure {year: [-]YYYY, month: MM, day: dd}
 */
Utils.DateHelper.parseXsdDate = function(val) {
    const tz = this.extractXsdTimezone(val)
    if (tz) {
        val = val.substring(0, val.length - tz.length)
    }
    let year
    if (val.substring(0, 1) === '-') {
        year = val.substring(0, 5)
    } else {
        year = val.substring(0, 4)
    }
    let parsed
    if (year && Math.abs(year) < 10000) {
        let month = val.substring(year.length + 1, year.length + 3)
        if (month) {
            month = parseInt(month, 10)
        } else return false
        let day = val.substring(year.length + 4)
        if (day) day = parseInt(day, 10)
        else return false
        parsed = {
            year,
            month,
            day,
            timezone: tz,
        }
    }
    return parsed
}

/**
 * Parses a date string of type ty
 */
Utils.DateHelper.parseDate = function(ty, value) {
    let parsed
    if (ty === 'xsd:date') {
        parsed = this.parseXsdDate(value)
    } else if (ty === 'xsd:time') {
        parsed = this.parseXsdTime(value)
    } else if (ty === 'xsd:dateTime') {
        parsed = this.parseXsdDateTime(value)
    } else if (ty === 'xsd:gYear') {
        parsed = {year: value}
    } else if (ty === 'xsd:gYearRange') {
        parsed = {year: value}
    } else if (ty === 'xsd:gMonth') {
        parsed = {month: value.substring(2)}
    } else if (ty === 'xsd:gDay') {
        parsed = {day: value}
    } else if (ty === 'xsd:gYearMonth') {
        const bits = value.split('-')
        while (bits.length < 2) bits.push('')
        parsed = {year: bits[0], month: bits[1]}
    } else if (ty === 'xsd:gMonthDay') {
        const bits = value.split('-')
        while (bits.length < 2) bits.push('')
        parsed = {month: bits[0], day: bits[1]}
    } else if (ty === 'xsd:dateTimeStamp') {
        parsed = this.parseXsdDateTime(value)
    }
    return parsed
}

/**
 * adds appropriate padding to date type for xsd rules
 */
Utils.DateHelper.addXsdPadding = function(parsed) {
    const nparsed = {}
    if (typeof parsed.year !== 'undefined' && parsed.year !== false && parsed.year < 1000) {
        if (Math.abs(parsed.year) < 10)
            nparsed.year = parsed.year < 0 ? `-000${Math.abs(parsed.year)}` : `000${parsed.year}`
        else if (Math.abs(parsed.year) < 100)
            nparsed.year = parsed.year < 0 ? `-00${Math.abs(parsed.year)}` : `00${parsed.year}`
        else nparsed.year = parsed.year < 0 ? `-0${Math.abs(parsed.year)}` : `0${parsed.year}`
    } else if (parsed.year) {
        nparsed.year = parsed.year
    }
    if (typeof parsed.month !== 'undefined' && parsed.month !== false && parsed.month < 10) {
        nparsed.month = `0${parsed.month}`
    } else if (parsed.month) {
        nparsed.month = parsed.month
    }
    if (typeof parsed.day !== 'undefined' && parsed.day !== false && parsed.day < 10) {
        nparsed.day = `0${parsed.day}`
    } else if (parsed.day) {
        nparsed.day = parsed.day
    }
    if (typeof parsed.hour !== 'undefined' && parsed.hour !== false && parsed.hour < 10) {
        nparsed.hour = `0${parsed.hour}`
    } else if (parsed.hour) {
        nparsed.hour = parsed.hour
    }
    if (typeof parsed.minute !== 'undefined' && parsed.minute !== false && parsed.minute < 10) {
        nparsed.minute = `0${parsed.minute}`
    } else if (parsed.minute) {
        nparsed.minute = parsed.minute
    }
    if (typeof parsed.second !== 'undefined' && parsed.second !== false && parsed.second < 10) {
        nparsed.second = `0${parsed.second}`
    } else if (parsed.second) {
        nparsed.second = parsed.second
    }
    return nparsed
}

/**
 * generates an xsd string of type ty for the passed parsed structure (year, month, day, hour, minute, second, timezone)
 */
Utils.DateHelper.xsdFromParsed = function(parsed, ty) {
    const xparsed = this.addXsdPadding(parsed)
    let ret
    if (ty === 'xsd:gYear') {
        ret = xparsed.year ? xparsed.year : false
    } else if (ty === 'xsd:time') {
        return xparsed.hour && xparsed.minute && xparsed.second
            ? `${xparsed.hour}:${xparsed.minute}:${xparsed.second}`
            : false
    } else if (ty === 'xsd:date') {
        return xparsed.year && xparsed.month && xparsed.day
            ? `${xparsed.year}-${xparsed.month}-${xparsed.day}`
            : false
    } else if (ty === 'xsd:dateTime' || ty === 'xsd:dateTimeStamp') {
        ret =
            xparsed.year && xparsed.month && xparsed.day
                ? `${xparsed.year}-${xparsed.month}-${xparsed.day}T`
                : false
        if (ret)
            ret += `${xparsed.hour ? xparsed.hour : '12'}:${
                xparsed.minute ? xparsed.minute : '00'
            }:${xparsed.second ? xparsed.second : '00'}`
    } else if (ty === 'xsd:gMonth') {
        ret = xparsed.month ? `--${xparsed.month}` : false
    } else if (ty === 'xsd:gDay') {
        ret = xparsed.day ? `---${xparsed.day}` : false
    } else if (ty === 'xsd:gYearMonth') {
        ret = xparsed.year && xparsed.month ? `${xparsed.year}-${xparsed.month}` : false
    } else if (ty === 'xsd:gMonthDay') {
        ret = xparsed.day && xparsed.month ? `--${xparsed.month}-${xparsed.day}` : false
    }
    if (xparsed.timezone) {
        ret += xparsed.timezone
    }
    return ret
}

/**
 * Converts between a unix timestamp and a parsed structure
 */
Utils.DateHelper.convertTimestampToXsd = function(val) {
    const a = new Date(val * 1000)
    const parsed = {
        year: a.getFullYear(),
        month: a.getMonth() + 1,
        day: a.getDate(),
        hour: a.getHours(),
        minute: a.getMinutes(),
        second: a.getSeconds(),
    }
    return parsed
}

/**
 * Parses an xsd date time into a structure
 */
Utils.DateHelper.parseXsdDateTime = function(val) {
    if (!val) return {}
    if (typeof val === 'number') {
        return this.convertTimestampToXsd(val)
    }
    const tz = this.extractXsdTimezone(val)
    if (tz) {
        val = val.substring(0, val.length - tz.length)
    }
    const datetime = this.parseXsdDate(val)
    const ptime = this.parseXsdTime(val.substring(val.indexOf('T') + 1))

    for (const i of Object.keys(ptime)) {
        datetime[i] = ptime[i]
    }
    datetime.timezone = tz
    return datetime
}

/**
 * Extracts the timezone data from an xsd date string
 */
Utils.DateHelper.extractXsdTimezone = function(val) {
    if (val && val.charAt(val.length - 1) === 'Z') {
        return 'Z'
    }
    if (val && (val.charAt(val.length - 6) === '+' || val.charAt(val.length - 6) === '-')) {
        val.substring(val.length - 6)
    }
    return false
}

module.exports = Utils
