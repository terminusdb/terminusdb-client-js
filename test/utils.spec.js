const { expect } = require('chai');
const UTILS = require('../lib/utils.js');

describe('utils tests', () => {
  const servURL = 'http://127.0.0.1:6363/';

  it('check standard urls', () => {
    expect(UTILS.standard_urls.rdf).to.equal(UTILS.getStdURL('rdf', ''));
  });
  it('check URIEncodePayload', () => {
    const expected = 'a=A&b=B&c=C&day=sir&b=D';

    const payload = [{
      a: 'A', b: 'B', c: 'C', day: 'sir',
    }, { b: 'D' }];

    expect(UTILS.URIEncodePayload(payload)).to.equal(expected);
  });
  it('check addURLPrefix', () => {
    const docURL = 'http://mydocs/';
    UTILS.addURLPrefix('doc', docURL);

    expect(UTILS.standard_urls.doc).to.equal(docURL);
  });
  it('check empty', () => {
    expect(UTILS.empty({})).to.equal(true);
    expect(UTILS.empty([])).to.equal(true);
    expect(UTILS.empty({ a: '' })).to.equal(false);
    expect(UTILS.empty([''])).to.equal(false);
  });

  /* it('check genBNID',function(){
    const bnid = UTILS.genBNID();
    expect(bnid.substring(0, 4)).to.equal("doc:");
 }) */

  it('check getShorthand', () => {
    const sh = UTILS.getShorthand(`${UTILS.standard_urls.rdf}type`);
    expect(sh).to.equal('rdf:type');
  });

  it('check compareIDs', () => {
    const sh = UTILS.compareIDs(`${UTILS.standard_urls.rdf}type`, 'rdf:type');
    expect(sh).to.equal(true);
  });
  // I HAVE TO CHECK IF THIS IS OK
  it('check shorten', () => {
    const sh = UTILS.shorten(`${UTILS.standard_urls.rdf}type`);
    expect(sh).to.equal('type');
  });

  it('check unshorten', () => {
    const full = `${UTILS.standard_urls.rdf}type`;
    expect(UTILS.unshorten('rdf:type')).to.equal(full);
  });

  it('check valid URL', () => {
    expect(UTILS.validURL('http://myweb/')).to.equal(true);
    expect(UTILS.validURL('https://myweb/')).to.equal(true);
    expect(UTILS.validURL('nothttps://myweb/')).to.equal(false);
  });

  it('check labelFromURL', () => {
    const label = UTILS.labelFromURL('doc:This_IS_A_DOC');
    expect(label).to.equal('This IS A DOC');
  });

  it('check urlFragment', () => {
    const frag = UTILS.urlFragment(UTILS.getStdURL('rdf', 'type'));
    expect(frag).to.equal('type');
  });

  it('check lastURLBit', () => {
    const label = UTILS.lastURLBit('http://adsfsd/X');
    expect(label).to.equal('X');
  });

  it('check addNamespacesToVariables', () => {
    const full = UTILS.addNamespacesToVariables(['A', 'v:B']);
    expect(full).to.eql(['v:A', 'v:B']);
  });

  it('check removeNamespacesFromVariables', () => {
    const full = UTILS.removeNamespacesFromVariables(['A', 'v:B']);
    expect(full).to.eql(['A', 'B']);
  });

  it('check isStringType', () => {
    expect(UTILS.TypeHelper.isStringType(UTILS.getStdURL('xsd', 'string'))).to.equal(true);
    expect(UTILS.TypeHelper.isStringType(UTILS.getStdURL('xsd', 'decimal'))).to.equal(false);
  });

  it('check numberWithCommas', () => {
    const cnum = UTILS.TypeHelper.numberWithCommas(10000.323);
    const cnum2 = UTILS.TypeHelper.numberWithCommas(100009323, '.');
    expect(cnum).to.equal('10,000.323');
    expect(cnum2).to.equal('100.009.323');
  });

  it('check parseDate', () => {
    const xsdstr = '-0001-02-01T10:12:23.3';
    const parsed = UTILS.DateHelper.parseDate('xsd:dateTime', xsdstr);
    const expected = {
      year: '-0001', month: 2, day: 1, hour: '10', minute: '12', second: '23.3', timezone: false,
    };
    expect(parsed).to.eql(expected);
  });

  it('check xsdFromParsed', () => {
    const parsed = {
      year: '-0001', month: 2, day: 1, hour: '10', minute: '12', second: '23.3',
    };
    const xsdstr = UTILS.DateHelper.xsdFromParsed(parsed, 'xsd:dateTime');
    const expected = '-0001-02-01T10:12:23.3';
    expect(xsdstr).to.equal(expected);
  });

  it('encodeURISegment test ====%%TEST organization name', () => {
    expect(UTILS.encodeURISegment("====%%TEST")).to.equal("====%25%25TEST");
  });

  it('encodeURISegment test &&26567 organization name', () => {
    expect(UTILS.encodeURISegment("&&26567")).to.equal("%26%2626567");
  });

  it('encodeURISegment test %6277&ˆˆˆ@ˆˆWˆTWTET#Y@&&GHHSHHS organization name', () => {
    expect(UTILS.encodeURISegment("%6277&ˆˆˆ@ˆˆWˆTWTET#Y@&&GHHSHHS")).to.equal("%256277%26%CB%86%CB%86%CB%86@%CB%86%CB%86W%CB%86TWTET%23Y@%26%26GHHSHHS");
  });

/* it('check convertTimestampToXsd',function(){
    let parsed = UTILS.DateHelper.convertTimestampToXsd(0);
    const expected = { year: 1970, month: 1, day: 1, hour: 1, minute: 0, second: 0}
    expect(parsed).to.eql(expected);
 }) */
});
