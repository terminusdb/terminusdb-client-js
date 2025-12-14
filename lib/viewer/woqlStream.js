const WOQLStreamConfig = require('./streamConfig');

/**
 * @typedef {Object} WOQLClient
 */

/**
 * @param {WOQLClient} client
 * @param {WOQLStreamConfig} config
 * @returns {WOQLStream}
 */
function WOQLStream(client, config) {
  this.client = client;
  this.config = (config || new WOQLStreamConfig());
  return this;
}

WOQLStream.prototype.options = function (config) {
  this.config = config;
  return this;
};

WOQLStream.prototype.setResult = function (wqrs) {
  this.result = wqrs;
};

module.exports = WOQLStream;
