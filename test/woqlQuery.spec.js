const { expect } = require('chai');
const WOQL = require('../lib/woql');
const WOQLQuery = require('../lib/query/woqlCore');
const WOQLQueryExt = require('../lib/query/woqlQuery');
const { Var } = require('../lib/query/woqlDoc');

describe('woql query', () => {
  describe('Arithmetic operations', () => {
    it('should handle div with two arguments', () => {
      const query = WOQL.div(10, 2);
      const json = query.json();
      
      expect(json['@type']).to.equal('Div');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });

    it('should handle exp (exponent)', () => {
      const query = WOQL.exp(2, 8);
      const json = query.json();
      
      expect(json['@type']).to.equal('Exp');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });

    it('should handle floor', () => {
      const query = WOQL.floor(3.14);
      const json = query.json();
      
      expect(json['@type']).to.equal('Floor');
      expect(json.argument).to.exist;
    });
  });

  describe('String and comparison operations', () => {
    it('should handle like without distance parameter', () => {
      const query = WOQL.like('hello', 'helo');
      const json = query.json();
      
      expect(json['@type']).to.equal('Like');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
      expect(json.similarity).to.be.undefined;
    });

    it('should handle like with distance parameter', () => {
      const query = WOQL.like('hello', 'helo', 0.8);
      const json = query.json();
      
      expect(json['@type']).to.equal('Like');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
      expect(json.similarity).to.exist;
    });

    it('should handle less comparison', () => {
      const query = WOQL.less(5, 10);
      const json = query.json();
      
      expect(json['@type']).to.equal('Less');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });

    it('should handle greater comparison', () => {
      const query = WOQL.greater(10, 5);
      const json = query.json();
      
      expect(json['@type']).to.equal('Greater');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });
  });

  describe('List and array operations', () => {
    it('should handle length type', () => {
      const query = WOQL.length(['a', 'b', 'c'], 'v:Length');
      const json = query.json();
      
      expect(json['@type']).to.equal('Length');
      expect(json.list).to.exist;
      // Note: length property has a bug in source code (checks 'vb' instead of 'resultVarName')
    });
  });

  describe('order_by variations', () => {
    it('should handle order_by with single variable (default asc)', () => {
      const query = WOQL.order_by('v:Name', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('OrderBy');
      expect(json.ordering).to.exist;
      expect(json.ordering).to.be.an('array');
    });

    it('should handle order_by with array [variable, "asc"]', () => {
      const query = WOQL.order_by(['v:Name', 'asc']).triple('v:A', 'v:B', 'v:C');
      const json = query.json();
      
      expect(json['@type']).to.equal('OrderBy');
      expect(json.ordering).to.exist;
      expect(json.ordering[0].order).to.equal('asc');
    });

    it('should handle order_by with array [variable, "desc"]', () => {
      const query = WOQL.order_by(['v:Name', 'desc']).triple('v:A', 'v:B', 'v:C');
      const json = query.json();
      
      expect(json['@type']).to.equal('OrderBy');
      expect(json.ordering).to.exist;
      expect(json.ordering[0].order).to.equal('desc');
    });

    it('should handle order_by with multiple variables', () => {
      const query = WOQL.order_by('v:Name', ['v:Age', 'desc']).triple('v:A', 'v:B', 'v:C');
      const json = query.json();
      
      expect(json['@type']).to.equal('OrderBy');
      expect(json.ordering).to.be.an('array');
      expect(json.ordering.length).to.equal(2);
    });
  });

  describe('Document operations', () => {
    it('should handle read_document', () => {
      const query = WOQL.read_document('Person/P1', 'v:Doc');
      const json = query.json();
      
      expect(json['@type']).to.equal('ReadDocument');
      expect(json.identifier).to.exist;
      expect(json.document).to.exist;
    });

    it('should handle insert_document without IRI', () => {
      const doc = { '@type': 'Person', name: 'Alice' };
      const query = WOQL.insert_document(doc);
      const json = query.json();
      
      expect(json['@type']).to.equal('InsertDocument');
      expect(json.document).to.exist;
    });

    it('should handle insert_document with IRI', () => {
      const doc = { '@type': 'Person', name: 'Alice' };
      const query = WOQL.insert_document(doc, 'Person/Alice');
      const json = query.json();
      
      expect(json['@type']).to.equal('InsertDocument');
      expect(json.identifier).to.exist;
      expect(json.document).to.exist;
    });

    it('should handle update_document without IRI', () => {
      const doc = { '@type': 'Person', name: 'Bob' };
      const query = WOQL.update_document(doc);
      const json = query.json();
      
      expect(json['@type']).to.equal('UpdateDocument');
      expect(json.document).to.exist;
    });

    it('should handle update_document with IRI', () => {
      const doc = { '@type': 'Person', name: 'Bob' };
      const query = WOQL.update_document(doc, 'Person/Bob');
      const json = query.json();
      
      expect(json['@type']).to.equal('UpdateDocument');
      expect(json.identifier).to.exist;
    });

    it('should handle delete_document', () => {
      const query = WOQL.delete_document('Person/P1');
      const json = query.json();
      
      expect(json['@type']).to.equal('DeleteDocument');
      expect(json.identifier).to.exist;
    });
  });

  describe('Query modifiers', () => {
    it('should handle using with valid path', () => {
      const query = WOQL.using('admin/db', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Using');
      expect(json.collection).to.exist;
    });

    it('should handle comment', () => {
      const query = WOQL.comment('test comment', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Comment');
      expect(json.comment).to.exist;
    });

    it('should handle select with variables and query', () => {
      const query = WOQL.select('v:A', 'v:B', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Select');
      expect(json.variables).to.exist;
    });

    it('should handle select chained', () => {
      const query = WOQL.select('v:A', 'v:B').triple('v:A', 'v:B', 'v:C');
      const json = query.json();
      
      expect(json['@type']).to.equal('Select');
      expect(json.variables).to.exist;
    });

    it('should handle distinct with variables and query', () => {
      const query = WOQL.distinct('v:A', 'v:B', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Distinct');
      expect(json.variables).to.exist;
    });

    it('should handle opt (optional)', () => {
      const subquery = WOQL.triple('v:A', 'v:B', 'v:C');
      const query = WOQL.opt(subquery);
      const json = query.json();
      
      expect(json['@type']).to.equal('Optional');
      expect(json.query).to.exist;
    });

    it('should handle optional alias', () => {
      const subquery = WOQL.triple('v:A', 'v:B', 'v:C');
      const query = WOQL.optional(subquery);
      const json = query.json();
      
      expect(json['@type']).to.equal('Optional');
    });
  });

  describe('Triple and quad operations', () => {
    it('should handle added_triple', () => {
      const query = WOQL.added_triple('v:S', 'v:P', 'v:O');
      const json = query.json();
      
      expect(json['@type']).to.equal('AddedTriple');
      expect(json.subject).to.exist;
      expect(json.predicate).to.exist;
      expect(json.object).to.exist;
    });

    it('should handle removed_triple', () => {
      const query = WOQL.removed_triple('v:S', 'v:P', 'v:O');
      const json = query.json();
      
      expect(json['@type']).to.equal('DeletedTriple');
    });

    it('should handle link', () => {
      const query = WOQL.link('Person/P1', 'knows', 'Person/P2');
      const json = query.json();
      
      expect(json['@type']).to.equal('Triple');
      expect(json.subject).to.exist;
      expect(json.predicate).to.exist;
      expect(json.object).to.exist;
    });

    it('should handle value', () => {
      const query = WOQL.value('Person/P1', 'name', 'Alice');
      const json = query.json();
      
      expect(json['@type']).to.equal('Triple');
    });

    it('should handle added_quad', () => {
      const query = WOQL.added_quad('v:S', 'v:P', 'v:O', 'schema/main');
      const json = query.json();
      
      expect(json['@type']).to.equal('AddedQuad');
      expect(json.graph).to.exist;
    });

    it('should handle removed_quad', () => {
      const query = WOQL.removed_quad('v:S', 'v:P', 'v:O', 'schema/main');
      const json = query.json();
      
      expect(json['@type']).to.equal('DeletedQuad');
    });
  });

  describe('Additional operations', () => {
    it('should handle sub (subsumption)', () => {
      const query = WOQL.sub('Dog', 'Animal');
      const json = query.json();
      
      expect(json['@type']).to.equal('Subsumption');
    });

    it('should handle subsumption alias', () => {
      const query = WOQL.subsumption('Cat', 'Animal');
      const json = query.json();
      
      expect(json['@type']).to.equal('Subsumption');
    });

    it('should handle eq (equals)', () => {
      const query = WOQL.eq('v:A', 'v:B');
      const json = query.json();
      
      expect(json['@type']).to.equal('Equals');
    });

    it('should handle equals alias', () => {
      const query = WOQL.equals('v:X', 'v:Y');
      const json = query.json();
      
      expect(json['@type']).to.equal('Equals');
    });

    it('should handle substr with all parameters', () => {
      const query = WOQL.substr('Hello World', 0, 5, 6, 'v:Result');
      const json = query.json();
      
      expect(json['@type']).to.equal('Substring');
      expect(json.string).to.exist;
      expect(json.before).to.exist;
      expect(json.length).to.exist;
      expect(json.after).to.exist;
      expect(json.substring).to.exist;
    });

    it('should handle substring alias', () => {
      const query = WOQL.substring('test', 0, 2, 2, 'v:Sub');
      const json = query.json();
      
      expect(json['@type']).to.equal('Substring');
    });

    it('should handle isa', () => {
      const query = WOQL.isa('Person/P1', 'Person');
      const json = query.json();
      
      expect(json['@type']).to.equal('IsA');
      expect(json.element).to.exist;
      expect(json.type).to.exist;
    });

    it('should handle unique (hash key)', () => {
      const query = WOQL.unique('doc:Person', ['v:Name', 'v:Age'], 'v:ID');
      const json = query.json();
      
      expect(json['@type']).to.equal('HashKey');
      expect(json.base).to.exist;
      expect(json.key_list).to.exist;
      expect(json.uri).to.exist;
    });
  });

  describe('Logical operations', () => {
    // Note: from() has a bug in source (checks typeof graph instead of typeof graphRef)
    // so it always returns an error

    it('should handle into', () => {
      const query = WOQL.into('instance/main', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Into');
      expect(json.graph).to.exist;
    });
  });

  describe('Temporal and interval operations', () => {
    it('should handle gte', () => {
      const json = WOQL.gte('v:a', 5).json();
      expect(json['@type']).to.equal('Gte');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });

    it('should handle lte', () => {
      const json = WOQL.lte('v:a', 5).json();
      expect(json['@type']).to.equal('Lte');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });

    it('should handle in_range', () => {
      const json = WOQL.in_range('v:x', 0, 10).json();
      expect(json['@type']).to.equal('InRange');
      expect(json.value).to.exist;
      expect(json.start).to.exist;
      expect(json.end).to.exist;
    });

    it('should handle sequence with required parameters', () => {
      const json = WOQL.sequence('v:x', 0, 10).json();
      expect(json['@type']).to.equal('Sequence');
      expect(json.value).to.exist;
      expect(json).to.not.have.property('step');
      expect(json).to.not.have.property('count');
    });

    it('should handle sequence with step and count', () => {
      const json = WOQL.sequence('v:x', 0, 10, 2, 5).json();
      expect(json['@type']).to.equal('Sequence');
      expect(json.step).to.exist;
      expect(json.count).to.exist;
    });

    it('should handle month_start_date', () => {
      const json = WOQL.month_start_date('v:ym', 'v:d').json();
      expect(json['@type']).to.equal('MonthStartDate');
      expect(json.year_month).to.exist;
      expect(json.date).to.exist;
    });

    it('should handle month_end_date', () => {
      const json = WOQL.month_end_date('v:ym', 'v:d').json();
      expect(json['@type']).to.equal('MonthEndDate');
      expect(json.year_month).to.exist;
    });

    it('should handle month_start_dates', () => {
      const json = WOQL.month_start_dates('v:d', 'v:s', 'v:e').json();
      expect(json['@type']).to.equal('MonthStartDates');
      expect(json.start).to.exist;
      expect(json.end).to.exist;
    });

    it('should handle month_end_dates', () => {
      const json = WOQL.month_end_dates('v:d', 'v:s', 'v:e').json();
      expect(json['@type']).to.equal('MonthEndDates');
      expect(json.start).to.exist;
      expect(json.end).to.exist;
    });

    it('should handle interval_relation', () => {
      const json = WOQL.interval_relation('before', 'v:xs', 'v:xe', 'v:ys', 'v:ye').json();
      expect(json['@type']).to.equal('IntervalRelation');
      expect(json.relation).to.exist;
      expect(json.x_start).to.exist;
      expect(json.y_end).to.exist;
    });

    it('should handle interval_relation_typed', () => {
      const json = WOQL.interval_relation_typed('during', 'v:x', 'v:y').json();
      expect(json['@type']).to.equal('IntervalRelationTyped');
      expect(json.x).to.exist;
      expect(json.y).to.exist;
    });

    it('should handle range_min', () => {
      const json = WOQL.range_min('v:list', 'v:min').json();
      expect(json['@type']).to.equal('RangeMin');
      expect(json.list).to.exist;
      expect(json.result).to.exist;
    });

    it('should handle range_max', () => {
      const json = WOQL.range_max('v:list', 'v:max').json();
      expect(json['@type']).to.equal('RangeMax');
      expect(json.list).to.exist;
      expect(json.result).to.exist;
    });

    it('should handle interval', () => {
      const json = WOQL.interval('v:s', 'v:e', 'v:i').json();
      expect(json['@type']).to.equal('Interval');
      expect(json.interval).to.exist;
    });

    it('should handle interval_start_duration', () => {
      const json = WOQL.interval_start_duration('v:s', 'v:dur', 'v:i').json();
      expect(json['@type']).to.equal('IntervalStartDuration');
      expect(json.duration).to.exist;
    });

    it('should handle interval_duration_end', () => {
      const json = WOQL.interval_duration_end('v:dur', 'v:e', 'v:i').json();
      expect(json['@type']).to.equal('IntervalDurationEnd');
      expect(json.duration).to.exist;
    });

    it('should handle day_after', () => {
      const json = WOQL.day_after('v:d', 'v:next').json();
      expect(json['@type']).to.equal('DayAfter');
      expect(json.date).to.exist;
      expect(json.next).to.exist;
    });

    it('should handle day_before', () => {
      const json = WOQL.day_before('v:d', 'v:prev').json();
      expect(json['@type']).to.equal('DayBefore');
      expect(json.date).to.exist;
      expect(json.previous).to.exist;
    });

    it('should handle weekday', () => {
      const json = WOQL.weekday('v:d', 3).json();
      expect(json['@type']).to.equal('Weekday');
      expect(json.weekday).to.exist;
    });

    it('should handle weekday_sunday_start', () => {
      const json = WOQL.weekday_sunday_start('v:d', 3).json();
      expect(json['@type']).to.equal('WeekdaySundayStart');
      expect(json.weekday).to.exist;
    });

    it('should handle iso_week', () => {
      const json = WOQL.iso_week('v:d', 'v:y', 'v:w').json();
      expect(json['@type']).to.equal('IsoWeek');
      expect(json.year).to.exist;
      expect(json.week).to.exist;
    });

    it('should handle date_duration', () => {
      const json = WOQL.date_duration('v:s', 'v:e', 'v:dur').json();
      expect(json['@type']).to.equal('DateDuration');
      expect(json.start).to.exist;
      expect(json.end).to.exist;
      expect(json.duration).to.exist;
    });

    it('should flag gte with missing parameters as an error', () => {
      expect(WOQL.gte('v:a').hasErrors()).to.be.true;
    });

    it('should flag in_range with missing parameters as an error', () => {
      expect(WOQL.in_range('v:x', 0).hasErrors()).to.be.true;
    });

    it('should flag iso_week with missing parameters as an error', () => {
      expect(WOQL.iso_week('v:d', 'v:y').hasErrors()).to.be.true;
    });
  });

  describe('String, set and paging operations', () => {
    it('should handle upper', () => {
      const json = WOQL.upper('v:a', 'v:b').json();
      expect(json['@type']).to.equal('Upper');
      expect(json.mixed).to.exist;
    });

    it('should handle lower', () => {
      const json = WOQL.lower('v:a', 'v:b').json();
      expect(json['@type']).to.equal('Lower');
    });

    it('should handle pad', () => {
      const json = WOQL.pad('v:a', '*', 5, 'v:b').json();
      expect(json['@type']).to.equal('Pad');
      expect(json.string).to.exist;
      expect(json.char).to.exist;
    });

    it('should handle split', () => {
      const json = WOQL.split('v:a', ',', 'v:b').json();
      expect(json['@type']).to.equal('Split');
      expect(json.pattern).to.exist;
    });

    it('should handle member', () => {
      const json = WOQL.member('v:e', 'v:l').json();
      expect(json['@type']).to.equal('Member');
      expect(json.member).to.exist;
      expect(json.list).to.exist;
    });

    it('should handle set operations', () => {
      expect(WOQL.set_difference('v:a', 'v:b', 'v:r').json()['@type']).to.equal('SetDifference');
      expect(WOQL.set_intersection('v:a', 'v:b', 'v:r').json()['@type']).to.equal('SetIntersection');
      expect(WOQL.set_union('v:a', 'v:b', 'v:r').json()['@type']).to.equal('SetUnion');
      const json = WOQL.set_union('v:a', 'v:b', 'v:r').json();
      expect(json.list_a).to.exist;
      expect(json.list_b).to.exist;
      expect(json.result).to.exist;
    });

    it('should handle set_member', () => {
      const json = WOQL.set_member('v:e', 'v:s').json();
      expect(json['@type']).to.equal('SetMember');
      expect(json.element).to.exist;
      expect(json.set).to.exist;
    });

    it('should handle list_to_set', () => {
      const json = WOQL.list_to_set('v:l', 'v:s').json();
      expect(json['@type']).to.equal('ListToSet');
      expect(json.list).to.exist;
      expect(json.set).to.exist;
    });

    it('should handle concat', () => {
      const json = WOQL.concat(['v:a', 'v:b'], 'v:r').json();
      expect(json['@type']).to.equal('Concatenate');
      expect(json.list).to.exist;
      expect(json.result).to.exist;
    });

    it('should handle join with a separator', () => {
      const json = WOQL.join(['v:a', 'v:b'], '-', 'v:r').json();
      expect(json['@type']).to.equal('Join');
      expect(json.separator).to.exist;
    });

    it('should handle sum', () => {
      const json = WOQL.sum('v:x', 'v:t').json();
      expect(json['@type']).to.equal('Sum');
      expect(json.list).to.exist;
      expect(json.result).to.exist;
    });

    it('should handle start', () => {
      const json = WOQL.start(5, WOQL.triple('v:a', 'v:b', 'v:c')).json();
      expect(json['@type']).to.equal('Start');
      expect(json.start).to.equal(5);
      expect(json.query).to.exist;
    });

    it('should handle limit', () => {
      const json = WOQL.limit(5, WOQL.triple('v:a', 'v:b', 'v:c')).json();
      expect(json['@type']).to.equal('Limit');
      expect(json.limit).to.equal(5);
      expect(json.query).to.exist;
    });

    it('should handle re (regexp)', () => {
      const json = WOQL.re('h(.*)', 'v:s', 'v:r').json();
      expect(json['@type']).to.equal('Regexp');
      expect(json.pattern).to.exist;
      expect(json.string).to.exist;
      expect(json.result).to.exist;
    });

    it('should handle length', () => {
      const json = WOQL.length('v:l', 'v:n').json();
      expect(json['@type']).to.equal('Length');
      expect(json.list).to.exist;
      expect(json.length).to.exist;
    });

    it('should handle slice with start and end', () => {
      const json = WOQL.slice('v:l', 'v:r', 1, 3).json();
      expect(json['@type']).to.equal('Slice');
      expect(json.list).to.exist;
      expect(json.result).to.exist;
      expect(json.start).to.exist;
      expect(json.end).to.exist;
    });

    it('should handle idgen (lexical key)', () => {
      const json = WOQL.idgen('doc:X', ['v:a'], 'v:id').json();
      expect(json['@type']).to.equal('LexicalKey');
      expect(json.base).to.exist;
      expect(json.key_list).to.exist;
      expect(json.uri).to.exist;
    });

    it('should handle idgen_random', () => {
      const json = WOQL.idgen_random('doc:X', 'v:id').json();
      expect(json['@type']).to.equal('RandomKey');
      expect(json.uri).to.exist;
    });

    it('should handle idgen_uuid_v7', () => {
      const json = WOQL.idgen_uuid_v7('doc:X', 'v:id').json();
      expect(json['@type']).to.equal('UuidV7');
      expect(json.base).to.exist;
      expect(json.uri).to.exist;
    });
  });

  describe('Logical and structural operations', () => {
    it('should handle not', () => {
      const json = WOQL.not(WOQL.triple('v:a', 'v:b', 'v:c')).json();
      expect(json['@type']).to.equal('Not');
      expect(json.query).to.exist;
    });

    it('should handle once', () => {
      const json = WOQL.once(WOQL.triple('v:a', 'v:b', 'v:c')).json();
      expect(json['@type']).to.equal('Once');
      expect(json.query).to.exist;
    });

    it('should handle immediately', () => {
      const json = WOQL.immediately(WOQL.triple('v:a', 'v:b', 'v:c')).json();
      expect(json['@type']).to.equal('Immediately');
      expect(json.query).to.exist;
    });

    it('should handle count', () => {
      const json = WOQL.count('v:n', WOQL.triple('v:a', 'v:b', 'v:c')).json();
      expect(json['@type']).to.equal('Count');
      expect(json.count).to.exist;
      expect(json.query).to.exist;
    });

    it('should handle typecast and its cast alias', () => {
      const json = WOQL.typecast('v:a', 'xsd:string', 'v:b').json();
      expect(json['@type']).to.equal('Typecast');
      expect(json.value).to.exist;
      expect(json.type).to.exist;
      expect(WOQL.cast('v:a', 'xsd:string', 'v:b').json()['@type']).to.equal('Typecast');
    });

    it('should handle collect', () => {
      const json = WOQL.collect('v:a', 'v:l', WOQL.triple('v:a', 'v:b', 'v:c')).json();
      expect(json['@type']).to.equal('Collect');
      expect(json.template).to.exist;
      expect(json.into).to.exist;
    });

    it('should handle true', () => {
      expect(WOQL.true().json()['@type']).to.equal('True');
    });

    it('should handle dot', () => {
      const json = WOQL.dot('v:doc', 'field', 'v:v').json();
      expect(json['@type']).to.equal('Dot');
      expect(json.document).to.exist;
      expect(json.field).to.exist;
      expect(json.value).to.exist;
    });
  });

  describe('Slice, next/previous and resource operations', () => {
    it('should handle triple_slice', () => {
      const json = WOQL.triple_slice('v:s', 'v:p', 'v:o', 0, 9).json();
      expect(json['@type']).to.equal('TripleSlice');
      expect(json.low).to.exist;
      expect(json.high).to.exist;
    });

    it('should handle quad_slice with a graph', () => {
      const json = WOQL.quad_slice('v:s', 'v:p', 'v:o', 0, 9, 'v:g').json();
      expect(json['@type']).to.equal('TripleSlice');
      expect(json.graph).to.exist;
    });

    it('should handle triple_slice_rev', () => {
      expect(WOQL.triple_slice_rev('v:s', 'v:p', 'v:o', 0, 9).json()['@type']).to.equal('TripleSliceRev');
    });

    it('should handle quad_slice_rev with a graph', () => {
      const json = WOQL.quad_slice_rev('v:s', 'v:p', 'v:o', 0, 9, 'v:g').json();
      expect(json['@type']).to.equal('TripleSliceRev');
      expect(json.graph).to.exist;
    });

    it('should handle triple_next and quad_next', () => {
      const t = WOQL.triple_next('v:s', 'v:p', 'v:o', 'v:n').json();
      expect(t['@type']).to.equal('TripleNext');
      expect(t.next).to.exist;
      const q = WOQL.quad_next('v:s', 'v:p', 'v:o', 'v:n', 'v:g').json();
      expect(q['@type']).to.equal('TripleNext');
      expect(q.graph).to.exist;
    });

    it('should handle triple_previous and quad_previous', () => {
      const t = WOQL.triple_previous('v:s', 'v:p', 'v:o', 'v:prev').json();
      expect(t['@type']).to.equal('TriplePrevious');
      expect(t.previous).to.exist;
      const q = WOQL.quad_previous('v:s', 'v:p', 'v:o', 'v:prev', 'v:g').json();
      expect(q['@type']).to.equal('TriplePrevious');
      expect(q.graph).to.exist;
    });

    it('should handle get with variable list', () => {
      const json = WOQL.get(['v:a', 'v:b'], { url: 'x.csv' }).json();
      expect(json['@type']).to.equal('Get');
      expect(json.columns).to.have.lengthOf(1);
      expect(json.resource).to.exist;
    });

    it('should handle put with variable list', () => {
      const json = WOQL.put(['v:a', 'v:b'], WOQL.triple('v:a', 'v:b', 'v:c'), { url: 'y.csv' }).json();
      expect(json['@type']).to.equal('Put');
      expect(json.columns).to.have.lengthOf(2);
      expect(json.resource).to.exist;
    });

    it('should handle as with a scalar variable pair', () => {
      const cols = WOQL.as('v:a', 'v:b').json();
      expect(cols).to.be.an('array').with.lengthOf(1);
      expect(cols[0]['@type']).to.equal('Column');
      expect(cols[0].variable).to.exist;
      expect(cols[0].indicator).to.exist;
    });

    it('should handle as with a type argument', () => {
      const cols = WOQL.as('v:a', 'v:b', 'xsd:string').json();
      expect(cols).to.have.lengthOf(1);
      expect(cols[0].type).to.exist;
    });

    it('should handle as with an array per column spec', () => {
      const cols = WOQL.as(['v:a', 'v:b'], ['v:c', 'v:d']).json();
      expect(cols).to.be.an('array').with.lengthOf(2);
      expect(cols[1]['@type']).to.equal('Column');
    });
  });

  describe('Error handling', () => {
    it('should handle sub without parameters', () => {
      const query = WOQL.sub();
      expect(query.hasErrors()).to.be.true;
    });

    it('should handle eq without parameters', () => {
      const query = WOQL.eq();
      expect(query.hasErrors()).to.be.true;
    });

    it('should handle using with invalid path', () => {
      const query = WOQL.using(null);
      expect(query.hasErrors()).to.be.true;
    });
  });

  describe('as() argument shapes', () => {
    it('should handle a flat array as indexed columns', () => {
      const query = WOQL.as(['v:a', 'v:b']);
      expect(query.query).to.be.an('array').with.length(2);
      expect(query.query[0]['@type']).to.equal('Column');
      expect(query.query[0].indicator.index).to.equal(0);
    });

    it('should handle a scalar pair with a type argument', () => {
      const query = WOQL.as('v:a', 'v:b', 'xsd:string');
      expect(query.query).to.be.an('array').with.length(1);
      expect(query.query[0].type).to.equal('xsd:string');
    });

    it('should handle an object argument', () => {
      const query = WOQL.as({ '@type': 'AsVar', identifier: 'x' });
      expect(query.query[0]['@type']).to.equal('AsVar');
    });
  });

  describe('substr() argument shapes', () => {
    it('should emit a Substring query with positional args', () => {
      const query = WOQL.substr('v:full', 0, 3, 0, 'v:sub');
      expect(query.query['@type']).to.equal('Substring');
      expect(query.query.substring['@type']).to.equal('DataValue');
    });

    it('should flag non-string arguments as an error', () => {
      expect(WOQL.substr(123, 0, 3, 0, 456).hasErrors()).to.be.true;
    });
  });

  describe('chained builders wrap the open cursor', () => {
    it('should wrap the cursor with And when methods chain', () => {
      const query = WOQL.triple('v:s', 'v:p', 'v:o')
        .upper('v:a', 'v:b').lower('v:a', 'v:b')
        .pad('v:a', 'x', 2, 'v:b').split('v:a', 'x', 'v:b')
        .member('v:a', 'v:b').set_member('v:a', 'v:b')
        .concat('v:a', 'v:b').join('v:a', 'v:b').sum('v:a', 'v:b')
        .start(5).limit(5)
        .re('x', 'v:a', 'v:b').length('v:a', 'v:b').slice('v:a', 'v:b', 0, 1)
        .typecast('v:a', 'xsd:string', 'v:b').count('v:a', 'v:b')
        .size('v:a', 'v:b').triple_count('v:a', 'v:b')
        .unique('doc:X', ['v:a'], 'v:id').idgen('doc:X', ['v:a'], 'v:id')
        .idgen_random('doc:X', ['v:a'], 'v:id').idgen_uuid_v7('doc:X', 'v:id')
        .dot('v:a', 'p', 'v:b')
        .order_by('v:a')
        .group_by(['v:a'], ['v:b'], 'v:g');
      expect(query.hasErrors()).to.be.false;
      expect(query.json()['@type']).to.equal('And');
    });
  });

  describe('argument validation', () => {
    // Each of these builders flags a parameterError when required args are missing.
    [
      'triple', 'quad', 'sub', 'type_of', 'select', 'distinct', 'order_by',
      'added_triple', 'removed_triple', 'added_quad', 'removed_quad',
      'triple_slice', 'triple_slice_rev', 'triple_next', 'triple_previous',
      'quad_slice', 'quad_slice_rev', 'quad_next', 'quad_previous',
      'value', 'link', 'weekday', 'weekday_sunday_start',
      'month_start_date', 'month_start_dates', 'month_end_date', 'month_end_dates',
      'interval', 'range_min', 'range_max', 'day_after', 'day_before',
      'iso_week', 'date_duration', 'using', 'insert',
      'delete_triple', 'delete_quad', 'add_triple', 'add_quad', 'triple_relation',
    ].forEach((method) => {
      it(`should flag ${method}() with no arguments as an error`, () => {
        expect(WOQL[method]().hasErrors()).to.be.true;
      });
    });
  });

  describe('findLastProperty', () => {
    const propertyTriple = {
      subject: 'doc:P', predicate: 'rdf:type', object: 'owl:DatatypeProperty',
    };

    it('should find a property triple nested inside and()', () => {
      const q = new WOQLQuery();
      const found = q.findLastProperty({ and: [{ '@type': 'Triple' }, propertyTriple] });
      expect(found).to.equal(propertyTriple);
    });

    it('should find a property triple nested inside or()', () => {
      const q = new WOQLQuery();
      const found = q.findLastProperty({ or: [{ '@type': 'Triple' }, propertyTriple] });
      expect(found).to.equal(propertyTriple);
    });

    it('should recurse into a query wrapper', () => {
      const q = new WOQLQuery();
      const found = q.findLastProperty({ query: propertyTriple });
      expect(found).to.equal(propertyTriple);
    });

    it('should search and/or from the last element backwards', () => {
      const q = new WOQLQuery();
      const other = { subject: 'doc:P', predicate: 'rdfs:domain', object: 'owl:Thing' };
      const found = q.findLastProperty({ and: [propertyTriple, other] });
      expect(found).to.equal(other);
    });

    it('should return false for non-property triples and empty input', () => {
      const q = new WOQLQuery();
      expect(q.findLastProperty({ subject: 'a', predicate: 'b', object: 'c' })).to.be.false;
      expect(q.findLastProperty({})).to.be.false;
      expect(q.findLastProperty(null)).to.be.false;
    });
  });

  describe('builders on a non-empty cursor wrap with And', () => {
    const SUB = () => WOQL.triple('a', 'b', 'c');
    const CHAINED = {
      read_document: ['doc:X', 'v:o'],
      insert_document: [{ name: 'x' }, 'doc:X'],
      update_document: [{ name: 'x' }, 'doc:X'],
      delete_document: ['doc:X'],
      using: ['v:p', SUB()],
      select: ['v:x'],
      distinct: ['v:x'],
      or: [SUB()],
      into: ['v:g', SUB()],
      triple: ['s', 'p', 'o'],
      triple_relation: ['s', 'p', 'o', 'r', 'v'],
      triple_slice: ['s', 'p', 'o', 'v:l', 'v:h'],
      quad_slice: ['s', 'p', 'o', 'v:l', 'v:h', 'g'],
      triple_slice_rev: ['s', 'p', 'o', 'v:l', 'v:h'],
      quad_slice_rev: ['s', 'p', 'o', 'v:l', 'v:h', 'g'],
      triple_next: ['s', 'p', 'o', 'v:n'],
      quad_next: ['s', 'p', 'o', 'v:n', 'g'],
      triple_previous: ['s', 'p', 'o', 'v:pr'],
      quad_previous: ['s', 'p', 'o', 'v:pr', 'g'],
      added_triple: ['s', 'p', 'o'],
      removed_triple: ['s', 'p', 'o'],
      link: ['s', 'p', 'o'],
      value: ['s', 'p', 'o'],
      quad: ['s', 'p', 'o', 'g'],
      added_quad: ['s', 'p', 'o', 'g'],
      removed_quad: ['s', 'p', 'o', 'g'],
      sub: ['A', 'B'],
      substr: ['v:s', 1, 2, 3, 'v:o'],
      remote: ['http://x', { format: 'csv' }],
      trim: ['v:s', 'v:r'],
      plus: ['v:a', 'v:b'],
      minus: ['v:a', 'v:b'],
      times: ['v:a', 'v:b'],
      div: ['v:a', 'v:b'],
      exp: ['v:a', 'v:b'],
      floor: ['v:a'],
      like: ['v:a', 'v:b', 0.5],
      less: ['v:a', 'v:b'],
      greater: ['v:a', 'v:b'],
      gte: ['v:a', 'v:b'],
      lte: ['v:a', 'v:b'],
      sequence: ['v:v', 'v:s', 'v:e', 'v:st', 'v:c'],
      month_start_date: ['v:ym', 'v:d'],
      month_end_date: ['v:ym', 'v:d'],
      month_start_dates: ['v:d', 'v:s', 'v:e'],
      month_end_dates: ['v:d', 'v:s', 'v:e'],
      interval_relation: ['v:r', 'v:a', 'v:b', 'v:c', 'v:d'],
      interval_relation_typed: ['v:r', 'v:x', 'v:y'],
      range_min: ['v:l', 'v:r'],
      range_max: ['v:l', 'v:r'],
      day_after: ['v:d', 'v:n'],
      day_before: ['v:d', 'v:p'],
      weekday: ['v:d', 'v:w'],
      weekday_sunday_start: ['v:d', 'v:w'],
      iso_week: ['v:d', 'v:y', 'v:w'],
      date_duration: ['v:s', 'v:e', 'v:du'],
      pad: ['v:i', 'x', 3, 'v:r'],
      split: ['v:i', ',', 'v:r'],
      member: ['v:e', 'v:l'],
      set_difference: ['v:a', 'v:b', 'v:r'],
      set_intersection: ['v:a', 'v:b', 'v:r'],
      set_union: ['v:a', 'v:b', 'v:r'],
      set_member: ['v:e', 'v:s'],
      list_to_set: ['v:l', 'v:s'],
      concat: ['v:l', 'v:r'],
      join: ['v:l', ';', 'v:r'],
      sum: [SUB(), 'v:t'],
      start: [5, SUB()],
      limit: [5, SUB()],
      re: ['.*', 'v:i', 'v:r'],
      length: ['v:l', 'v:r'],
      slice: ['v:l', 'v:r', 1, 3],
      not: [SUB()],
      once: [SUB()],
      immediately: [SUB()],
      count: ['v:c', SUB()],
      typecast: ['v:v', 'xsd:string', 'v:r', {}],
      order_by: ['v:x'],
      group_by: ['v:g', 'v:gr', 'v:o', SUB()],
      collect: ['v:t', 'v:i', SUB()],
      dot: ['v:d', 'f', 'v:v'],
      type_of: ['e', 'T'],
    };
    Object.keys(CHAINED).forEach((method) => {
      it(`should wrap the cursor when ${method} follows another query`, () => {
        const q = SUB()[method](...CHAINED[method]);
        expect(q.hasErrors()).to.be.false;
        expect(q.json().and).to.exist;
      });
    });
  });

  describe('partial argument validation', () => {
    // Missing the last required argument is rejected by these builders.
    const GUARDED = {
      less: ['v:a'],
      greater: ['v:a'],
      gte: ['v:a'],
      lte: ['v:a'],
      sequence: ['v:v', 'v:s'],
      interval_relation: ['r', 'a', 'b', 'c'],
      interval_start_duration: ['s', 'd'],
      quad: ['a', 'b', 'c'],
      sub: ['A'],
      type_of: ['e'],
      link: ['s', 'p'],
      added_quad: ['s', 'p', 'o'],
      removed_quad: ['s', 'p', 'o'],
      quad_slice: ['s', 'p', 'o', 'v:l'],
      quad_slice_rev: ['s', 'p', 'o', 'v:l'],
      quad_next: ['s', 'p', 'o'],
      quad_previous: ['s', 'p', 'o'],
      month_start_date: ['v:ym'],
      month_end_date: ['v:ym'],
      month_start_dates: ['v:d', 'v:s'],
      month_end_dates: ['v:d', 'v:s'],
      range_min: ['v:l'],
      range_max: ['v:l'],
      day_after: ['v:d'],
      day_before: ['v:d'],
      weekday: ['v:d'],
      weekday_sunday_start: ['v:d'],
      iso_week: ['v:d', 'v:y'],
      date_duration: ['v:s', 'v:e'],
    };
    Object.keys(GUARDED).forEach((method) => {
      it(`should flag ${method}() missing its last argument as an error`, () => {
        expect(WOQL[method](...GUARDED[method]).hasErrors()).to.be.true;
      });
    });

    // These builders tolerate a missing trailing argument — documented contract.
    const LENIENT = {
      triple: ['a', 'b'],
      value: ['s', 'p'],
      added_triple: ['s', 'p'],
      removed_triple: ['s', 'p'],
      triple_slice: ['s', 'p', 'o', 'v:l'],
      triple_slice_rev: ['s', 'p', 'o', 'v:l'],
      triple_next: ['s', 'p', 'o'],
      triple_previous: ['s', 'p', 'o'],
      pad: ['v:i', 'x', 3],
      split: ['v:i'],
      member: ['v:e'],
      sum: [WOQL.triple('a', 'b', 'c')],
      start: [5],
      limit: [5],
      length: ['v:l'],
      slice: ['v:l', 'v:r', 1],
      typecast: ['v:v', 'xsd:string', 'v:r'],
    };
    Object.keys(LENIENT).forEach((method) => {
      it(`should tolerate ${method}() missing its last argument`, () => {
        expect(WOQL[method](...LENIENT[method]).hasErrors()).to.be.false;
      });
    });
  });

  describe('base class stubs', () => {
    ['update_triple', 'star', 'update_quad', 'insert', 'graph', 'node', 'nuke', 'all', '_set_context']
      .forEach((method) => {
        it(`should return the query itself from ${method}()`, () => {
          const q = new WOQLQueryExt();
          expect(q[method]('a', 'b', 'c', 'd')).to.equal(q);
        });
      });

    ['boolean', 'string', 'literal', 'iri'].forEach((method) => {
      it(`should return a literal descriptor from ${method}()`, () => {
        expect(new WOQLQueryExt()[method]('x', 't')).to.deep.equal({});
      });
    });
  });

  describe('argument shape internals', () => {
    const SUB = () => WOQL.triple('a', 'b', 'c');

    it('should accept a trailing subquery in select and from', () => {
      expect(WOQL.select('v:x', SUB()).hasErrors()).to.be.false;
      expect(WOQL.from('g', SUB()).hasErrors()).to.be.false;
    });

    it('should reject a non-string graph ref in from and into', () => {
      expect(WOQL.from(123).hasErrors()).to.be.true;
      expect(WOQL.into(123).hasErrors()).to.be.true;
    });

    it('should shuffle substr arguments when the substring is omitted', () => {
      expect(WOQL.substr('joe', 1, 2, 'oe').hasErrors()).to.be.false;
      expect(WOQL.substr('joe', 1, 'oe').hasErrors()).to.be.false;
      expect(WOQL.substr('joe').hasErrors()).to.be.true;
    });

    it('should accept both asvars shapes and an optional resource in get', () => {
      expect(WOQL.get(WOQL.as('a', 'v:b')).hasErrors()).to.be.false;
      expect(WOQL.get(['a', 'v:b'], WOQL.remote('http://x')).hasErrors()).to.be.false;
    });

    it('should accept both varsToExp shapes and an optional file resource in put', () => {
      const withFile = WOQL.put(WOQL.as('a', 'v:b'), SUB(), 'file.csv');
      expect(withFile.hasErrors()).to.be.false;
      expect(WOQL.put(['a', 'b'], SUB()).hasErrors()).to.be.false;
    });

    it('should handle as() tuple arrays, types and Var instances', () => {
      expect(WOQL.as(['a', 'v:x'], ['b', 'v:y', 'xsd:string']).hasErrors()).to.be.false;
      expect(WOQL.as(0, 'v:a', 'xsd:string').hasErrors()).to.be.false;
      expect(WOQL.as('a', new Var('b')).hasErrors()).to.be.false;
      expect(WOQL.as('a', 'xsd:string').hasErrors()).to.be.false;
      expect(WOQL.as('a').hasErrors()).to.be.false;
      expect(WOQL.as({ indicator: 'a' }).hasErrors()).to.be.false;
      expect(WOQL.as({ json: () => ({ one: 'a' }) }).hasErrors()).to.be.false;
    });

    it('should set remote options when a format object is given', () => {
      const q = WOQL.remote('http://x', { format: 'csv' });
      expect(q.hasErrors()).to.be.false;
      expect(q.json().options).to.deep.equal({ format: 'csv' });
      expect(WOQL.remote('http://x').json().options).to.be.undefined;
    });

    it('should nest arithmetic arguments beyond the second', () => {
      ['plus', 'minus', 'times', 'div', 'divide'].forEach((m) => {
        const q = WOQL[m](1, 2, 3);
        expect(q.hasErrors()).to.be.false;
      });
    });

    it('should accept query and non-query expressions in eval', () => {
      expect(WOQL.eval(WOQL.plus(1, 2), 'v:r').hasErrors()).to.be.false;
      expect(WOQL.eval('v:a', 'v:r').hasErrors()).to.be.false;
    });

    it('should wrap a non-empty cursor for the remaining builders', () => {
      expect(SUB().in_range('v:v', 'v:s', 'v:e').json().and).to.exist;
      expect(SUB().from('g', SUB()).json().and).to.exist;
      expect(SUB().comment('c').json().and).to.exist;
      expect(SUB().eq('v:a', 'v:b').json().and).to.exist;
      expect(SUB().concat('v:l', 'v:r').json().and).to.exist;
    });

    it('should flag partial arguments on the remaining guarded builders', () => {
      expect(WOQL.interval_relation_typed('r', 'x').hasErrors()).to.be.true;
      expect(WOQL.interval('s', 'd').hasErrors()).to.be.true;
      expect(WOQL.interval_duration_end('d', 'e').hasErrors()).to.be.true;
      expect(WOQL.eq('v:a').hasErrors()).to.be.true;
    });

    it('should parse a comma-separated variable string in concat', () => {
      expect(WOQL.concat('v:a,v:b', 'v:r').hasErrors()).to.be.false;
    });

    it('should accept a numeric length result', () => {
      expect(WOQL.length('v:l', 5).hasErrors()).to.be.false;
    });

    it('should accept a Var template in collect', () => {
      expect(WOQL.collect(new Var('t'), 'v:i', SUB()).hasErrors()).to.be.false;
    });
  });
});
