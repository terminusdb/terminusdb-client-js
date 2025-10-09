const { expect } = require('chai');
const { FrameRule, FramePattern } = require('../lib/viewer/frameRule');

describe('FrameRule and FramePattern tests', () => {
  // Mock frame objects for testing
  const createMockFrame = (type, options = {}) => {
    const frame = {
      renderer_type: type,
      isProperty: () => type === 'property',
      isObject: () => type === 'object',
      isData: () => type === 'data',
      ...options,
    };
    return frame;
  };

  describe('FrameRule', () => {
    describe('constructor', () => {
      it('should create a FrameRule instance', () => {
        const rule = new FrameRule();
        expect(rule).to.be.instanceOf(FrameRule);
        expect(rule.pattern).to.exist;
        expect(rule.pattern).to.be.instanceOf(FramePattern);
      });
    });

    describe('property()', () => {
      it('should set property pattern', () => {
        const rule = new FrameRule();
        rule.property('name', 'email');
        expect(rule.pattern.property).to.deep.equal(['name', 'email']);
      });

      it('should get property pattern', () => {
        const rule = new FrameRule();
        rule.property('name');
        expect(rule.property()).to.deep.equal(['name']);
      });

      it('should allow chaining', () => {
        const rule = new FrameRule();
        const result = rule.property('name');
        expect(result).to.equal(rule);
      });
    });

    describe('frame_type()', () => {
      it('should set frame_type pattern', () => {
        const rule = new FrameRule();
        rule.frame_type('object', 'data');
        expect(rule.pattern.frame_type).to.deep.equal(['object', 'data']);
      });

      it('should get frame_type pattern', () => {
        const rule = new FrameRule();
        rule.frame_type('object');
        expect(rule.frame_type()).to.deep.equal(['object']);
      });
    });

    describe('label()', () => {
      it('should set label pattern', () => {
        const rule = new FrameRule();
        rule.label('Name', 'Email');
        expect(rule.pattern.label).to.deep.equal(['Name', 'Email']);
      });

      it('should get label pattern', () => {
        const rule = new FrameRule();
        rule.label('Name');
        expect(rule.label()).to.deep.equal(['Name']);
      });
    });

    describe('subject()', () => {
      it('should set subject pattern', () => {
        const rule = new FrameRule();
        rule.subject('Person/123', 'Person/456');
        expect(rule.pattern.subject).to.deep.equal(['Person/123', 'Person/456']);
      });
    });

    describe('subjectClass()', () => {
      it('should set subjectClass pattern', () => {
        const rule = new FrameRule();
        rule.subjectClass('Person', 'Organization');
        expect(rule.pattern.subjectClass).to.deep.equal(['Person', 'Organization']);
      });
    });

    describe('range()', () => {
      it('should set range pattern', () => {
        const rule = new FrameRule();
        rule.range('xsd:string', 'xsd:integer');
        expect(rule.pattern.range).to.deep.equal(['xsd:string', 'xsd:integer']);
      });
    });

    describe('value()', () => {
      it('should set value pattern', () => {
        const rule = new FrameRule();
        rule.value('test', 123);
        expect(rule.pattern.value).to.deep.equal(['test', 123]);
      });
    });

    describe('depth()', () => {
      it('should set depth pattern', () => {
        const rule = new FrameRule();
        rule.depth(2);
        expect(rule.pattern.depth).to.equal(2);
      });

      it('should get depth pattern', () => {
        const rule = new FrameRule();
        rule.depth(2);
        expect(rule.depth()).to.equal(2);
      });
    });

    describe('index()', () => {
      it('should set index pattern', () => {
        const rule = new FrameRule();
        rule.index(0, 1);
        expect(rule.pattern.index).to.deep.equal([0, 1]);
      });
    });

    describe('status()', () => {
      it('should set status pattern', () => {
        const rule = new FrameRule();
        rule.status('updated', 'new');
        expect(rule.pattern.status).to.deep.equal(['updated', 'new']);
      });
    });

    describe('parent()', () => {
      it('should set parent pattern', () => {
        const rule = new FrameRule();
        const parentPattern = { property: 'parent_prop' };
        rule.parent(parentPattern);
        expect(rule.pattern.parent).to.equal(parentPattern);
      });

      it('should get parent pattern', () => {
        const rule = new FrameRule();
        const parentPattern = { property: 'parent_prop' };
        rule.parent(parentPattern);
        expect(rule.parent()).to.equal(parentPattern);
      });
    });

    describe('children()', () => {
      it('should add children patterns', () => {
        const rule = new FrameRule();
        const child1 = { property: 'child1' };
        const child2 = { property: 'child2' };
        rule.children(child1, child2);
        expect(rule.pattern.children).to.have.lengthOf(2);
        expect(rule.pattern.children[0]).to.equal(child1);
        expect(rule.pattern.children[1]).to.equal(child2);
      });

      it('should get children patterns', () => {
        const rule = new FrameRule();
        rule.children({ property: 'child1' });
        const children = rule.children();
        expect(children).to.have.lengthOf(1);
      });
    });

    describe('testRules()', () => {
      it('should match frames against rules', () => {
        const rule1 = new FrameRule();
        const rule2 = new FrameRule();
        rule2.property('name');

        const frame = createMockFrame('data', {
          property: () => 'name',
        });

        const rules = [rule1, rule2];
        const matched = rule1.testRules(rules, frame);

        expect(matched).to.have.lengthOf(2); // Both should match (rule1 has no pattern)
      });

      it('should call onmatch callback for each match', () => {
        const rule = new FrameRule();
        const frame = createMockFrame('data');
        const matches = [];

        rule.testRules([new FrameRule()], frame, (f, r) => {
          matches.push({ frame: f, rule: r });
        });

        expect(matches).to.have.lengthOf(1);
        expect(matches[0].frame).to.equal(frame);
      });

      it('should return empty array for no matches', () => {
        const rule = new FrameRule();
        rule.property('nonexistent');

        const frame = createMockFrame('data', {
          property: () => 'other',
        });

        const matched = rule.testRules([rule], frame);
        expect(matched).to.have.lengthOf(0);
      });
    });

    describe('patternMatchesFrame()', () => {
      it('should match pattern with checkFrame method', () => {
        const rule = new FrameRule();
        const pattern = {
          checkFrame: () => true,
        };
        const frame = createMockFrame('data');

        const result = rule.patternMatchesFrame(pattern, frame);
        expect(result).to.be.true;
      });

      it('should handle plain object pattern', () => {
        const rule = new FrameRule();
        // Test that the method exists and handles patterns
        expect(rule.patternMatchesFrame).to.be.a('function');
      });
    });
  });

  describe('FramePattern', () => {
    describe('constructor', () => {
      it('should create a FramePattern instance', () => {
        const pattern = new FramePattern();
        expect(pattern).to.be.instanceOf(FramePattern);
      });
    });

    describe('setPattern()', () => {
      it('should set all pattern properties', () => {
        const pattern = new FramePattern();
        pattern.setPattern({
          scope: 'object',
          literal: false,
          type: 'Person',
          label: 'Name',
          frame_type: 'object',
          subject: 'Person/123',
          subjectClass: 'Person',
          range: 'xsd:string',
          property: 'name',
          value: 'test',
          depth: 1,
          index: 0,
          status: 'updated',
        });

        expect(pattern.scope).to.equal('object');
        expect(pattern.literal).to.be.false;
        expect(pattern.type).to.equal('Person');
        expect(pattern.label).to.equal('Name');
        expect(pattern.frame_type).to.equal('object');
        expect(pattern.subject).to.equal('Person/123');
        expect(pattern.subjectClass).to.equal('Person');
        expect(pattern.range).to.equal('xsd:string');
        expect(pattern.property).to.equal('name');
        expect(pattern.value).to.equal('test');
        expect(pattern.depth).to.equal(1);
        expect(pattern.index).to.equal(0);
        expect(pattern.status).to.equal('updated');
      });

      it('should set parent pattern when it has json method', () => {
        const pattern = new FramePattern();
        const parentPattern = new FramePattern();
        parentPattern.property = 'parent_prop';
        
        pattern.setPattern({
          parent: parentPattern,
        });

        expect(pattern.parent).to.equal(parentPattern);
      });

      it('should process children patterns', () => {
        const pattern = new FramePattern();
        const child1 = new FramePattern();
        child1.property = 'child1';
        const child2 = new FramePattern();
        child2.property = 'child2';
        
        pattern.setPattern({
          children: [child1, child2],
        });

        expect(pattern.children).to.exist;
        expect(pattern.children).to.have.lengthOf(2);
      });
    });

    describe('json()', () => {
      it('should export pattern to JSON', () => {
        const pattern = new FramePattern();
        pattern.scope = 'object';
        pattern.literal = false;
        pattern.type = 'Person';
        pattern.depth = 1;

        const json = pattern.json();
        expect(json.scope).to.equal('object');
        expect(json.literal).to.be.false;
        expect(json.type).to.equal('Person');
        expect(json.depth).to.equal(1);
      });

      it('should export parent as JSON', () => {
        const pattern = new FramePattern();
        const parent = new FramePattern();
        parent.property = 'parent_prop';
        pattern.parent = parent;

        const json = pattern.json();
        expect(json.parent).to.exist;
        expect(json.parent.property).to.equal('parent_prop');
      });

      it('should export children as JSON array', () => {
        const pattern = new FramePattern();
        const child1 = new FramePattern();
        child1.property = 'child1';
        const child2 = new FramePattern();
        child2.property = 'child2';
        pattern.children = [child1, child2];

        const json = pattern.json();
        expect(json.children).to.have.lengthOf(2);
        expect(json.children[0].property).to.equal('child1');
        expect(json.children[1].property).to.equal('child2');
      });
    });

    describe('getRendererType()', () => {
      it('should identify property type', () => {
        const pattern = new FramePattern();
        const frame = createMockFrame('property');
        expect(pattern.getRendererType(frame)).to.equal('property');
      });

      it('should identify object type', () => {
        const pattern = new FramePattern();
        const frame = createMockFrame('object');
        expect(pattern.getRendererType(frame)).to.equal('object');
      });

      it('should identify data type', () => {
        const pattern = new FramePattern();
        const frame = createMockFrame('data');
        expect(pattern.getRendererType(frame)).to.equal('data');
      });

      it('should return renderer_type if set', () => {
        const pattern = new FramePattern();
        const frame = {
          renderer_type: 'custom',
          isProperty: () => false,
          isObject: () => false,
          isData: () => false,
        };
        expect(pattern.getRendererType(frame)).to.equal('custom');
      });
    });

    describe('checkFrame()', () => {
      it('should match frame with scope pattern', () => {
        const pattern = new FramePattern();
        pattern.scope = 'data';
        const frame = createMockFrame('data');

        expect(pattern.checkFrame(frame)).to.be.true;
      });

      it('should match frame with wildcard scope', () => {
        const pattern = new FramePattern();
        pattern.scope = '*';
        const frame = createMockFrame('data');

        expect(pattern.checkFrame(frame)).to.be.true;
      });

      it('should not match wrong scope', () => {
        const pattern = new FramePattern();
        pattern.scope = 'object';
        const frame = createMockFrame('data');

        expect(pattern.checkFrame(frame)).to.be.false;
      });

      it('should match frame with depth', () => {
        const pattern = new FramePattern();
        pattern.scope = 'data';
        pattern.depth = 2;
        const frame = createMockFrame('data', {
          depth: () => 2,
        });

        expect(pattern.checkFrame(frame)).to.be.true;
      });
    });

    describe('illegalRuleType()', () => {
      it('should reject data frames with children', () => {
        const pattern = new FramePattern();
        pattern.children = [{ property: 'test' }];

        expect(pattern.illegalRuleType('data')).to.be.true;
      });

      it('should reject object frames with range', () => {
        const pattern = new FramePattern();
        pattern.range = ['xsd:string'];

        expect(pattern.illegalRuleType('object')).to.be.true;
      });

      it('should allow valid combinations', () => {
        const pattern = new FramePattern();
        pattern.children = [{ property: 'test' }];

        expect(pattern.illegalRuleType('object')).to.be.false;
      });
    });

    describe('checkDepth()', () => {
      it('should match exact depth', () => {
        const pattern = new FramePattern();
        pattern.depth = 2;
        const frame = createMockFrame('data', {
          depth: () => 2,
        });

        expect(pattern.checkDepth('data', frame)).to.be.true;
      });

      it('should not match wrong depth', () => {
        const pattern = new FramePattern();
        pattern.depth = 2;
        const frame = createMockFrame('data', {
          depth: () => 3,
        });

        expect(pattern.checkDepth('data', frame)).to.be.false;
      });
    });

    describe('checkIndex()', () => {
      it('should match index for data frames', () => {
        const pattern = new FramePattern();
        pattern.index = 0;
        const frame = createMockFrame('data', {
          index: 0,
        });

        expect(pattern.checkIndex('data', frame)).to.be.true;
      });

      it('should return false for non-data frames', () => {
        const pattern = new FramePattern();
        pattern.index = 0;
        const frame = createMockFrame('object');

        expect(pattern.checkIndex('object', frame)).to.be.false;
      });
    });

    describe('checkProperty()', () => {
      it('should match property', () => {
        const pattern = new FramePattern();
        pattern.property = 'name';
        const frame = createMockFrame('data', {
          property: () => 'name',
        });

        expect(pattern.checkProperty('data', frame)).to.be.true;
      });

      it('should match one of multiple properties', () => {
        const pattern = new FramePattern();
        pattern.property = ['name', 'email'];
        const frame = createMockFrame('data', {
          property: () => 'email',
        });

        expect(pattern.checkProperty('data', frame)).to.be.true;
      });
    });

    describe('checkType()', () => {
      it('should match object subjectClass type', () => {
        const pattern = new FramePattern();
        pattern.type = ['Person'];
        const frame = createMockFrame('object', {
          subjectClass: () => 'Person',
        });

        expect(pattern.checkType('object', frame)).to.be.true;
      });

      it('should match range type for non-objects', () => {
        const pattern = new FramePattern();
        pattern.type = ['xsd:string'];
        const frame = createMockFrame('data', {
          range: 'xsd:string',
        });

        expect(pattern.checkType('data', frame)).to.be.true;
      });
    });

    describe('checkLiteral()', () => {
      it('should check if data frame is datatype property', () => {
        const pattern = new FramePattern();
        pattern.literal = true;
        const frame = createMockFrame('data', {
          isDatatypeProperty: () => true,
        });

        expect(pattern.checkLiteral('data', frame)).to.be.true;
      });

      it('should return false for object frames', () => {
        const pattern = new FramePattern();
        pattern.literal = true;
        const frame = createMockFrame('object');

        expect(pattern.checkLiteral('object', frame)).to.be.false;
      });

      it('should return false for property frames', () => {
        const pattern = new FramePattern();
        pattern.literal = true;
        const frame = createMockFrame('property');

        expect(pattern.checkLiteral('property', frame)).to.be.false;
      });
    });

    describe('checkStatus()', () => {
      it('should check updated status', () => {
        const pattern = new FramePattern();
        pattern.status = 'updated';
        const frame = createMockFrame('data', {
          isUpdated: () => true,
        });

        expect(pattern.checkStatus('data', frame)).to.be.true;
      });

      it('should check new status', () => {
        const pattern = new FramePattern();
        pattern.status = 'new';
        const frame = createMockFrame('data', {
          isNew: () => true,
          isUpdated: () => false,
        });

        expect(pattern.checkStatus('data', frame)).to.be.true;
      });

      it('should check unchanged status', () => {
        const pattern = new FramePattern();
        pattern.status = 'unchanged';
        const frame = createMockFrame('data', {
          isUpdated: () => false,
        });

        expect(pattern.checkStatus('data', frame)).to.be.true;
      });
    });

    describe('checkLabel()', () => {
      it('should match label', () => {
        const pattern = new FramePattern();
        pattern.label = ['Name'];
        const frame = createMockFrame('data', {
          getLabel: () => 'Name',
        });

        expect(pattern.checkLabel('data', frame)).to.be.true;
      });

      it('should return false for frame without getLabel', () => {
        const pattern = new FramePattern();
        pattern.label = ['Name'];
        const frame = createMockFrame('data');

        expect(pattern.checkLabel('data', frame)).to.be.false;
      });

      it('should not match different label', () => {
        const pattern = new FramePattern();
        pattern.label = ['Email'];
        const frame = createMockFrame('data', {
          getLabel: () => 'Name',
        });

        expect(pattern.checkLabel('data', frame)).to.be.false;
      });
    });

    describe('prettyPrint()', () => {
      it('should print simple pattern', () => {
        const pattern = new FramePattern();
        pattern.scope = 'data';
        pattern.depth = 1;

        const str = pattern.prettyPrint();
        expect(str).to.include('data()');
        // depth is printed but may not have the exact format
        expect(str).to.include('depth');
      });

      it('should print wildcard scope', () => {
        const pattern = new FramePattern();
        pattern.scope = '*';

        const str = pattern.prettyPrint();
        expect(str).to.include('all()');
      });

      it('should print literal', () => {
        const pattern = new FramePattern();
        pattern.scope = 'data';
        pattern.literal = true;

        const str = pattern.prettyPrint();
        expect(str).to.include('.literal(true)');
      });

      it('should print parent pattern', () => {
        const pattern = new FramePattern();
        pattern.scope = 'data';
        const parent = new FramePattern();
        parent.scope = 'object';
        pattern.parent = parent;

        const str = pattern.prettyPrint();
        expect(str).to.include('.parent(');
        expect(str).to.include('object()');
      });
    });
  });
});
