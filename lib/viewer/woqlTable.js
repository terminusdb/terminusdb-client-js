/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-redeclare */
/* eslint-disable block-scoped-var */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-unused-vars */
const WOQLTableConfig = require('./tableConfig');
const UTILS = require('../utils');
const WOQLRule = require('./woqlRule');
const WOQLResult = require('./woqlResult');
const WOQLClient = require('../woqlClient');

/**
 * @module WOQLTable
 * @license Apache Version 2
 * @param {WOQLClient} [client] we need an client if we do a server side pagination,sorting etc...
 * @param {WOQLTableConfig} [config]
 * @returns {WOQLTable}
 */

function WOQLTable(client, config) {
  this.client = client;
  this.config = config || new WOQLTableConfig();
  return this;
}

/**
 * set the WOQLTableConfig for this table
 * @param {WOQLTableConfig} config
 * @returns {WOQLTable}
 */

WOQLTable.prototype.options = function (config) {
  this.config = config;
  return this;
};

/**
 * Set the query result using the WOQLResult object
 * @param {WOQLResult} result - the WOQLResult object
 * @returns {WOQLTable}
 */

WOQLTable.prototype.setResult = function (result) {
  this.result = result;
  return this;
};

/**
 * @returns {number} the total result
 */
WOQLTable.prototype.count = function () {
  return this.result.count();
};

/**
 * Get the first object record from the result set
 * @returns {object}
 */
WOQLTable.prototype.first = function () {
  return this.result.first();
};

/**
 * Get the preview object record from the result set
 * @returns {object}
 */

WOQLTable.prototype.prev = function () {
  return this.result.prev();
};

/**
 * Get the next object record from the result set
 * @returns {object}
 */

WOQLTable.prototype.next = function () {
  return this.result.next();
};

/**
 * @returns {boolean}
 */

WOQLTable.prototype.canAdvancePage = function () {
  return this.result.count() === this.result.query.getLimit();
};

WOQLTable.prototype.canChangePage = function () {
  return this.canAdvancePage() || this.canRetreatPage();
};

WOQLTable.prototype.canRetreatPage = function () {
  return this.result.query.getPage() > 1;
};

WOQLTable.prototype.getPageSize = function () {
  return this.result.query.getLimit();
};

WOQLTable.prototype.setPage = function (l) {
  return this.result.query.setPage(l);
};

WOQLTable.prototype.getPage = function () {
  return this.result.query.getPage();
};

WOQLTable.prototype.setPageSize = function (l) {
  return this.update(this.result.query.setPageSize(l));
};

WOQLTable.prototype.nextPage = function () {
  return this.update(this.result.query.nextPage());
};

WOQLTable.prototype.firstPage = function () {
  return this.update(this.result.query.firstPage());
};

WOQLTable.prototype.previousPage = function () {
  return this.update(this.result.query.previousPage());
};

WOQLTable.prototype.getColumnsToRender = function () {
  if (this.hasColumnOrder()) {
    var cols = this.getColumnOrder();
  } else {
    var cols = this.result.getVariableList();
  }
  const self = this;
  return cols ? cols.filter((col) => !self.hidden(col)) : [];
};

WOQLTable.prototype.getColumnHeaderContents = function (colid) {
  colid = UTILS.removeNamespaceFromVariable(colid);
  const rules = new WOQLRule().matchColumn(this.config.rules, colid, 'header');
  // hr is an array header in not always the last item
  if (rules.length) {
    const header = rules[rules.length - 1].rule ? rules[rules.length - 1].rule.header : null;
    if (typeof header === 'string') {
      return header;
    } if (typeof header === 'function') {
      return header(colid);
    } return header;
  }
  if (colid[0] === '_') return ' ';
  return UTILS.labelFromVariable(colid);
  // return document.createTextNode(clab);
};

WOQLTable.prototype.hidden = function (col) {
  colid = UTILS.removeNamespaceFromVariable(col);
  const matched_rules = new WOQLRule().matchColumn(this.config.rules, colid, 'hidden');
  if (matched_rules.length) {
    return matched_rules[matched_rules.length - 1].rule.hidden;
  }
  return false;
};

/**
 * Called when you want to change the query associated with the table.
 */
WOQLTable.prototype.update = function (nquery) {
  return nquery.execute(this.client).then((results) => {
    const nresult = new WOQLResult(results, nquery);
    this.setResult(nresult);
    if (this.notify) this.notify(nresult);
    return nresult;
  });
};

WOQLTable.prototype.hasDefinedEvent = function (row, key, scope, action, rownum) {
  if (scope === 'row') {
    var matched_rules = new WOQLRule().matchRow(this.config.rules, row, rownum, action);
  } else {
    var matched_rules = new WOQLRule().matchCell(this.config.rules, row, key, rownum, action);
  }
  if (matched_rules && matched_rules.length) return true;
  return false;
};

// eslint-disable-next-line consistent-return
WOQLTable.prototype.getDefinedEvent = function (row, key, scope, action, rownum) {
  if (scope === 'row') {
    var matched_rules = new WOQLRule().matchRow(this.config.rules, row, rownum, action);
  } else {
    var matched_rules = new WOQLRule().matchCell(this.config.rules, row, key, rownum, action);
  }
  if (matched_rules && matched_rules.length) {
    const l = matched_rules.length - 1;
    return matched_rules[l].rule[action];
  }
};

WOQLTable.prototype.getRowClick = function (row) {
  const re = this.getDefinedEvent(row, false, 'row', 'click');
  return re;
};

WOQLTable.prototype.uncompressed = function (row, col) {
  const re = this.getDefinedEvent(row, col, 'row', 'uncompressed');
  return re;
};

WOQLTable.prototype.getCellClick = function (row, col) {
  const cc = this.getDefinedEvent(row, col, 'column', 'click');
  return cc;
};

WOQLTable.prototype.getRowHover = function (row) {
  return this.getDefinedEvent(row, false, 'row', 'hover');
};

WOQLTable.prototype.getCellHover = function (row, key) {
  return this.getDefinedEvent(row, key, 'column', 'hover');
};

WOQLTable.prototype.getColumnOrder = function () {
  return this.config.column_order();
};

WOQLTable.prototype.bindings = function () {
  return this.config.bindings();
};

WOQLTable.prototype.getColumnDimensions = function (key) {
  const cstyle = {};
  const w = new WOQLRule().matchColumn(this.config.rules, key, 'width');
  if (w && w.length && w[w.length - 1].rule.width) {
    cstyle.width = w[w.length - 1].rule.width;
  }
  const max = new WOQLRule().matchColumn(this.config.rules, key, 'maxWidth');
  if (max && max.length) cstyle.maxWidth = max[max.length - 1].rule.maxWidth;
  const min = new WOQLRule().matchColumn(this.config.rules, key, 'minWidth');
  if (min && min.length) cstyle.minWidth = min[min.length - 1].rule.minWidth;
  return cstyle;
};

WOQLTable.prototype.hasColumnOrder = WOQLTable.prototype.getColumnOrder;
WOQLTable.prototype.hasCellClick = WOQLTable.prototype.getCellClick;
WOQLTable.prototype.hasRowClick = WOQLTable.prototype.getRowClick;
WOQLTable.prototype.hasCellHover = WOQLTable.prototype.getCellHover;
WOQLTable.prototype.hasRowHover = WOQLTable.prototype.getRowHover;

WOQLTable.prototype.getRenderer = function (key, row, rownum) {
  return this.getDefinedEvent(row, key, 'column', 'renderer', rownum);
  // let args =  this.getDefinedEvent(row, key, "column", "args", rownum);
  // eslint-disable-next-line no-unreachable
  if (!renderer) {
    const r = this.getRendererForDatatype(row[key]);
    renderer = r.name;
    if (!args) args = r.args;
  }
  if (renderer) {
    return this.datatypes.createRenderer(renderer, args);
  }
};

WOQLTable.prototype.isSortableColumn = function (key) {
  if (this.getDefinedEvent(false, key, 'column', 'unsortable')) return false;
  return true;
};

WOQLTable.prototype.renderValue = function (renderer, val, key, row) {
  if (val && val['@type']) {
    renderer.type = val['@type'];
    var dv = new DataValue(val['@value'], val['@type'], key, row);
  } else if (val && val['@language']) {
    renderer.type = 'xsd:string';
    var dv = new DataValue(val['@value'], renderer.type, key, row);
  } else if (val && typeof val === 'string') {
    renderer.type = 'id';
    var dv = new DataValue(val, 'id', key, row);
  }
  if (dv) return renderer.renderValue(dv);
  return '';
};

function DataValue(val, type) {
  this.datavalue = val === 'system:unknown' ? '' : val;
  this.datatype = type;
}

DataValue.prototype.value = function (nvalue) {
  if (nvalue) {
    this.datavalue = nvalue;
    return this;
  }
  return this.datavalue;
};

WOQLTable.prototype.getRendererForDatatype = function (val) {
  if (val && val['@type']) {
    return this.datatypes.getRenderer(val['@type'], val['@value']);
  } if (val && val['@language']) {
    return this.datatypes.getRenderer('xsd:string', val['@value']);
  } if (val && typeof val === 'string') {
    return this.datatypes.getRenderer('id', val);
  }
  return false;
};

WOQLTable.prototype.getSpecificRender = function (key, row) {
  const rend = this.getDefinedEvent(row, key, 'column', 'render');
  return rend;
};

module.exports = WOQLTable;
