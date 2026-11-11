const WOQLChartConfig = require('./chartConfig');

/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
function WOQLChart(client, config) {
  this.client = client;
  this.config = (config || new WOQLChartConfig());
  return this;
}

WOQLChart.prototype.options = function (config) {
  this.config = config;
  return this;
};

WOQLChart.prototype.setResult = function (res) {
  this.result = res;
  return this;
};
