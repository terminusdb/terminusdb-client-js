/**
 * Class responsible for converting a JSON WOQL into a WOQL.js / WOQL.py string
 */

function WOQLPrinter(vocab, language) {
  this.vocab = vocab;
  this.language = language;
  this.indent_spaces = 4;
  this.boxed_predicates = [
    'variable',
    'array_element',
    'node',
    // 'woql:arithmetic_value',
    // 'woql:variable_name',
  ];
  this.subject_cleaned_predicates = ['subject', 'element'];
  this.schema_cleaned_predicates = [
    'predicate',
    'uri',
    'of_type',
  ];
  this.list_operators = ['ValueList', 'Array', 'NamedAsVar', 'IndexedAsVar', 'AsVar'];
  this.query_list_operators = ['And', 'Or'];
  this.operator_maps = {
    IDGenerator: 'idgen',
    IsA: 'isa',
    PostResource: 'post',
    QueryResource: 'remote',
    AsVars: 'as',
    NamedAsVars: 'as',
    IndexedAsVars: 'as',
    DeletedTriple: 'removed_triple',
  };
  this.shortcuts = {
    optional: 'opt',
    substring: 'substr',
    regexp: 're',
    subsumption: 'sub',
    equals: 'eq',
    concatenate: 'concat',
  };
  this.pythonic = {
    and: 'woql_and',
    or: 'woql_or',
    as: 'woql_as',
    with: 'woql_with',
    from: 'woql_from',
    not: 'woql_not',
  };
  this.show_context = false;
}
// WOQL.triple(WOQL.node_value("Subject"), WOQL.node_value("Predicate"), WOQL.value("Object"))
WOQLPrinter.prototype.printJSON = function (json, level, fluent, newline) {
  level = level || 0;
  fluent = fluent || false;
  let str = '';
  if (!json['@type']) {
    console.log('Bad structure passed to print json, no type: ', json);
    return '';
  }

  // check for language
  if (['Value', 'NodeValue', 'DataValue', 'ArithmeticValue', 'OrderTemplate'].indexOf(json['@type']) > -1) {
    return this.pvar(json);
  }

  let operator = json['@type'];
  if (typeof json['@type'] === 'string' && operator.indexOf(':') > -1) {
    operator = json['@type'].split(':')[1];
  }

  if (operator === 'QueryResource') {
    return this.getQueryResourceStr(json, level, fluent, newline);
  }

  if (operator) {
    const ujson = this.unboxJSON(operator, json);
    if (ujson) {
      const meat = this.printArgument(
        operator,
        this.getBoxedPredicate(operator, json),
        ujson,
        level,
        fluent,
      );
      if (this.isListOperator(operator)) return `[${meat}]`;
      return meat;
    }
    if (this.isListOperator(operator)) {
      str += '[';
    } else {
      // get the function name from the @type field
      const call = this.getFunctionForOperator(operator, json);
      const indent = newline ? level * this.indent_spaces : 0;
      str += `${this.getWOQLPrelude(call, fluent, indent)}(`;
    }
    // below needs to be changed to have a specific ordering
    // get the list of the keys without the @type
    const args = this.getArgumentOrder(operator, json);
    // I have to review this
    const divlimit = args.indexOf('query') === -1 ? args.length - 1 : args.length - 2;
    // query argument when I have a subquery
    args.forEach((item, i) => { // && operator !== 'When'
      let nfluent = !!((item == 'query' && operator !== 'Put') || item == 'consequent'
                || item === 'resource');
      // to be review
      if (item === 'resource' && typeof json[item] === 'string') nfluent = false;
      str += this.printArgument(operator, item, json[item], level, nfluent);
      // something to review ??
      if (i < divlimit && operator !== 'Get') str += ', ';
    });
    if (this.isListOperator(operator)) str += ']';
    else {
      if (this.argumentTakesNewline(operator)) str += `\n${nspaces(level * this.indent_spaces)}`;
      if (!fluent) str += ')';
    }
  } else {
    console.log('wrong structure passed to print json ', json);
  }
  return str;
};
// file or remote method
WOQLPrinter.prototype.getQueryResourceStr = function (json, level, fluent, newline) {
  if (!json.source) {
    console.log('wrong structure passed to print json ', json);
    return '';
  }
  const functName = json.source.url ? 'remote' : 'file';
  const indent = newline ? level * this.indent_spaces : 0;
  let str = `${this.getWOQLPrelude(functName, fluent, indent)}(`;
  const source = json.source.file ? `"${json.source.file}"` : `"${json.source.url}"`;
  const format = json.format === 'csv' ? '' : json.format;
  str += source;
  if (format)str += `, ${format}`;
  return str;
};
// remove the @type from the keys
WOQLPrinter.prototype.getArgumentOrder = function (operator, json) {
  const args = Object.keys(json);
  args.splice(args.indexOf('@type'), 1);
  return args;
};

WOQLPrinter.prototype.argumentTakesNewline = function (operator) {
  return this.isQueryListOperator(operator);
};

WOQLPrinter.prototype.argumentRequiresArray = function (predicate, entries) {
  if ((predicate === 'group_by' || predicate === 'list') && entries.length > 1) return true;
  return false;
};
// this is the list of the argument not @type
WOQLPrinter.prototype.printArgument = function (operator, predicate, arg, level, fluent) {
  let str = '';
  if (fluent) str += ')';
  const newline = this.argumentTakesNewline(operator);
  if (newline) str += `\n${nspaces((level + 1) * this.indent_spaces)}`;
  if (arg['@type'] === 'True') return 'true';

  if (predicate === 'variables') return this.decompileVariables(arg);
  if (predicate === 'group_by' || predicate === 'template') return this.decompileVariables(arg, true);

  // list of .as in get or put function
  if (predicate == 'columns') return this.decompileAsVars(arg, level + 1);

  if (predicate == 'pattern') return this.decompileRegexPattern(arg, level + 1);
  if (Array.isArray(arg)) {
    const arr_entries = [];
    for (let j = 0; j < arg.length; j++) {
      const nlevel = newline ? level + 1 : level;
      arr_entries.push(this.printJSON(arg[j], nlevel, fluent, newline));
    }
    const jstr = newline ? `,\n${nspaces(++level * this.indent_spaces)}` : ',';
    if (this.argumentRequiresArray(predicate, arr_entries)) {
      str += `[${arr_entries.join(jstr)}]`;
    } else str += arr_entries.join(jstr);
  } else if (typeof arg === 'object') {
    const reet = this.printJSON(arg, level, fluent);
    // if(newline) str += "\n" + nspaces(level*this.indent_spaces)

    str += reet;
  } else if (typeof arg === 'string') {
    str += this.uncleanArgument(arg, operator, predicate);
  }
  return str;
};

WOQLPrinter.prototype.decompileVariables = function (args, checkIsArray = false) {
  if (Array.isArray(args)) {
    let str = '';
    args.forEach((varName, index) => {
      str += `"v:${varName}"`;
      if (index < args.length - 1)str += ', ';
    });
    if (checkIsArray && args.length > 1)str = `[${str}]`;
    return str;
  }
  return '';
};
// woql:datatype in path
WOQLPrinter.prototype.decompileRegexPattern = function (json) {
  if (typeof json === 'object' && json['@type'] === 'DataValue') {
    return this.pvar(json);
  } if ((json['@type']).startsWith('Path')) {
    return `"${this.decompilePathPattern(json)}"`;
  }
  const str = json;
  return `"${str.replace('\\', '\\\\')}"`;
};

WOQLPrinter.prototype.pvar = function (json) {
  // if (json['woql:variable_name'] && typeof json['woql:variable_name']['@value'] != 'undefined') {
  if (json.variable) {
    let varname = json.variable;
    const order = json.order ? json.order : '';
    if (varname.indexOf(':') === -1) {
      varname = `v:${varname}`;
    }
    return (order !== '' && order !== 'asc') ? `["${varname}","${order}"]` : `"${varname}"`;
  } if (json.node) {
    return `"${json.node}"`;
  } if (json.data) {
    return JSON.stringify(json.data);
  } if (json.list) {
    const listArr = json.list;
    if (Array.isArray(listArr)) {
      const listTmp = [];
      listArr.forEach((listItem, index) => {
        listTmp.push(this.pvar(listItem));
      });
      return `[${listTmp.join(', ')}]`;
    }
    return this.pvar(json.list);
  }
  // we have list to
  return false;
};

/**
 * Gets the starting characters for a WOQL query - varies depending on how the query is invoked and how indented it is
 */
WOQLPrinter.prototype.getWOQLPrelude = function (operator, fluent, inline) {
  if (operator === 'true' || operator === 'false') {
    if (this.language == 'python') {
      return operator.charAt(0).toUpperCase() + operator.slice(1);
    }
    return operator;
  }
  let prelude = 'WOQL.';
  if (this.language == 'python') {
    this.pythonic[operator] && (operator = this.pythonic[operator]);
    prelude = 'WOQLQuery().';
  }
  if (fluent) {
    return `.${operator}`;
  }
  return (inline ? `\n${nspaces(inline)}` : '') + prelude + operator;
};

WOQLPrinter.prototype.uncleanArgument = function (arg, operator, predicate) {
  if (arg.indexOf(':') !== -1) {
    // is it a short cut?
    for (const s in this.vocab) {
      if (this.vocab[s] == arg) return `"${s}"`;
    }
    // is there a default reverse mapping
    /* if (this.subject_cleaned_predicates.indexOf(predicate) != -1) {
            if (arg.substring(0, 4) == 'doc:') arg = arg.substring(4)
        }
        if (this.schema_cleaned_predicates.indexOf(predicate) != -1) {
            if (arg.substring(0, 4) == 'scm:') arg = arg.substring(4)
        } */
  }
  return `"${arg}"`;
};

WOQLPrinter.prototype.isListOperator = function (operator) {
  return this.list_operators.indexOf(operator) != -1;
};

WOQLPrinter.prototype.isQueryListOperator = function (operator) {
  return this.query_list_operators.indexOf(operator) != -1;
};

/*
* transform the operator in the function name
* like "@type": "Triple" => WOQL.triple
*/
WOQLPrinter.prototype.getFunctionForOperator = function (operator, json) {
  if (this.operator_maps[operator]) return this.operator_maps[operator];

  // triple with the graph parameter is the old quad
  if (operator === 'Triple' && json.graph) return 'quad';
  const f = camelToSnake(operator);
  if (this.shortcuts[f]) return this.shortcuts[f];
  return f;
};

WOQLPrinter.prototype.getBoxedPredicate = function (operator, json) {
  for (let i = 0; i < this.boxed_predicates.length; i++) {
    if (json[this.boxed_predicates[i]]) {
      return this.boxed_predicates[i];
    }
  }
  if (operator == 'QueryListElement') {
    return 'woql:query';
  }
  return false;
};

WOQLPrinter.prototype.unboxJSON = function (operator, json) {
  const bp = this.getBoxedPredicate(operator, json);
  if (bp) {
    return json[bp];
  }
  return false;
};

// WOQL.as
WOQLPrinter.prototype.decompileAsVars = function (asvs, level) {
  let str = '';
  if (!Array.isArray(asvs)) return '';
  asvs.forEach((wasv, i) => {
    str += `\n${nspaces(level * this.indent_spaces)}${i === 0 ? 'WOQL' : ''}`;
    // old 'woql:NamedAsVar'
    if (wasv['@type'] == 'Column' && wasv.indicator) {
      const source = wasv.indicator.name || wasv.indicator.index;
      const target = `v:${wasv.variable}`;
      const { type } = wasv.indicator;
      str += `.as("${source}", "${target}"`;
      if (type) str += `, "${type}")`;
      else str += ')';
    }
  });
  return str;
};

WOQLPrinter.prototype.decompilePathPattern = function (pstruct) {
  const t = pstruct['@type'];
  switch (t) {
    case 'InversePathPredicate':
      return `<${pstruct.predicate}`;
    case 'PathPredicate':
      return pstruct.predicate;
    case 'PathPlus':
      var next = pstruct.plus;
      if (Array.isArray(next)) next = next[0];
      if (needsParentheses(next)) return `(${this.decompilePathPattern(next)})+`;
      return `${this.decompilePathPattern(next)}+`;
    case 'PathStar':
      var next = pstruct.star;
      if (Array.isArray(next)) next = next[0];
      if (needsParentheses(next)) return `(${this.decompilePathPattern(next)})*`;
      return `${this.decompilePathPattern(next)}*`;
    case 'PathTimes':
      var next = pstruct.times;
      var astr = ` {${
        pstruct.from
      },${
        pstruct.to
      }}`;
      if (Array.isArray(next)) next = next[0];
      if (needsParentheses(next)) return `(${this.decompilePathPattern(next)})${astr}`;
      return this.decompilePathPattern(next) + astr;
    case 'PathSequence':
      const sequenceArr = pstruct.sequence;
      if (Array.isArray(sequenceArr) && sequenceArr.length === 2) {
        const next1 = sequenceArr[0];// pstruct['woql:path_first']
        const next2 = sequenceArr[1];// pstruct['woql:path_second']

        if (Array.isArray(next1)) next1 = next1[0];
        var seqstr = '';
        if (needsParentheses(next1)) seqstr += '(';
        seqstr += this.decompilePathPattern(next1);
        if (needsParentheses(next1)) seqstr += ')';
        seqstr += ',';
        if (needsParentheses(next2)) seqstr += '(';
        seqstr += this.decompilePathPattern(next2);
        if (next1['@type'] === 'InversePathPredicate') {
          seqstr += '>';
        }
        if (needsParentheses(next2)) seqstr += ')';
        return seqstr;
      }
      // there is a problem in remap
    case 'PathOr':
      const orArr = pstruct.or;
      if (Array.isArray(orArr) && orArr.length === 2) {
        let next1 = orArr[0]; // pstruct['woql:path_left']
        const next2 = orArr[1]; // pstruct['woql:path_right']
        if (Array.isArray(next1)) next1 = next1[0];
        var seqstr = '';
        if (needsParentheses(next1)) seqstr += '(';
        seqstr += this.decompilePathPattern(next1);
        if (needsParentheses(next1)) seqstr += ')';
        seqstr += '|';
        if (needsParentheses(next2)) seqstr += '(';
        seqstr += this.decompilePathPattern(next2);
        if (needsParentheses(next2)) seqstr += ')';
        return seqstr;
      }
  }
  return 'error';
};

function needsParentheses(obj) {
  const noparens = ['PathPredicate', 'PathPlus', 'PathTimes', 'InversePathPredicate'];
  if (noparens.indexOf(obj['@type']) !== -1) return false;
  return true;
}

function camelToSnake(string) {
  return string
    .replace(/[\w]([A-Z])/g, (m) => `${m[0]}_${m[1]}`)
    .toLowerCase();
}

function nspaces(n) {
  let spaces = '';
  for (let i = 0; i < n; i++) {
    spaces += ' ';
  }
  return spaces;
}

module.exports = WOQLPrinter;
