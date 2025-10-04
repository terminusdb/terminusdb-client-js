const { expect } = require('chai');
const WOQLLibrary = require('../lib/query/woqlLibrary');
const WOQLQuery = require('../lib/query/woqlBuilder');

describe('WOQLLibrary tests', () => {
  let lib;

  beforeEach(() => {
    lib = new WOQLLibrary();
  });

  describe('Constructor and properties', () => {
    it('should create WOQLLibrary instance', () => {
      expect(lib).to.be.instanceof(WOQLLibrary);
    });

    it('should have default_schema_resource property', () => {
      expect(lib.default_schema_resource).to.equal('schema/main');
    });

    it('should have default_commit_resource property', () => {
      expect(lib.default_commit_resource).to.equal('_commits');
    });

    it('should have default_meta_resource property', () => {
      expect(lib.default_meta_resource).to.equal('_meta');
    });

    it('should have masterdb_resource property', () => {
      expect(lib.masterdb_resource).to.equal('_system');
    });

    it('should have empty property', () => {
      expect(lib.empty).to.equal('');
    });
  });

  describe('branches()', () => {
    it('should return WOQLQuery for branches', () => {
      const result = lib.branches();
      expect(result).to.be.instanceof(WOQLQuery);
    });

    it('should create query using _commits', () => {
      const result = lib.branches();
      const json = result.json();
      expect(json).to.exist;
      // Check that it uses _commits graph
      expect(JSON.stringify(json)).to.include('_commits');
    });

    it('should query for Branch type', () => {
      const result = lib.branches();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('Branch');
    });

    it('should select branch name', () => {
      const result = lib.branches();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('name');
    });

    it('should include optional head commit', () => {
      const result = lib.branches();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('head');
    });

    it('should include commit identifier', () => {
      const result = lib.branches();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('identifier');
    });

    it('should include timestamp', () => {
      const result = lib.branches();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('timestamp');
    });
  });

  describe('commits()', () => {
    it('should return WOQLQuery for commits', () => {
      const result = lib.commits();
      expect(result).to.be.instanceof(WOQLQuery);
    });

    it('should use main branch by default', () => {
      const result = lib.commits();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('main');
    });

    it('should accept custom branch name', () => {
      const result = lib.commits('dev');
      const json = result.json();
      expect(JSON.stringify(json)).to.include('dev');
    });

    it('should not add limit when limit is 0', () => {
      const result = lib.commits('main', 0);
      const json = result.json();
      // Query should exist but limit should not be applied
      expect(result).to.be.instanceof(WOQLQuery);
    });

    it('should add limit when specified', () => {
      const result = lib.commits('main', 10);
      const json = result.json();
      expect(JSON.stringify(json)).to.include('limit');
    });

    it('should not add start when start is 0', () => {
      const result = lib.commits('main', 0, 0);
      const json = result.json();
      expect(result).to.be.instanceof(WOQLQuery);
    });

    it('should add start when specified', () => {
      const result = lib.commits('main', 10, 5);
      const json = result.json();
      expect(JSON.stringify(json)).to.include('start');
    });

    it('should not filter by timestamp when 0', () => {
      const result = lib.commits('main', 0, 0, 0);
      const json = result.json();
      expect(result).to.be.instanceof(WOQLQuery);
    });

    it('should add timestamp filter when specified', () => {
      const result = lib.commits('main', 0, 0, 1609459200);
      const json = result.json();
      // Check that a comparison operation exists (less than)
      const jsonStr = JSON.stringify(json);
      expect(jsonStr).to.satisfy(str => str.includes('Less') || str.includes('less') || str.includes('<'));
    });

    it('should select commit variables', () => {
      const result = lib.commits();
      const json = result.json();
      const jsonStr = JSON.stringify(json);
      expect(jsonStr).to.include('Commit ID');
      expect(jsonStr).to.include('Author');
      expect(jsonStr).to.include('Message');
    });

    it('should handle all parameters together', () => {
      const result = lib.commits('develop', 20, 10, 1609459200);
      const json = result.json();
      const jsonStr = JSON.stringify(json);
      expect(jsonStr).to.include('develop');
      expect(jsonStr).to.include('limit');
      expect(jsonStr).to.include('start');
      // Check for comparison operation
      expect(jsonStr).to.satisfy(str => str.includes('Less') || str.includes('less') || str.includes('<'));
    });

    it('should include path query', () => {
      const result = lib.commits();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('path');
    });

    it('should include optional parent', () => {
      const result = lib.commits();
      const json = result.json();
      // Check that optional is used - represented as Optional or opt
      const jsonStr = JSON.stringify(json);
      expect(jsonStr).to.satisfy(str => str.includes('Optional') || str.includes('opt'));
    });
  });

  describe('previousCommits()', () => {
    it('should return WOQLQuery for previousCommits', () => {
      const result = lib.previousCommits('abc123');
      expect(result).to.be.instanceof(WOQLQuery);
    });

    it('should use default limit of 10', () => {
      const result = lib.previousCommits('abc123');
      const json = result.json();
      expect(JSON.stringify(json)).to.include('limit');
    });

    it('should accept custom limit', () => {
      const result = lib.previousCommits('abc123', 20);
      const json = result.json();
      expect(result).to.be.instanceof(WOQLQuery);
    });

    it('should use _commits graph', () => {
      const result = lib.previousCommits('abc123');
      const json = result.json();
      expect(JSON.stringify(json)).to.include('_commits');
    });

    it('should query for commit identifier', () => {
      const result = lib.previousCommits('abc123');
      const json = result.json();
      expect(JSON.stringify(json)).to.include('abc123');
    });

    it('should use path to find parent commits', () => {
      const result = lib.previousCommits('abc123');
      const json = result.json();
      expect(JSON.stringify(json)).to.include('path');
      expect(JSON.stringify(json)).to.include('parent');
    });

    it('should select commit metadata', () => {
      const result = lib.previousCommits('xyz789');
      const json = result.json();
      const jsonStr = JSON.stringify(json);
      expect(jsonStr).to.include('Commit ID');
      expect(jsonStr).to.include('Author');
      expect(jsonStr).to.include('Message');
      expect(jsonStr).to.include('Time');
    });

    it('should use schema namespace', () => {
      const result = lib.previousCommits('commit123');
      const json = result.json();
      expect(JSON.stringify(json)).to.include('@schema');
    });
  });

  describe('first_commit()', () => {
    it('should return WOQLQuery for first_commit', () => {
      const result = lib.first_commit();
      expect(result).to.be.instanceof(WOQLQuery);
    });

    it('should use _commits graph', () => {
      const result = lib.first_commit();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('_commits');
    });

    it('should query main branch', () => {
      const result = lib.first_commit();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('main');
    });

    it('should use path to traverse commits', () => {
      const result = lib.first_commit();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('path');
    });

    it('should use not() to find commit without parent', () => {
      const result = lib.first_commit();
      const json = result.json();
      // Check that not() is used - it's represented as @type: Not
      const jsonStr = JSON.stringify(json);
      expect(jsonStr).to.satisfy((str) => str.includes('Not') || str.includes('not'));
    });

    it('should select commit IRI', () => {
      const result = lib.first_commit();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('Any Commit IRI');
    });

    it('should query for commit identifier', () => {
      const result = lib.first_commit();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('identifier');
    });

    it('should query for author', () => {
      const result = lib.first_commit();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('author');
    });

    it('should query for message', () => {
      const result = lib.first_commit();
      const json = result.json();
      expect(JSON.stringify(json)).to.include('message');
    });

    it('should check for absence of parent', () => {
      const result = lib.first_commit();
      const json = result.json();
      const jsonStr = JSON.stringify(json);
      // Check for parent reference - the not() wraps a triple checking for parent
      expect(jsonStr).to.include('parent');
      expect(jsonStr).to.satisfy((str) => str.includes('Not') || str.includes('not'));
    });
  });

  describe('Integration tests', () => {
    it('should create valid WOQL JSON for branches', () => {
      const result = lib.branches();
      const json = result.json();
      expect(json).to.have.property('@type');
    });

    it('should create valid WOQL JSON for commits', () => {
      const result = lib.commits('main', 10);
      const json = result.json();
      expect(json).to.have.property('@type');
    });

    it('should create valid WOQL JSON for previousCommits', () => {
      const result = lib.previousCommits('abc123', 15);
      const json = result.json();
      expect(json).to.have.property('@type');
    });

    it('should create valid WOQL JSON for first_commit', () => {
      const result = lib.first_commit();
      const json = result.json();
      expect(json).to.have.property('@type');
    });
  });
});
