function convert(obj) {
  if (obj == null) {
    return null;
  } if (typeof (obj) === 'number') {
    return {
      '@type': 'Value',
      data: {
        '@type': 'xsd:decimal',
        '@value': obj,
      },
    };
  } if (typeof (obj) === 'boolean') {
    return {
      '@type': 'Value',
      data: {
        '@type': 'xsd:boolean',
        '@value': obj,
      },
    };
  } if (typeof (obj) === 'str') {
    return {
      '@type': 'Value',
      data: {
        '@type': 'xsd:string',
        '@value': obj,
      },
    };
  } if (typeof (obj) === 'object') {
    const pairs = [];
    for (const [key, value] of Object.entries(obj)) {
      pairs.push({
        '@type': 'FieldValuePair',
        field: key,
        value: convert(value),
      });
    }
    return {
      '@type': 'DictionaryTemplate',
      data: pairs,
    };
  }
}

function Var(name) {
  this.name = name;
}

function Doc(obj) {
  this.doc = obj;
  this.encoded = convert(obj);
}
module.exports = { Var, Doc };
