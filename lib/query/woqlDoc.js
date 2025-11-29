/**
 * Check if an object is already a converted WOQL Value structure
 * @param {object} obj
 * @returns {boolean}
 */
function isAlreadyConverted(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }
  // A converted Value has @type: 'Value' and one of: dictionary, list, data, node, variable
  if (obj['@type'] === 'Value') {
    return (
      obj.dictionary !== undefined
      || obj.list !== undefined
      || obj.data !== undefined
      || obj.node !== undefined
      || obj.variable !== undefined
    );
  }
  return false;
}

// eslint-disable-next-line consistent-return
function convert(obj) {
  if (obj == null) {
    return null;
  } if (isAlreadyConverted(obj)) {
    // Object is already a converted WOQL Value structure, return as-is
    return obj;
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
  } if (typeof (obj) === 'string') {
    if (obj.indexOf('v:') === -1) {
      return {
        '@type': 'Value',
        data: {
          '@type': 'xsd:string',
          '@value': obj,
        },
      };
    }

    return {
      '@type': 'Value',
      variable: obj.split(':')[1],
    };

  // eslint-disable-next-line no-use-before-define
  } if (obj instanceof Var) {
    return {
      '@type': 'Value',
      variable: obj.name,
    };
  } if (typeof (obj) === 'object' && !Array.isArray(obj)) {
    const pairs = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(obj)) {
      pairs.push({
        '@type': 'FieldValuePair',
        field: key,
        value: convert(value),
      });
    }
    return {
      '@type': 'Value',
      dictionary: {
        '@type': 'DictionaryTemplate',
        data: pairs,
      },
    };
  } if (typeof (obj) === 'object' && Array.isArray(obj)) {
    const list = obj.map(convert);
    return {
      '@type': 'Value',
      list,
    };
  }
}

/**
 * @param {string} name The variable name
 * @returns
 */
function Var(name) {
  this.name = name;
  this.json = function () {
    return {
      '@type': 'Value',
      variable: this.name,
    };
  };
}

let uniqueVarCounter = 0;
/**
 * @param {string} name The variable name
 * @returns
 */
function VarUnique(name) {
  uniqueVarCounter += 1;
  const localName = `${name}_${uniqueVarCounter}`;
  this.name = localName;
  this.json = function () {
    return {
      '@type': 'Value',
      variable: this.name,
    };
  };
}
// Inherit Var prototype chain for VarUnique to pass instanceof check for Var (same)
VarUnique.prototype = Object.create(Var.prototype);

/**
 * Reset the unique variable counter to a specific value
 * @param {number} start - starting value
 */
function SetVarsUniqueCounter(start) {
  uniqueVarCounter = start;
}

/**
 * @param {object} name
 * @returns {object}
 */
function Doc(obj) {
  this.doc = obj;
  this.encoded = convert(obj);
  return this.encoded;
}

/**
* @param  {...string} varNames
* @returns {object<Var>}
*/
function Vars(...args) {
  const varObj = {};
  for (let i = 0, j = args.length; i < j; i += 1) {
    const argumentName = args[i];

    // this[argumentName] = new Var(argumentName);
    varObj[argumentName] = new Var(argumentName);
  }
  return varObj;
}

/**
* @param  {...string} varNames
* @returns {object<Var>}
*/
function VarsUnique(...args) {
  const varObj = {};
  for (let i = 0, j = args.length; i < j; i += 1) {
    const argumentName = args[i];

    uniqueVarCounter += 1;
    varObj[argumentName] = new Var(argumentName + (uniqueVarCounter ? `_${uniqueVarCounter}` : ''));
  }
  return varObj;
}

module.exports = {
  Vars, VarsUnique, Var, VarUnique, Doc, SetVarsUniqueCounter,
};
