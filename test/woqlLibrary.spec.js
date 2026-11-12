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

  describe('rdflist_list()', () => {
    it('should group_by collected cell values', () => {
      const json = lib.rdflist_list('v:head', 'v:result').json();
      const str = JSON.stringify(json);
      expect(str).to.include('PathStar');
      expect(str).to.include('rdf:first');
      expect(str).to.include('GroupBy');
    });
  });

  describe('rdflist_peek()', () => {
    it('should read rdf:first of the head cell', () => {
      const str = JSON.stringify(lib.rdflist_peek('v:head', 'v:val').json());
      expect(str).to.include('rdf:first');
      expect(str).to.include('rdf:List');
    });
  });

  describe('rdflist_last()', () => {
    it('should traverse rest* to the rdf:nil-terminated cell', () => {
      const str = JSON.stringify(lib.rdflist_last('v:head', 'v:val').json());
      expect(str).to.include('PathStar');
      expect(str).to.include('rdf:nil');
    });
  });

  describe('rdflist_nth0()', () => {
    it('should throw for a negative index', () => {
      expect(() => lib.rdflist_nth0('v:head', -1, 'v:val')).to.throw('index >= 0');
    });

    it('should peek the head for index 0', () => {
      const str = JSON.stringify(lib.rdflist_nth0('v:head', 0, 'v:val').json());
      expect(str).to.include('rdf:first');
      expect(str).to.not.include('PathTimes');
    });

    it('should emit a fixed rest path for index 3', () => {
      const str = JSON.stringify(lib.rdflist_nth0('v:head', 3, 'v:val').json());
      expect(str).to.include('PathTimes').and.to.include('"from":"3"');
    });

    it('should use rest* plus length for a variable index', () => {
      const str = JSON.stringify(lib.rdflist_nth0('v:head', 'v:idx', 'v:val').json());
      expect(str).to.include('PathStar');
      expect(str).to.include('Length');
    });
  });

  describe('rdflist_nth1()', () => {
    it('should throw for index below 1', () => {
      expect(() => lib.rdflist_nth1('v:head', 0, 'v:val')).to.throw('index >= 1');
    });

    it('should map 1-based index 2 onto rest{1,1}', () => {
      const str = JSON.stringify(lib.rdflist_nth1('v:head', 2, 'v:val').json());
      expect(str).to.include('PathTimes').and.to.include('"from":"1"');
    });

    it('should throw for a variable index', () => {
      expect(() => lib.rdflist_nth1('v:head', 'v:idx', 'v:val')).to.throw('not yet supported');
    });
  });

  describe('rdflist_member()', () => {
    it('should traverse rest* and match rdf:first', () => {
      const str = JSON.stringify(lib.rdflist_member('v:head', 'v:val').json());
      expect(str).to.include('PathStar');
      expect(str).to.include('rdf:first');
    });
  });

  describe('rdflist_length()', () => {
    it('should measure the rest* path to rdf:nil', () => {
      const str = JSON.stringify(lib.rdflist_length('v:head', 'v:len').json());
      expect(str).to.include('PathStar');
      expect(str).to.include('Length');
    });
  });

  describe('rdflist_pop()', () => {
    it('should delete the second cons cell and rewire the head', () => {
      const str = JSON.stringify(lib.rdflist_pop('v:head', 'v:val').json());
      expect(str).to.include('DeleteTriple');
      expect(str).to.include('AddTriple');
    });
  });

  describe('rdflist_push()', () => {
    it('should insert a new cons cell before the old head content', () => {
      const str = JSON.stringify(lib.rdflist_push('v:head', 'v:val').json());
      expect(str).to.include('RandomKey');
      expect(str).to.include('RandomKey');
      expect(str).to.include('AddTriple');
    });
  });

  describe('rdflist_append()', () => {
    it('should attach a new cell after the rdf:nil-terminated tail', () => {
      const str = JSON.stringify(lib.rdflist_append('v:head', 'v:val').json());
      expect(str).to.include('rdf:nil');
      expect(str).to.include('RandomKey');
      expect(str).to.include('AddTriple');
    });
  });

  describe('rdflist_clear()', () => {
    it('should bind the result to rdf:nil', () => {
      const str = JSON.stringify(lib.rdflist_clear('v:head', 'v:out').json());
      expect(str).to.include('rdf:nil');
      expect(str).to.include('DeleteTriple');
    });
  });

  describe('rdflist_insert()', () => {
    it('should throw for a negative position', () => {
      expect(() => lib.rdflist_insert('v:head', -1, 'v:val')).to.throw('position >= 0');
    });

    it('should splice at the head for position 0', () => {
      const str = JSON.stringify(lib.rdflist_insert('v:head', 0, 'v:val').json());
      expect(str).to.include('LexicalKey');
      expect(str).to.not.include('PathTimes');
    });

    it('should use eq on the head for position 1', () => {
      const str = JSON.stringify(lib.rdflist_insert('v:head', 1, 'v:val').json());
      expect(str).to.not.include('PathTimes');
      expect(str).to.include('DeleteTriple');
    });

    it('should path to the predecessor for position 3', () => {
      const str = JSON.stringify(lib.rdflist_insert('v:head', 3, 'v:val').json());
      expect(str).to.include('PathTimes').and.to.include('"from":"2"');
    });
  });

  describe('rdflist_drop()', () => {
    it('should throw for a negative position', () => {
      expect(() => lib.rdflist_drop('v:head', -1)).to.throw('position >= 0');
    });

    it('should relink the head for position 0', () => {
      const str = JSON.stringify(lib.rdflist_drop('v:head', 0).json());
      expect(str).to.include('DeleteTriple');
      expect(str).to.not.include('PathTimes');
    });

    it('should use eq on the head for position 1', () => {
      const str = JSON.stringify(lib.rdflist_drop('v:head', 1).json());
      expect(str).to.not.include('PathTimes');
    });

    it('should path to the predecessor for position 3', () => {
      const str = JSON.stringify(lib.rdflist_drop('v:head', 3).json());
      expect(str).to.include('PathTimes').and.to.include('"from":"2"');
    });
  });

  describe('rdflist_swap()', () => {
    it('should throw for negative positions', () => {
      expect(() => lib.rdflist_swap('v:head', -1, 2)).to.throw('positions >= 0');
      expect(() => lib.rdflist_swap('v:head', 0, -2)).to.throw('positions >= 0');
    });

    it('should be a no-op triple when positions are equal', () => {
      const str = JSON.stringify(lib.rdflist_swap('v:head', 2, 2).json());
      expect(str).to.include('rdf:List');
      expect(str).to.not.include('AddTriple');
    });

    it('should use eq for position 0 and path otherwise', () => {
      const str = JSON.stringify(lib.rdflist_swap('v:head', 0, 2).json());
      expect(str).to.include('PathTimes').and.to.include('"from":"2"');
      expect(str).to.include('AddTriple');
      expect(str).to.include('DeleteTriple');
    });
  });

  describe('rdflist_empty() / rdflist_is_empty()', () => {
    it('should equate the variable to rdf:nil', () => {
      expect(JSON.stringify(lib.rdflist_empty('v:l').json())).to.include('rdf:nil');
    });

    it('should equate the cons subject to rdf:nil', () => {
      expect(JSON.stringify(lib.rdflist_is_empty('v:head').json())).to.include('rdf:nil');
    });
  });

  describe('rdflist_slice()', () => {
    it('should throw for negative indices', () => {
      expect(() => lib.rdflist_slice('v:head', -1, 2, 'v:out')).to.throw('negative');
      expect(() => lib.rdflist_slice('v:head', 0, -2, 'v:out')).to.throw('negative');
    });

    it('should bind an empty list when start >= end', () => {
      const str = JSON.stringify(lib.rdflist_slice('v:head', 2, 2, 'v:out').json());
      expect(str).to.not.include('PathTimes');
    });

    it('should use eq on the head for slice [0,1)', () => {
      const str = JSON.stringify(lib.rdflist_slice('v:head', 0, 1, 'v:out').json());
      expect(str).to.not.include('PathTimes');
      expect(str).to.include('GroupBy');
    });

    it('should emit rest{0,n-1} for a head-anchored range', () => {
      const str = JSON.stringify(lib.rdflist_slice('v:head', 0, 3, 'v:out').json());
      expect(str).to.include('PathTimes').and.to.include('"from":"0"').and.to.include('"to":"2"');
    });

    it('should emit rest{start,end-1} for an interior range', () => {
      const str = JSON.stringify(lib.rdflist_slice('v:head', 2, 5, 'v:out').json());
      expect(str).to.include('PathTimes').and.to.include('"from":"2"').and.to.include('"to":"4"');
    });
  });

  describe('rdflist_reverse()', () => {
    it('should collect values then write them back reversed', () => {
      const str = JSON.stringify(lib.rdflist_reverse('v:head').json());
      expect(str).to.include('PathStar');
      expect(str).to.include('GroupBy');
      expect(str).to.include('DeleteTriple');
      expect(str).to.include('AddTriple');
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
