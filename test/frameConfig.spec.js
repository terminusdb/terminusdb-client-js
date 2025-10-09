const { expect } = require('chai');
const sinon = require('sinon');
const FrameConfig = require('../lib/viewer/frameConfig');

describe('FrameConfig and DocumentRule tests', () => {
  describe('FrameConfig', () => {
    describe('constructor', () => {
      it('should create a FrameConfig instance', () => {
        const config = new FrameConfig();
        expect(config).to.be.instanceOf(FrameConfig);
        expect(config.type).to.equal('document');
      });
    });

    describe('load_schema()', () => {
      it('should set schema loading flag', () => {
        const config = new FrameConfig();
        config.load_schema(true);
        expect(config.load_schema()).to.be.true;
      });

      it('should get schema loading flag', () => {
        const config = new FrameConfig();
        config.load_schema(false);
        expect(config.load_schema()).to.be.false;
      });

      it('should allow chaining', () => {
        const config = new FrameConfig();
        const result = config.load_schema(true);
        expect(result).to.equal(config);
      });
    });

    describe('scope methods', () => {
      it('should create object scope rule', () => {
        const config = new FrameConfig();
        const rule = config.object();
        expect(rule).to.exist;
        expect(rule.pattern.scope).to.equal('object');
        expect(config.rules).to.have.lengthOf(1);
      });

      it('should create property scope rule', () => {
        const config = new FrameConfig();
        const rule = config.property();
        expect(rule).to.exist;
        expect(rule.pattern.scope).to.equal('property');
      });

      it('should create data scope rule', () => {
        const config = new FrameConfig();
        const rule = config.data();
        expect(rule).to.exist;
        expect(rule.pattern.scope).to.equal('data');
      });

      it('should create all scope rule', () => {
        const config = new FrameConfig();
        const rule = config.all();
        expect(rule).to.exist;
        expect(rule.pattern.scope).to.equal('*');
      });

      it('should create custom scope rule', () => {
        const config = new FrameConfig();
        const rule = config.scope('custom');
        expect(rule).to.exist;
        expect(rule.pattern.scope).to.equal('custom');
      });
    });

    describe('show_all()', () => {
      it('should set renderer for all scopes', () => {
        const config = new FrameConfig();
        config.show_all('myRenderer');
        expect(config.rules).to.have.lengthOf(1);
        expect(config.rules[0].rule.renderer).to.equal('myRenderer');
      });
    });

    describe('show_parts()', () => {
      it('should set renderers for object, property, and data', () => {
        const config = new FrameConfig();
        config.show_parts('objRend', 'propRend', 'dataRend');
        expect(config.rules).to.have.lengthOf(3);
        expect(config.rules[0].rule.renderer).to.equal('objRend');
        expect(config.rules[1].rule.renderer).to.equal('propRend');
        expect(config.rules[2].rule.renderer).to.equal('dataRend');
      });
    });

    describe('setFrameDisplayOptions()', () => {
      it('should set display options from rule', () => {
        const config = new FrameConfig();
        const frame = {};
        const rule = {
          mode: () => 'edit',
          view: () => 'table',
          hidden: () => false,
          collapse: () => true,
          style: () => 'custom-style',
          headerStyle: () => 'header-style',
          header: () => 'My Header',
          showEmpty: () => true,
          dataviewer: () => 'viewer1',
          showDisabledButtons: () => false,
          features: () => ['feature1'],
          headerFeatures: () => ['headerFeature1'],
          args: () => ({ key: 'value' }),
        };

        config.setFrameDisplayOptions(frame, rule);

        expect(frame.display_options.mode).to.equal('edit');
        expect(frame.display_options.view).to.equal('table');
        expect(frame.display_options.hidden).to.be.false;
        expect(frame.display_options.collapse).to.be.true;
        expect(frame.display_options.style).to.equal('custom-style');
        expect(frame.display_options.header_style).to.equal('header-style');
        expect(frame.display_options.header).to.equal('My Header');
        expect(frame.display_options.show_empty).to.be.true;
        expect(frame.display_options.dataviewer).to.equal('viewer1');
        expect(frame.display_options.show_disabled_buttons).to.be.false;
      });

      it('should handle partial rule options', () => {
        const config = new FrameConfig();
        const frame = {};
        const rule = {
          mode: () => 'view',
          view: () => undefined,
          hidden: () => undefined,
          collapse: () => undefined,
          style: () => undefined,
          headerStyle: () => undefined,
          header: () => undefined,
          showEmpty: () => undefined,
          dataviewer: () => undefined,
          showDisabledButtons: () => undefined,
          features: () => undefined,
          headerFeatures: () => undefined,
          args: () => undefined,
        };

        config.setFrameDisplayOptions(frame, rule);

        expect(frame.display_options.mode).to.equal('view');
        expect(frame.display_options.view).to.be.undefined;
      });
    });

    describe('setFrameFeatures()', () => {
      it('should return fresh features when existing is empty', () => {
        const config = new FrameConfig();
        const fresh = ['feature1', 'feature2'];
        const result = config.setFrameFeatures(null, fresh);
        expect(result).to.deep.equal(fresh);
      });

      it('should return existing features when fresh is empty', () => {
        const config = new FrameConfig();
        const existing = ['feature1'];
        const result = config.setFrameFeatures(existing, null);
        expect(result).to.deep.equal(existing);
      });

      it('should merge non-duplicate features', () => {
        const config = new FrameConfig();
        const existing = ['feature1'];
        const fresh = ['feature2'];
        const result = config.setFrameFeatures(existing, fresh);
        expect(result).to.deep.equal(['feature1', 'feature2']);
      });

      it('should not duplicate existing features', () => {
        const config = new FrameConfig();
        const existing = ['feature1'];
        const fresh = ['feature1', 'feature2'];
        const result = config.setFrameFeatures(existing, fresh);
        expect(result).to.have.lengthOf(2);
        expect(result).to.include('feature1');
        expect(result).to.include('feature2');
      });

      it('should merge object features with properties', () => {
        const config = new FrameConfig();
        const existing = [{ feature1: { prop1: 'val1' } }];
        const fresh = [{ feature1: { prop2: 'val2' } }];
        const result = config.setFrameFeatures(existing, fresh);
        expect(result[0].feature1.prop1).to.equal('val1');
        expect(result[0].feature1.prop2).to.equal('val2');
      });
    });

    describe('setFrameArgs()', () => {
      it('should return fresh args when existing is null', () => {
        const config = new FrameConfig();
        const fresh = { key1: 'value1' };
        const result = config.setFrameArgs(null, fresh);
        expect(result).to.deep.equal(fresh);
      });

      it('should return existing args when fresh is null', () => {
        const config = new FrameConfig();
        const existing = { key1: 'value1' };
        const result = config.setFrameArgs(existing, null);
        expect(result).to.deep.equal(existing);
      });

      it('should merge args', () => {
        const config = new FrameConfig();
        const existing = { key1: 'value1' };
        const fresh = { key2: 'value2' };
        const result = config.setFrameArgs(existing, fresh);
        expect(result.key1).to.equal('value1');
        expect(result.key2).to.equal('value2');
      });
    });

    describe('json()', () => {
      it('should export configuration to JSON', () => {
        const config = new FrameConfig();
        config.load_schema(true);
        const json = config.json();
        expect(json).to.have.property('frame');
        expect(json).to.have.property('rules');
        expect(json.frame.load_schema).to.be.true;
      });
    });

    describe('loadJSON()', () => {
      it('should load configuration from JSON', () => {
        const config = new FrameConfig();
        const jsonConfig = { load_schema: true };
        const jsonRules = [];
        
        config.loadJSON(jsonConfig, jsonRules);
        expect(config.load_schema()).to.be.true;
      });
    });
  });

  describe('DocumentRule', () => {
    let config;
    let rule;

    beforeEach(() => {
      config = new FrameConfig();
      rule = config.object();
    });

    describe('renderer()', () => {
      it('should set renderer', () => {
        rule.renderer('myRenderer');
        expect(rule.renderer()).to.equal('myRenderer');
      });

      it('should get renderer', () => {
        rule.renderer('testRenderer');
        expect(rule.renderer()).to.equal('testRenderer');
      });

      it('should allow chaining', () => {
        const result = rule.renderer('renderer1');
        expect(result).to.equal(rule);
      });
    });

    describe('compare()', () => {
      it('should set compare function', () => {
        const compareFunc = (a, b) => a - b;
        rule.compare(compareFunc);
        expect(rule.compare()).to.equal(compareFunc);
      });
    });

    describe('mode()', () => {
      it('should set mode', () => {
        rule.mode('edit');
        expect(rule.mode()).to.equal('edit');
      });

      it('should get mode', () => {
        rule.mode('view');
        expect(rule.mode()).to.equal('view');
      });
    });

    describe('collapse()', () => {
      it('should set collapse function', () => {
        const collapseFunc = () => true;
        rule.collapse(collapseFunc);
        expect(rule.collapse()).to.equal(collapseFunc);
      });
    });

    describe('view()', () => {
      it('should set view', () => {
        rule.view('table');
        expect(rule.view()).to.equal('table');
      });
    });

    describe('showDisabledButtons()', () => {
      it('should set showDisabledButtons', () => {
        rule.showDisabledButtons(true);
        expect(rule.showDisabledButtons()).to.be.true;
      });

      it('should get showDisabledButtons', () => {
        rule.showDisabledButtons(false);
        expect(rule.showDisabledButtons()).to.be.false;
      });
    });

    describe('header()', () => {
      it('should set header', () => {
        rule.header('My Header');
        expect(rule.header()).to.equal('My Header');
      });
    });

    describe('errors()', () => {
      it('should set errors', () => {
        const errors = ['error1', 'error2'];
        rule.errors(errors);
        expect(rule.errors()).to.deep.equal(errors);
      });
    });

    describe('headerStyle()', () => {
      it('should set header style', () => {
        rule.headerStyle('bold');
        expect(rule.headerStyle()).to.equal('bold');
      });
    });

    describe('showEmpty()', () => {
      it('should set show empty flag', () => {
        rule.showEmpty(true);
        expect(rule.showEmpty()).to.be.true;
      });
    });

    describe('dataviewer()', () => {
      it('should set dataviewer', () => {
        rule.dataviewer('customViewer');
        expect(rule.dataviewer()).to.equal('customViewer');
      });
    });

    describe('features()', () => {
      it('should set features', () => {
        rule.features('feature1', 'feature2');
        const features = rule.features();
        expect(features).to.have.lengthOf(2);
        expect(features[0]).to.equal('feature1');
        expect(features[1]).to.equal('feature2');
      });

      it('should get features', () => {
        rule.features('feat1');
        expect(rule.features()).to.deep.equal(['feat1']);
      });
    });

    describe('headerFeatures()', () => {
      it('should set header features', () => {
        rule.headerFeatures('hFeature1', 'hFeature2');
        const hFeatures = rule.headerFeatures();
        expect(hFeatures).to.have.lengthOf(2);
      });
    });

    describe('render()', () => {
      it('should set render function', () => {
        const renderFunc = () => '<div>Test</div>';
        rule.render(renderFunc);
        expect(rule.render()).to.equal(renderFunc);
      });

      it('should apply render to features', () => {
        const renderFunc = () => '<div>Test</div>';
        rule.features('feature1');
        rule.render(renderFunc);
        const features = rule.features();
        expect(features[0]).to.be.an('object');
      });

      it('should apply render to header features', () => {
        const renderFunc = () => '<div>Test</div>';
        rule.headerFeatures('hFeature1');
        rule.render(renderFunc);
        const hFeatures = rule.headerFeatures();
        expect(hFeatures[0]).to.be.an('object');
      });
    });

    describe('style()', () => {
      it('should set style', () => {
        rule.style('custom-class');
        expect(rule.style()).to.equal('custom-class');
      });

      it('should apply style to features', () => {
        rule.features('feature1');
        rule.style('my-style');
        const features = rule.features();
        expect(features[0]).to.be.an('object');
        expect(features[0].feature1.style).to.equal('my-style');
      });
    });

    describe('hidden()', () => {
      it('should set hidden flag', () => {
        rule.hidden(true);
        expect(rule.hidden()).to.be.true;
      });

      it('should apply hidden to features', () => {
        rule.features('feature1');
        rule.hidden(false);
        const features = rule.features();
        expect(features[0].feature1.hidden).to.be.false;
      });
    });

    describe('args()', () => {
      it('should set args', () => {
        const args = { key: 'value', num: 42 };
        rule.args(args);
        expect(rule.args()).to.deep.equal(args);
      });

      it('should apply args to features', () => {
        rule.features('feature1');
        const args = { option: 'test' };
        rule.args(args);
        const features = rule.features();
        expect(features[0].feature1.args).to.deep.equal(args);
      });
    });

    describe('applyFeatureProperty()', () => {
      it('should add property to string features', () => {
        const feats = ['feature1', 'feature2'];
        const result = rule.applyFeatureProperty(feats, 'style', 'my-style');
        expect(result).to.have.lengthOf(2);
        expect(result[0]).to.be.an('object');
        expect(result[0].feature1.style).to.equal('my-style');
      });

      it('should add property to object features', () => {
        const feats = [{ feature1: { existing: 'val' } }];
        const result = rule.applyFeatureProperty(feats, 'style', 'new-style');
        expect(result[0].feature1.style).to.equal('new-style');
        expect(result[0].feature1.existing).to.equal('val');
      });
    });

    describe('unpackFeatures()', () => {
      it('should unpack string features', () => {
        const feats = ['feature1', 'feature2'];
        const result = rule.unpackFeatures(feats);
        expect(result).to.include('feature1');
        expect(result).to.include('feature2');
      });

      it('should unpack object features with properties', () => {
        const feats = [{ feature1: { style: 'custom' } }];
        const result = rule.unpackFeatures(feats);
        expect(result).to.include('feature1');
        expect(result).to.include('style');
      });

      it('should handle mixed feature types', () => {
        const feats = ['feature1', { feature2: { prop: 'val' } }];
        const result = rule.unpackFeatures(feats);
        expect(result).to.include('feature1');
        expect(result).to.include('feature2');
      });
    });

    describe('prettyPrint()', () => {
      it('should generate pretty print string', () => {
        rule.renderer('testRenderer');
        rule.mode('edit');
        const str = rule.prettyPrint();
        expect(str).to.be.a('string');
        expect(str).to.include('testRenderer');
        expect(str).to.include('edit');
      });

      it('should include all set properties', () => {
        rule.renderer('myRenderer');
        rule.mode('view');
        rule.view('table');
        rule.hidden(false);
        const str = rule.prettyPrint();
        expect(str).to.include('myRenderer');
        expect(str).to.include('view');
        expect(str).to.include('table');
      });
    });
  });

  describe('Integration tests', () => {
    it('should create complex configuration with multiple rules', () => {
      const config = new FrameConfig();
      
      config.object().renderer('ObjectRenderer').mode('view');
      config.property().renderer('PropertyRenderer').hidden(false);
      config.data().renderer('DataRenderer').features('edit', 'delete');

      expect(config.rules).to.have.lengthOf(3);
      expect(config.rules[0].renderer()).to.equal('ObjectRenderer');
      expect(config.rules[1].renderer()).to.equal('PropertyRenderer');
      expect(config.rules[2].renderer()).to.equal('DataRenderer');
    });

    it('should apply features to rules', () => {
      const config = new FrameConfig();
      const rule = config.data();
      
      rule.features('edit', 'delete')
        .style('custom-style')
        .hidden(false);

      const features = rule.features();
      expect(features[0].edit.style).to.equal('custom-style');
      expect(features[0].edit.hidden).to.be.false;
    });

    it('should chain multiple configuration methods', () => {
      const config = new FrameConfig();
      
      const result = config.object()
        .renderer('MyRenderer')
        .mode('edit')
        .view('form')
        .hidden(false)
        .collapse(true);

      expect(result.renderer()).to.equal('MyRenderer');
      expect(result.mode()).to.equal('edit');
      expect(result.view()).to.equal('form');
      expect(result.hidden()).to.be.false;
      expect(result.collapse()).to.be.true;
    });
  });
});
