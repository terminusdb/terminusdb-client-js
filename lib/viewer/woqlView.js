const WOQLTableConfig = require('./tableConfig');
const WOQLChooserConfig = require('./chooserConfig');
const WOQLGraphConfig = require('./graphConfig');
const WOQLChartConfig = require('./chartConfig');
const WOQLStreamConfig = require('./streamConfig');
const FrameConfig = require('./frameConfig');
const { WOQLRule } = require('./woqlRule');
const { FrameRule } = require('./frameRule');

/**
 * We bundle the useful functions in a View object and just export that for ease of consumption
 * @constructor
 * View
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
const View = {};

/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.table = function () { return new WOQLTableConfig(); };
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.chart = function () { return new WOQLChartConfig(); };
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.graph = function () { return new WOQLGraphConfig(); };
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.chooser = function () { return new WOQLChooserConfig(); };
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.stream = function () { return new WOQLStreamConfig(); };
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.document = function () { return new FrameConfig(); };
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.loadConfig = function (config) {
  let view;
  if (config.table) {
    view = new WOQLTableConfig();
    view.loadJSON(config.table, config.rules);
  } else if (config.chooser) {
    view = new WOQLChooserConfig();
    view.loadJSON(config.chooser, config.rules);
  } else if (config.graph) {
    view = new WOQLGraphConfig();
    view.loadJSON(config.graph, config.rules);
  } else if (config.chart) {
    view = new WOQLChartConfig();
    view.loadJSON(config.chart, config.rules);
  } else if (config.stream) {
    view = new WOQLStreamConfig();
    view.loadJSON(config.stream, config.rules);
  } else if (config.frame) {
    view = new FrameConfig();
    view.loadJSON(config.frame, config.rules);
  }
  return view;
};

/**
 * Shorthand functions for accessing the pattern matching capabilities
 */
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.rule = function (type) {
  if (type && type === 'frame') return new FrameRule();
  return new WOQLRule();
};

/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.pattern = function (type) {
  if (type && type === 'woql') return new WOQLRule().pattern;
  return new FrameRule().pattern;
};

/**
 * Called to match an entire row of results is matched by a set of rules
 * returns array of rules that matched
 */
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.matchRow = function (rules, row, rownum, action) {
  return new WOQLRule().matchRow(rules, row, rownum, action);
};

/**
 * Called to test whether an entire column of results is matched by a set of rules
 * returns array of rules that matched
 */
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.matchColumn = function (rules, key, action) {
  return new WOQLRule().matchColumn(rules, key, action);
};

/**
 * Called to test whether a specific cell is matched by a set of rules
 * returns array of rules that matched
 */
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.matchCell = function (rules, row, key, rownum, action) {
  return new WOQLRule().matchCell(rules, row, key, rownum, action);
};

/**
 * Called to test whether a specific node is matched by a set of rules
 * returns array of rules that matched
 */
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.matchNode = function (rules, row, key, nid, action) {
  return new WOQLRule().matchNode(rules, row, key, nid, action);
};

/**
 * Called to test whether a specific edge (source -> target) is matched by a set of rules
 * returns array of rules that matched
 */
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.matchEdge = function (rules, row, keya, keyb, action) {
  return new WOQLRule().matchPair(rules, row, keya, keyb, action);
};

/**
 * Called to test whether a specific frame is matched by a set of rules
 */
/**
 * @deprecated Data rendering is outside the scope of this package and the
 * lib/viewer modules will be removed in a future major release. Render query
 * results in your application instead.
 */
View.matchFrame = function (rules, frame, onmatch) {
  return new FrameRule().testRules(rules, frame, onmatch);
};

module.exports = View;
