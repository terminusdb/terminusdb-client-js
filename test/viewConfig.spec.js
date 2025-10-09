const { expect } = require('chai');
const { ViewConfig, WOQLViewRule } = require('../lib/viewer/viewConfig');

describe('viewConfig tests', () => {
  describe('ViewConfig', () => {
    let config;

    beforeEach(() => {
      config = new ViewConfig();
    });

    describe('constructor', () => {
      it('should initialize with empty rules array', () => {
        expect(config.rules).to.be.an('array');
        expect(config.rules).to.have.lengthOf(0);
      });
    });

    describe('render()', () => {
      it('should set render function', () => {
        const renderFn = function() { return 'rendered'; };
        config.render(renderFn);
        expect(config.view_render).to.equal(renderFn);
      });

      it('should get render function', () => {
        const renderFn = function() { return 'test'; };
        config.view_render = renderFn;
        expect(config.render()).to.equal(renderFn);
      });

      it('should return undefined if not set', () => {
        expect(config.render()).to.be.undefined;
      });
    });

    describe('renderer()', () => {
      it('should set renderer value', () => {
        config.renderer('customRenderer');
        expect(config.view_renderer).to.equal('customRenderer');
      });

      it('should get renderer value', () => {
        config.view_renderer = 'myRenderer';
        expect(config.renderer()).to.equal('myRenderer');
      });

      it('should return undefined if not set', () => {
        expect(config.renderer()).to.be.undefined;
      });
    });

    describe('bindings()', () => {
      it('should set bindings', () => {
        const bindings = { var1: 'value1' };
        config.bindings(bindings);
        expect(config.vbindings).to.equal(bindings);
      });

      it('should get bindings', () => {
        const bindings = { var2: 'value2' };
        config.vbindings = bindings;
        expect(config.bindings()).to.equal(bindings);
      });

      it('should return undefined if not set', () => {
        expect(config.bindings()).to.be.undefined;
      });
    });

    describe('getRulesJSON()', () => {
      it('should return empty array when no rules', () => {
        const json = config.getRulesJSON();
        expect(json).to.be.an('array');
        expect(json).to.have.lengthOf(0);
      });

      it('should return JSON for all rules', () => {
        const rule1 = new WOQLViewRule();
        rule1.size('large');
        const rule2 = new WOQLViewRule();
        rule2.color(['red', 'blue']);
        
        config.rules.push(rule1, rule2);
        
        const json = config.getRulesJSON();
        expect(json).to.have.lengthOf(2);
        expect(json[0]).to.be.an('object');
        expect(json[1]).to.be.an('object');
      });
    });

    describe('getBasicJSON()', () => {
      it('should return empty object when nothing set', () => {
        const json = config.getBasicJSON();
        expect(json).to.deep.equal({});
      });

      it('should include render if set', () => {
        const renderFn = function() {};
        config.view_render = renderFn;
        const json = config.getBasicJSON();
        expect(json.render).to.equal(renderFn);
      });

      it('should include renderer if set', () => {
        config.view_renderer = 'myRenderer';
        const json = config.getBasicJSON();
        expect(json.renderer).to.equal('myRenderer');
      });

      it('should include bindings if set', () => {
        const bindings = { x: 'y' };
        config.vbindings = bindings;
        const json = config.getBasicJSON();
        expect(json.bindings).to.equal(bindings);
      });

      it('should include all properties when set', () => {
        const renderFn = function() {};
        const bindings = { a: 'b' };
        config.view_render = renderFn;
        config.view_renderer = 'renderer1';
        config.vbindings = bindings;
        
        const json = config.getBasicJSON();
        expect(json.render).to.equal(renderFn);
        expect(json.renderer).to.equal('renderer1');
        expect(json.bindings).to.equal(bindings);
      });
    });

    describe('loadBasicJSON()', () => {
      it('should load render from JSON with render key', () => {
        // The code checks json.render but sets json.view_render (seems like a bug)
        const renderFn = function() {};
        config.loadBasicJSON({ render: true, view_render: renderFn });
        expect(config.view_render).to.equal(renderFn);
      });

      it('should load renderer from JSON with renderer key', () => {
        // The code checks json.renderer but sets json.view_renderer (seems like a bug)
        config.loadBasicJSON({ renderer: true, view_renderer: 'customRenderer' });
        expect(config.view_renderer).to.equal('customRenderer');
      });

      it('should load bindings from JSON', () => {
        const bindings = { var: 'val' };
        config.loadBasicJSON({ bindings: bindings });
        expect(config.vbindings).to.equal(bindings);
      });

      it('should handle empty JSON', () => {
        config.loadBasicJSON({});
        expect(config.view_render).to.be.undefined;
        expect(config.view_renderer).to.be.undefined;
        expect(config.vbindings).to.be.undefined;
      });
    });

    describe('getBasicprettyPrint()', () => {
      it('should return empty string when nothing set', () => {
        const result = config.getBasicprettyPrint();
        expect(result).to.equal('');
      });

      it('should include render in pretty print', () => {
        config.view_render = function() { return 'test'; };
        const result = config.getBasicprettyPrint();
        expect(result).to.include('view.render(');
      });

      it('should include renderer in pretty print', () => {
        config.view_renderer = 'myRenderer';
        const result = config.getBasicprettyPrint();
        expect(result).to.include("view.renderer('myRenderer')");
      });

      it('should include bindings in pretty print', () => {
        config.vbindings = { x: 'y' };
        const result = config.getBasicprettyPrint();
        expect(result).to.include("view.bindings('[object Object]')");
      });

      it('should include all properties in pretty print', () => {
        config.view_render = function() {};
        config.view_renderer = 'renderer1';
        config.vbindings = { a: 'b' };
        
        const result = config.getBasicprettyPrint();
        expect(result).to.include('view.render(');
        expect(result).to.include("view.renderer('renderer1')");
        expect(result).to.include('view.bindings(');
      });
    });
  });

  describe('WOQLViewRule', () => {
    let rule;

    beforeEach(() => {
      rule = new WOQLViewRule();
    });

    describe('constructor', () => {
      it('should initialize with empty rule object', () => {
        expect(rule.rule).to.be.an('object');
        expect(rule.rule).to.deep.equal({});
      });
    });

    describe('size()', () => {
      it('should set size', () => {
        rule.size('large');
        expect(rule.rule.size).to.equal('large');
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.size('medium');
        expect(result).to.equal(rule);
      });

      it('should get size', () => {
        rule.rule.size = 'small';
        expect(rule.size()).to.equal('small');
      });

      it('should return undefined if not set', () => {
        expect(rule.size()).to.be.undefined;
      });
    });

    describe('color()', () => {
      it('should set color array', () => {
        rule.color(['red', 'blue']);
        expect(rule.rule.color).to.deep.equal(['red', 'blue']);
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.color(['green']);
        expect(result).to.equal(rule);
      });

      it('should get color', () => {
        rule.rule.color = ['yellow', 'orange'];
        expect(rule.color()).to.deep.equal(['yellow', 'orange']);
      });

      it('should return undefined if not set', () => {
        expect(rule.color()).to.be.undefined;
      });
    });

    describe('icon()', () => {
      it('should set icon', () => {
        const icon = { type: 'star', size: 20 };
        rule.icon(icon);
        expect(rule.rule.icon).to.equal(icon);
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.icon({ type: 'circle' });
        expect(result).to.equal(rule);
      });

      it('should get icon', () => {
        const icon = { type: 'square' };
        rule.rule.icon = icon;
        expect(rule.icon()).to.equal(icon);
      });

      it('should return undefined if not set', () => {
        expect(rule.icon()).to.be.undefined;
      });
    });

    describe('text()', () => {
      it('should set text', () => {
        const text = { content: 'Hello', font: 'Arial' };
        rule.text(text);
        expect(rule.rule.text).to.equal(text);
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.text({ content: 'World' });
        expect(result).to.equal(rule);
      });

      it('should get text', () => {
        const text = { content: 'Test' };
        rule.rule.text = text;
        expect(rule.text()).to.equal(text);
      });

      it('should return undefined if not set', () => {
        expect(rule.text()).to.be.undefined;
      });
    });

    describe('border()', () => {
      it('should set border', () => {
        const border = { width: 2, color: 'black' };
        rule.border(border);
        expect(rule.rule.border).to.equal(border);
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.border({ width: 1 });
        expect(result).to.equal(rule);
      });

      it('should get border', () => {
        const border = { style: 'dashed' };
        rule.rule.border = border;
        expect(rule.border()).to.equal(border);
      });

      it('should return undefined if not set', () => {
        expect(rule.border()).to.be.undefined;
      });
    });

    describe('renderer()', () => {
      it('should set renderer', () => {
        rule.renderer('customRenderer');
        expect(rule.rule.renderer).to.equal('customRenderer');
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.renderer('myRenderer');
        expect(result).to.equal(rule);
      });

      it('should get renderer', () => {
        rule.rule.renderer = 'testRenderer';
        expect(rule.renderer()).to.equal('testRenderer');
      });

      it('should return undefined if not set', () => {
        expect(rule.renderer()).to.be.undefined;
      });
    });

    describe('render()', () => {
      it('should set render function', () => {
        const renderFn = function() { return 'rendered'; };
        rule.render(renderFn);
        expect(rule.rule.render).to.equal(renderFn);
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.render(function() {});
        expect(result).to.equal(rule);
      });

      it('should get render function', () => {
        const renderFn = function() { return 'test'; };
        rule.rule.render = renderFn;
        expect(rule.render()).to.equal(renderFn);
      });

      it('should return undefined if not set', () => {
        expect(rule.render()).to.be.undefined;
      });
    });

    describe('click()', () => {
      it('should set click handler', () => {
        const onClick = function() { console.log('clicked'); };
        rule.click(onClick);
        expect(rule.rule.click).to.equal(onClick);
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.click(function() {});
        expect(result).to.equal(rule);
      });

      it('should get click handler', () => {
        const onClick = function() {};
        rule.rule.click = onClick;
        expect(rule.click()).to.equal(onClick);
      });

      it('should return undefined if not set', () => {
        expect(rule.click()).to.be.undefined;
      });
    });

    describe('hover()', () => {
      it('should set hover handler', () => {
        const onHover = function() { console.log('hovered'); };
        rule.hover(onHover);
        expect(rule.rule.hover).to.equal(onHover);
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.hover(function() {});
        expect(result).to.equal(rule);
      });

      it('should get hover handler', () => {
        const onHover = function() {};
        rule.rule.hover = onHover;
        expect(rule.hover()).to.equal(onHover);
      });

      it('should return undefined if not set', () => {
        expect(rule.hover()).to.be.undefined;
      });
    });

    describe('hidden()', () => {
      it('should set hidden flag', () => {
        rule.hidden(true);
        expect(rule.rule.hidden).to.be.true;
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.hidden(false);
        expect(result).to.equal(rule);
      });

      it('should get hidden flag', () => {
        rule.rule.hidden = true;
        expect(rule.hidden()).to.be.true;
      });

      it('should return undefined if not set', () => {
        expect(rule.hidden()).to.be.undefined;
      });
    });

    describe('args()', () => {
      it('should set args', () => {
        const args = { param1: 'value1', param2: 'value2' };
        rule.args(args);
        expect(rule.rule.args).to.equal(args);
      });

      it('should return instance for chaining when setting', () => {
        const result = rule.args({ test: 'value' });
        expect(result).to.equal(rule);
      });

      it('should get args', () => {
        const args = { x: 1, y: 2 };
        rule.rule.args = args;
        expect(rule.args()).to.equal(args);
      });

      it('should return undefined if not set', () => {
        expect(rule.args()).to.be.undefined;
      });
    });

    describe('json()', () => {
      it('should return JSON representation', () => {
        rule.size('large');
        rule.color(['red', 'blue']);
        
        const json = rule.json();
        expect(json).to.be.an('object');
        expect(json.rule).to.exist;
        expect(json.rule.size).to.equal('large');
        expect(json.rule.color).to.deep.equal(['red', 'blue']);
      });

      it('should return empty rule when nothing set', () => {
        const json = rule.json();
        expect(json.rule).to.deep.equal({});
      });

      it('should load from JSON', () => {
        const mjson = {
          rule: { size: 'small', color: ['green'] },
        };
        
        rule.json(mjson);
        expect(rule.rule.size).to.equal('small');
        expect(rule.rule.color).to.deep.equal(['green']);
      });

      it('should return instance when loading', () => {
        const result = rule.json({ rule: {} });
        expect(result).to.equal(rule);
      });
    });

    describe('prettyPrint()', () => {
      it('should return string when nothing set', () => {
        // When pattern is undefined, prettyPrint tries to call on undefined
        // which returns "undefined('')" or similar
        const result = rule.prettyPrint();
        expect(result).to.be.a('string');
        // Just verify it doesn't throw and returns something
      });

      it('should include color in pretty print', () => {
        rule.color(['red', 'blue']);
        const result = rule.prettyPrint();
        expect(result).to.include('.color([red,blue])');
      });

      it('should include hidden in pretty print', () => {
        rule.hidden(true);
        const result = rule.prettyPrint();
        expect(result).to.include('.hidden(true)');
      });

      it('should include size in pretty print', () => {
        rule.size('large');
        const result = rule.prettyPrint();
        expect(result).to.include(".size('large')");
      });

      it('should include icon in pretty print', () => {
        rule.icon({ type: 'star' });
        const result = rule.prettyPrint();
        expect(result).to.include('.icon(');
        expect(result).to.include('star');
      });

      it('should include text in pretty print', () => {
        rule.text({ content: 'Hello' });
        const result = rule.prettyPrint();
        expect(result).to.include('.text(');
        expect(result).to.include('Hello');
      });

      it('should include border in pretty print', () => {
        rule.border({ width: 2 });
        const result = rule.prettyPrint();
        expect(result).to.include('.border(');
        expect(result).to.include('width');
      });

      it('should include args in pretty print', () => {
        rule.args({ param: 'value' });
        const result = rule.prettyPrint();
        expect(result).to.include('.args(');
        expect(result).to.include('param');
      });

      it('should include renderer in pretty print', () => {
        rule.renderer('customRenderer');
        const result = rule.prettyPrint();
        expect(result).to.include(".renderer('customRenderer')");
      });

      it('should include render in pretty print', () => {
        rule.render(function() { return 'test'; });
        const result = rule.prettyPrint();
        expect(result).to.include('.render(');
      });

      it('should include click in pretty print', () => {
        rule.click(function() {});
        const result = rule.prettyPrint();
        expect(result).to.include('.click(');
      });

      it('should include hover in pretty print', () => {
        rule.hover(function() {});
        const result = rule.prettyPrint();
        expect(result).to.include('.hover(');
      });

      it('should chain multiple properties in pretty print', () => {
        rule.size('large');
        rule.color(['red']);
        rule.hidden(false);
        
        const result = rule.prettyPrint();
        expect(result).to.include('.size(');
        expect(result).to.include('.color(');
        expect(result).to.include('.hidden(');
      });
    });

    describe('method chaining', () => {
      it('should allow chaining all setter methods', () => {
        const result = rule
          .size('large')
          .color(['red', 'blue'])
          .icon({ type: 'star' })
          .text({ content: 'Test' })
          .border({ width: 1 })
          .renderer('myRenderer')
          .render(function() {})
          .click(function() {})
          .hover(function() {})
          .hidden(true)
          .args({ x: 1 });

        expect(result).to.equal(rule);
        expect(rule.rule.size).to.equal('large');
        expect(rule.rule.color).to.deep.equal(['red', 'blue']);
        expect(rule.rule.hidden).to.be.true;
      });
    });
  });
});
