const UTILS = require('../utils');

/**
 * @file Terminus Rules
 * @license Apache Version 2
 * Abstract object to support applying matching rules to result sets and documents
 * sub-classes are FrameRule and WOQLRule - this just has common functions
 */
function TerminusRule() {}

/**
 * @param {Boolean} tf - the rule will match all literals or all non-literals
 */
TerminusRule.prototype.literal = function (tf) {
  if (typeof tf === 'undefined') {
    return this.pattern.literal;
  }
  this.pattern.literal = tf;
  return this;
};

/**
 * @param {[TYPE_URLS]} list - parameters are types identified by prefixed URLS (xsd:string...)
 */
TerminusRule.prototype.type = function (...list) {
  if (typeof list === 'undefined' || list.length === 0) {
    return this.pattern.type;
  }
  this.pattern.type = list;
  return this;
};

/**
 * Specifies the scope of a rule - row / cell / object / property / * .. what part
 * of the result does the rule apply to
 */
TerminusRule.prototype.scope = function (scope) {
  if (typeof scope === 'undefined') {
    return this.pattern.scope;
  }
  this.pattern.scope = scope;
  return this;
};

/**
 * Specifies that the rule matches a specific value
 */
TerminusRule.prototype.value = function (...val) {
  if (typeof val === 'undefined') {
    return this.pattern.value;
  }
  this.pattern.value = val;
  return this;
};

/**
 * Produces a canonical json format to represent the rule
 */
TerminusRule.prototype.json = function (mjson) {
  if (!mjson) {
    const njson = {};
    if (this.pattern) njson.pattern = this.pattern.json();
    if (this.rule) njson.rule = this.rule;
    return njson;
  }

  if (mjson.pattern) this.pattern.setPattern(mjson.pattern);
  if (mjson.rule) this.rule = mjson.rule;

  return this;
};

/**
 * Contained Pattern Object to encapsulate pattern matching
 * @param {Object} pattern
 */
// eslint-disable-next-line no-unused-vars
function TerminusPattern(pattern) {}

TerminusPattern.prototype.setPattern = function (pattern) {
  if (typeof pattern.literal !== 'undefined') this.literal = pattern.literal;
  if (pattern.type) this.type = pattern.type;
  if (pattern.scope) this.scope = pattern.scope;
  if (pattern.value) this.value = pattern.value;
};

TerminusPattern.prototype.json = function () {
  const json = {};
  if (typeof this.literal !== 'undefined') json.literal = this.literal;
  if (this.type) json.type = this.type;
  if (this.scope) json.scope = this.scope;
  if (this.value) json.value = this.value;
  return json;
};

/**
 * Tests whether the passed values matches the basic pattern
 */
TerminusPattern.prototype.testBasics = function (scope, value) {
  if (this.scope && scope && this.scope !== scope) return false;
  if (this.type) {
    const dt = value['@type'];
    if (!dt || !this.testValue(dt, this.type)) return false;
  }
  if (typeof this.literal !== 'undefined') {
    if (!(this.literal === !(typeof value['@type'] === 'undefined'))) return false;
  }
  if (typeof this.value !== 'undefined') {
    if (!this.testValue(value, this.value)) return false;
  }
  return true;// passed all tests
};

TerminusPattern.prototype.testValue = function (value, constraint) {
  const vundertest = (value['@value'] ? value['@value'] : value);
  if (typeof constraint === 'function') return constraint(vundertest);
  // eslint-disable-next-line no-param-reassign
  if (constraint && !Array.isArray(constraint)) constraint = [constraint];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < constraint.length; i++) {
    const nc = constraint[i];
    if (typeof vundertest === 'string') {
      if (this.stringMatch(nc, vundertest)) return true;
    } else if (typeof vundertest === 'number') {
      if (this.numberMatch(nc, vundertest)) return true;
    }
  }
  return false;
};

/**
 * Unpacks an array into a list of arguments
 * @param {Boolean} nonstring - if set, the values will be double-quoted only when
 * they are strings, otherwise, all will be quoted as strings
 */
TerminusPattern.prototype.unpack = function (arr, nonstring) {
  let str = '';
  if (nonstring) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] === 'string') {
        str += `"${arr[i]}"`;
      } else {
        str += arr[i];
      }
      if (i < (arr.length - 1)) str += ', ';
    }
  } else {
    str = `"${arr.join('","')}"`;
  }
  return str;
};

TerminusPattern.prototype.IDsMatch = function (ida, idb) {
  return UTILS.compareIDs(ida, idb);
};

TerminusPattern.prototype.classIDsMatch = function (ida, idb) {
  return this.IDsMatch(ida, idb);
};

TerminusPattern.prototype.propertyIDsMatch = function (ida, idb) {
  const match = this.IDsMatch(ida, idb);
  return match;
};

TerminusPattern.prototype.rangeIDsMatch = function (ida, idb) {
  return this.IDsMatch(ida, idb);
};

TerminusPattern.prototype.valuesMatch = function (vala, valb) {
  return vala === valb;
};
TerminusPattern.prototype.numberMatch = function (vala, valb) {
  if (typeof vala === 'string') {
    try {
      // eslint-disable-next-line no-eval
      return eval(valb + vala);
    } catch (e) {
      return false;
    }
  }
  return vala === valb;
};

TerminusPattern.prototype.stringMatch = function (vala, valb) {
  if (vala.substring(0, 1) === '/') {
    const pat = new RegExp(vala.substring(1));
    return pat.test(valb);
  }

  return vala === valb;
};

module.exports = { TerminusRule, TerminusPattern };
