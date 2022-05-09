const Config = require('./viewConfig');
const WOQLStream = require('./woqlStream');

function WOQLStreamConfig() {
  Config.ViewConfig.call(this);
  this.type = 'stream';
}

Object.setPrototypeOf(WOQLStreamConfig.prototype, Config.ViewConfig.prototype);

WOQLStreamConfig.prototype.create = function (client) {
  const wqt = new WOQLStream(client, this);
  return wqt;
};

WOQLStreamConfig.prototype.row = function () {
  // eslint-disable-next-line no-use-before-define
  const wqt = new WOQLStreamRule().scope('row');
  this.rules.push(wqt);
  return wqt;
};

WOQLStreamConfig.prototype.template = function (template) {
  if (!template) return this.mtemplate;
  this.mtemplate = template;
  return this;
};

WOQLStreamConfig.prototype.prettyPrint = function () {
  let str = 'view = View.stream();\n';
  if (typeof this.template() !== 'undefined') {
    str += `view.template(${JSON.stringify(this.template())})\n`;
  }
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < this.rules.length; i++) {
    str += `view.${this.rules[i].prettyPrint()}\n`;
  }
  return str;
};

WOQLStreamConfig.prototype.loadJSON = function (config, rules) {
  const jr = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < rules.length; i++) {
    // eslint-disable-next-line no-use-before-define
    const nr = new WOQLStreamRule();
    nr.json(rules[i]);
    jr.push(nr);
  }
  this.rules = jr;
  if (config.template) {
    this.mtemplate = config.template;
  }
};

WOQLStreamConfig.prototype.json = function () {
  const jr = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < this.rules.length; i++) {
    jr.push(this.rules[i].json());
  }
  const conf = {};
  if (this.mtemplate) {
    conf.template = this.mtemplate;
  }
  const mj = { stream: conf, rules: jr };
  return mj;
};

function WOQLStreamRule() {
  Config.WOQLViewRule.call(this);
}

Object.setPrototypeOf(WOQLStreamRule.prototype, Config.WOQLViewRule.prototype);

WOQLStreamRule.prototype.template = function (template) {
  if (!template) return this.rule.template;
  this.rule.template = template;
  return this;
};

module.exports = WOQLStreamConfig;
