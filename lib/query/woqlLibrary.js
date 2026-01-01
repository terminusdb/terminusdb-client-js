/// /@ts-check
// we can not import woqlBuilder because woqlBuilder import WOQLLibrary
const WOQLQuery = require('./woqlBuilder');

/**
 * @typedef {import('./woqlBuilder')} WOQLQuery
 */

/**
 * @license Apache Version 2
 * @module WOQLLibrary
 * @constructor WOQLLibrary
 * @description Library Functions to manage the commits graph
 * @example
 *  const woqlLib = WOQLLibrary()
 *  woqlLib.branches()
 *
 *  //or you can call this functions using WOQL Class
 *  WOQL.lib().branches()
 * */
class WOQLLibrary {
  default_schema_resource = 'schema/main';

  default_commit_resource = '_commits';

  default_meta_resource = '_meta';

  masterdb_resource = '_system';

  empty = '';
}

/**
 * General Pattern 4: Retrieves Branches, Their ID, Head Commit ID, Head Commit Time
 * (if present, new branches have no commits)
 */
WOQLLibrary.prototype.branches = function () { // values, variables, cresource) {
  const woql = new WOQLQuery().using('_commits').triple('v:Branch', 'rdf:type', '@schema:Branch')
    .triple('v:Branch', '@schema:name', 'v:Name')
    .opt()
    .triple('v:Branch', '@schema:head', 'v:Head')
    .triple('v:Head', '@schema:identifier', 'v:commit_identifier')
    .triple('v:Head', '@schema:timestamp', 'v:Timestamp');
  return woql;
};

/**
 * get all the commits of a specific branch
 * if a timestamp is given, gets all the commits before the specified timestamp
 * @param {string} [branch] - the branch name
 * @param {number} [limit] - the max number of result
 * @param {number} [start] - the start of the pagination
 * @param {number} [timestamp] - Unix timestamp in seconds
 */

WOQLLibrary.prototype.commits = function (branch = 'main', limit = 0, start = 0, timestamp = 0) {
  const woql = new WOQLQuery().using('_commits');
  if (limit) woql.limit(limit);
  if (start) woql.start(start);
  woql.select('v:Parent ID', 'v:Commit ID', 'v:Time', 'v:Author', 'v:Branch ID', 'v:Message');

  const andArr = [new WOQLQuery().triple('v:Branch', 'name', new WOQLQuery().string(branch))
    .triple('v:Branch', 'head', 'v:Active Commit ID')
    .path('v:Active Commit ID', 'parent*', 'v:Parent', 'v:Path')
    .triple('v:Parent', 'timestamp', 'v:Time')];
  if (timestamp) {
    andArr.push(new WOQLQuery().less('v:Time', timestamp));
  }
  andArr.push(new WOQLQuery().triple('v:Parent', 'identifier', 'v:Commit ID')
    .triple('v:Parent', 'author', 'v:Author')
    .triple('v:Parent', 'message', 'v:Message')
    .opt()
    .triple('v:Parent', 'parent', 'v:Parent ID'));
  return woql.and(...andArr);
};

/**
*get commits older than the specified commit id
* @param {string} [commit_id] - the commit id
* @param {number} [limit] - the max number of result
*/
// eslint-disable-next-line camelcase
WOQLLibrary.prototype.previousCommits = function (commit_id, limit = 10) {
  return new WOQLQuery().using('_commits').limit(limit).select('v:Parent ID', 'v:Message', 'v:Commit ID', 'v:Time', 'v:Author')
    .and(
      new WOQLQuery().and(
        new WOQLQuery().triple('v:Active Commit ID', '@schema:identifier', new WOQLQuery().string(commit_id)),
        new WOQLQuery().path('v:Active Commit ID', '@schema:parent+', 'v:Parent', 'v:Path'),
        new WOQLQuery().triple('v:Parent', '@schema:identifier', 'v:Commit ID'),
        new WOQLQuery().triple('v:Parent', '@schema:timestamp', 'v:Time'),
        new WOQLQuery().triple('v:Parent', '@schema:author', 'v:Author'),
        new WOQLQuery().triple('v:Parent', '@schema:message', 'v:Message'),
        new WOQLQuery().triple('v:Parent', '@schema:parent', 'v:Parent ID'),
        new WOQLQuery().opt().triple('v:Parent', 'parent', 'v:Parent ID'),
      ),
    );
};

/**
 * Finds the id of the very first commit in a database's history
 *
 * This is useful for finding information about when, by who and why the database was created
 * The first commit is the only commit in the database that does not have a parent commit
 *
 */
WOQLLibrary.prototype.first_commit = function () {
  const noparent = new WOQLQuery()
    .using('_commits').select('v:Any Commit IRI')
    .and(
      new WOQLQuery().triple('v:Branch', 'name', new WOQLQuery().string('main'))
        .triple('v:Branch', 'head', 'v:Active Commit ID')
        .path('v:Active Commit ID', 'parent*', 'v:Any Commit IRI', 'v:Path'),

      new WOQLQuery().triple(
        'v:Any Commit IRI',
        '@schema:identifier',
        'v:Commit ID',
      ),
      new WOQLQuery().triple(
        'v:Any Commit IRI',
        '@schema:author',
        'v:Author',
      ),
      new WOQLQuery().triple(
        'v:Any Commit IRI',
        '@schema:message',
        'v:Message',
      ),
      new WOQLQuery()
        .not()
        .triple(
          'v:Any Commit IRI',
          '@schema:parent',
          'v:Parent IRI',
        ),

    );
  return noparent;
};

// ============================================================================
// RDF List Operations
// ============================================================================

/**
 * Converts an rdf:List cons cell structure to a readable list
 * Traverses rdf:first/rdf:rest chain to collect all values
 * @param {string} consSubject - Variable or IRI of the list cons cell (rdf:List head)
 * @param {string} listVar - Variable to bind the resulting list values
 * @returns {WOQLQuery} Query that binds list values to listVar
 */
WOQLLibrary.prototype.rdflist = function (consSubject, listVar) {
  return new WOQLQuery().and(
    new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().path(consSubject, 'rdf:rest*', 'v:_cell'),
    new WOQLQuery().opt().and(
      new WOQLQuery().triple('v:_cell', 'rdf:first', listVar),
      new WOQLQuery().triple('v:_cell', 'rdf:rest', 'v:_next'),
    ),
  );
};

/**
 * Get the first element of an rdf:List (peek operation)
 * @param {string} consSubject - Variable or IRI of the list cons cell
 * @param {string} valueVar - Variable to bind the first value
 * @returns {WOQLQuery} Query that binds first value to valueVar
 */
WOQLLibrary.prototype.rdflist_peek = function (consSubject, valueVar) {
  return new WOQLQuery().and(
    new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().triple(consSubject, 'rdf:first', valueVar),
  );
};

/**
 * Get the length of an rdf:List
 * Uses path query to traverse all rest links and count them
 * @param {string} consSubject - Variable or IRI of the list cons cell
 * @param {string} lengthVar - Variable to bind the length
 * @returns {WOQLQuery} Query that binds list length to lengthVar
 */
WOQLLibrary.prototype.rdflist_length = function (consSubject, lengthVar) {
  return new WOQLQuery().and(
    new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().path(consSubject, 'rdf:rest*', 'rdf:nil', 'v:_length_path'),
    new WOQLQuery().length('v:_length_path', lengthVar),
  );
};

/**
 * Pop the first element from an rdf:List
 * Returns both the first value and the rest of the list
 * @param {string} consSubject - Variable or IRI of the list cons cell
 * @param {string} valueVar - Variable to bind the popped value
 * @param {string} restVar - Variable to bind the rest of the list
 * @returns {WOQLQuery} Query that binds popped value and rest
 */
WOQLLibrary.prototype.rdflist_pop = function (consSubject, valueVar, restVar) {
  return new WOQLQuery().and(
    new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().triple(consSubject, 'rdf:first', valueVar),
    new WOQLQuery().triple(consSubject, 'rdf:rest', restVar),
  );
};

/**
 * Push a new element to the front of an rdf:List
 * Creates a new cons cell that becomes the new head
 * @param {string} consSubject - Variable to bind the new list head
 * @param {string} value - Value to push
 * @param {string} oldList - Variable or IRI of the existing list
 * @returns {WOQLQuery} Query that creates new head with pushed value
 */
WOQLLibrary.prototype.rdflist_push = function (consSubject, value, oldList) {
  return new WOQLQuery().and(
    new WOQLQuery().idgen_random('terminusdb://data/Cons/', consSubject),
    new WOQLQuery().add_triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().add_triple(consSubject, 'rdf:first', value),
    new WOQLQuery().add_triple(consSubject, 'rdf:rest', oldList),
  );
};

/**
 * Append an element to the end of an rdf:List
 * Traverses to the last cell and adds new cell there
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {string} value - Value to append
 * @param {string} [newCellVar] - Optional variable to bind the new cell
 * @returns {WOQLQuery} Query that appends value to end of list
 */
WOQLLibrary.prototype.rdflist_append = function (consSubject, value, newCellVar) {
  const newCell = newCellVar || 'v:_append_new_cell';
  return new WOQLQuery().and(
    new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().path(consSubject, 'rdf:rest*', 'v:_last_cell'),
    new WOQLQuery().triple('v:_last_cell', 'rdf:rest', 'rdf:nil'),
    new WOQLQuery().idgen_random('terminusdb://data/Cons/', newCell),
    new WOQLQuery().delete_triple('v:_last_cell', 'rdf:rest', 'rdf:nil'),
    new WOQLQuery().add_triple('v:_last_cell', 'rdf:rest', newCell),
    new WOQLQuery().add_triple(newCell, 'rdf:type', 'rdf:List'),
    new WOQLQuery().add_triple(newCell, 'rdf:first', value),
    new WOQLQuery().add_triple(newCell, 'rdf:rest', 'rdf:nil'),
  );
};

/**
 * Clear all elements from an rdf:List, leaving only the head pointing to nil
 * @param {string} consSubject - Variable or IRI of the list head
 * @returns {WOQLQuery} Query that clears the list
 */
WOQLLibrary.prototype.rdflist_clear = function (consSubject) {
  return new WOQLQuery().and(
    new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().triple(consSubject, 'rdf:first', 'v:_clear_first'),
    new WOQLQuery().triple(consSubject, 'rdf:rest', 'v:_clear_rest'),
    new WOQLQuery().delete_triple(consSubject, 'rdf:first', 'v:_clear_first'),
    new WOQLQuery().delete_triple(consSubject, 'rdf:rest', 'v:_clear_rest'),
    new WOQLQuery().add_triple(consSubject, 'rdf:rest', 'rdf:nil'),
  );
};

/**
 * Insert a value at a specific position in an rdf:List
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {number} position - Position to insert at (0-indexed)
 * @param {string} value - Value to insert
 * @param {string} [newNodeVar] - Optional variable to bind the new node
 * @returns {WOQLQuery} Query that inserts value at position
 */
WOQLLibrary.prototype.rdflist_insert = function (consSubject, position, value, newNodeVar) {
  if (position < 0) {
    throw new Error('rdflist_insert requires position >= 0.');
  }

  const newNode = newNodeVar || 'v:_insert_new_node';

  if (position === 0) {
    const oldFirstVar = 'v:_insert_old_first';
    const oldRestVar = 'v:_insert_old_rest';

    return new WOQLQuery().and(
      new WOQLQuery().triple(consSubject, 'rdf:first', oldFirstVar),
      new WOQLQuery().triple(consSubject, 'rdf:rest', oldRestVar),
      new WOQLQuery().idgen('list_node', [oldFirstVar, consSubject], newNode),
      new WOQLQuery().add_triple(newNode, 'rdf:type', 'rdf:List'),
      new WOQLQuery().add_triple(newNode, 'rdf:first', oldFirstVar),
      new WOQLQuery().add_triple(newNode, 'rdf:rest', oldRestVar),
      new WOQLQuery().delete_triple(consSubject, 'rdf:first', oldFirstVar),
      new WOQLQuery().delete_triple(consSubject, 'rdf:rest', oldRestVar),
      new WOQLQuery().add_triple(consSubject, 'rdf:first', value),
      new WOQLQuery().add_triple(consSubject, 'rdf:rest', newNode),
    );
  }

  const predNodeVar = 'v:_insert_pred_node';
  const oldRestVar = 'v:_insert_old_rest';
  const restCount = position - 1;
  const pathPattern = restCount === 0 ? '' : `rdf:rest{${restCount},${restCount}}`;

  const findPredecessor = restCount === 0
    ? new WOQLQuery().eq(predNodeVar, consSubject)
    : new WOQLQuery().path(consSubject, pathPattern, predNodeVar);

  return new WOQLQuery().and(
    findPredecessor,
    new WOQLQuery().triple(predNodeVar, 'rdf:rest', oldRestVar),
    new WOQLQuery().idgen('list_node', [value, predNodeVar], newNode),
    new WOQLQuery().delete_triple(predNodeVar, 'rdf:rest', oldRestVar),
    new WOQLQuery().add_triple(predNodeVar, 'rdf:rest', newNode),
    new WOQLQuery().add_triple(newNode, 'rdf:type', 'rdf:List'),
    new WOQLQuery().add_triple(newNode, 'rdf:first', value),
    new WOQLQuery().add_triple(newNode, 'rdf:rest', oldRestVar),
  );
};

/**
 * Drop/remove a single element from an rdf:List at a specific position
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {number} position - Position of element to remove (0-indexed)
 * @returns {WOQLQuery} Query that removes the element at position
 */
WOQLLibrary.prototype.rdflist_drop = function (consSubject, position) {
  if (position < 0) {
    throw new Error('rdflist_drop requires position >= 0.');
  }

  if (position === 0) {
    const oldFirstVar = 'v:_drop_old_first';
    const restNodeVar = 'v:_drop_rest_node';
    const nextFirstVar = 'v:_drop_next_first';
    const nextRestVar = 'v:_drop_next_rest';

    return new WOQLQuery().and(
      new WOQLQuery().triple(consSubject, 'rdf:first', oldFirstVar),
      new WOQLQuery().triple(consSubject, 'rdf:rest', restNodeVar),
      new WOQLQuery().triple(restNodeVar, 'rdf:first', nextFirstVar),
      new WOQLQuery().triple(restNodeVar, 'rdf:rest', nextRestVar),
      new WOQLQuery().delete_triple(restNodeVar, 'rdf:type', 'rdf:List'),
      new WOQLQuery().delete_triple(restNodeVar, 'rdf:first', nextFirstVar),
      new WOQLQuery().delete_triple(restNodeVar, 'rdf:rest', nextRestVar),
      new WOQLQuery().delete_triple(consSubject, 'rdf:first', oldFirstVar),
      new WOQLQuery().delete_triple(consSubject, 'rdf:rest', restNodeVar),
      new WOQLQuery().add_triple(consSubject, 'rdf:first', nextFirstVar),
      new WOQLQuery().add_triple(consSubject, 'rdf:rest', nextRestVar),
    );
  }

  const predNodeVar = 'v:_drop_pred_node';
  const dropNodeVar = 'v:_drop_node';
  const dropFirstVar = 'v:_drop_first';
  const dropRestVar = 'v:_drop_rest';
  const restCount = position - 1;
  const pathPattern = restCount === 0 ? '' : `rdf:rest{${restCount},${restCount}}`;

  const findPredecessor = restCount === 0
    ? new WOQLQuery().eq(predNodeVar, consSubject)
    : new WOQLQuery().path(consSubject, pathPattern, predNodeVar);

  return new WOQLQuery().and(
    findPredecessor,
    new WOQLQuery().triple(predNodeVar, 'rdf:rest', dropNodeVar),
    new WOQLQuery().triple(dropNodeVar, 'rdf:first', dropFirstVar),
    new WOQLQuery().triple(dropNodeVar, 'rdf:rest', dropRestVar),
    new WOQLQuery().delete_triple(dropNodeVar, 'rdf:type', 'rdf:List'),
    new WOQLQuery().delete_triple(dropNodeVar, 'rdf:first', dropFirstVar),
    new WOQLQuery().delete_triple(dropNodeVar, 'rdf:rest', dropRestVar),
    new WOQLQuery().delete_triple(predNodeVar, 'rdf:rest', dropNodeVar),
    new WOQLQuery().add_triple(predNodeVar, 'rdf:rest', dropRestVar),
  );
};

/**
 * Move an element from one position to another in an rdf:List
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {number} fromPos - Source position (0-indexed)
 * @param {number} toPos - Destination position (0-indexed)
 * @returns {WOQLQuery} Query that moves element
 */
WOQLLibrary.prototype.rdflist_move = function (consSubject, fromPos, toPos) {
  if (fromPos < 0 || toPos < 0) {
    throw new Error('rdflist_move requires positions >= 0.');
  }

  if (fromPos === toPos) {
    return new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List');
  }

  const movedValue = 'v:_move_value';

  // Read value at fromPos
  let readValueOps;
  if (fromPos === 0) {
    readValueOps = [new WOQLQuery().triple(consSubject, 'rdf:first', movedValue)];
  } else {
    const fromNode = 'v:_move_from_node';
    const pathToFrom = `rdf:rest{${fromPos},${fromPos}}`;
    readValueOps = [
      new WOQLQuery().path(consSubject, pathToFrom, fromNode),
      new WOQLQuery().triple(fromNode, 'rdf:first', movedValue),
    ];
  }

  // Drop operations
  let dropOps;
  if (fromPos === 0) {
    const oldFirstVar = 'v:_move_drop_old_first';
    const restNodeVar = 'v:_move_drop_rest_node';
    const nextFirstVar = 'v:_move_drop_next_first';
    const nextRestVar = 'v:_move_drop_next_rest';

    dropOps = [
      new WOQLQuery().triple(consSubject, 'rdf:first', oldFirstVar),
      new WOQLQuery().triple(consSubject, 'rdf:rest', restNodeVar),
      new WOQLQuery().triple(restNodeVar, 'rdf:first', nextFirstVar),
      new WOQLQuery().triple(restNodeVar, 'rdf:rest', nextRestVar),
      new WOQLQuery().delete_triple(restNodeVar, 'rdf:type', 'rdf:List'),
      new WOQLQuery().delete_triple(restNodeVar, 'rdf:first', nextFirstVar),
      new WOQLQuery().delete_triple(restNodeVar, 'rdf:rest', nextRestVar),
      new WOQLQuery().delete_triple(consSubject, 'rdf:first', oldFirstVar),
      new WOQLQuery().delete_triple(consSubject, 'rdf:rest', restNodeVar),
      new WOQLQuery().add_triple(consSubject, 'rdf:first', nextFirstVar),
      new WOQLQuery().add_triple(consSubject, 'rdf:rest', nextRestVar),
    ];
  } else {
    const dropPredNodeVar = 'v:_move_drop_pred_node';
    const dropNodeVar = 'v:_move_drop_node';
    const dropFirstVar = 'v:_move_drop_first';
    const dropRestVar = 'v:_move_drop_rest';
    const dropRestCount = fromPos - 1;
    const dropPathPattern = dropRestCount === 0
      ? ''
      : `rdf:rest{${dropRestCount},${dropRestCount}}`;

    const findDropPredecessor = dropRestCount === 0
      ? new WOQLQuery().eq(dropPredNodeVar, consSubject)
      : new WOQLQuery().path(consSubject, dropPathPattern, dropPredNodeVar);

    dropOps = [
      findDropPredecessor,
      new WOQLQuery().triple(dropPredNodeVar, 'rdf:rest', dropNodeVar),
      new WOQLQuery().triple(dropNodeVar, 'rdf:first', dropFirstVar),
      new WOQLQuery().triple(dropNodeVar, 'rdf:rest', dropRestVar),
      new WOQLQuery().delete_triple(dropNodeVar, 'rdf:type', 'rdf:List'),
      new WOQLQuery().delete_triple(dropNodeVar, 'rdf:first', dropFirstVar),
      new WOQLQuery().delete_triple(dropNodeVar, 'rdf:rest', dropRestVar),
      new WOQLQuery().delete_triple(dropPredNodeVar, 'rdf:rest', dropNodeVar),
      new WOQLQuery().add_triple(dropPredNodeVar, 'rdf:rest', dropRestVar),
    ];
  }

  // Insert operations
  const newNode = 'v:_move_new_node';
  let insertOps;

  if (toPos === 0) {
    const insertOldFirstVar = 'v:_move_insert_old_first';
    const insertOldRestVar = 'v:_move_insert_old_rest';
    const insertNewNode = 'v:_move_insert_displaced_node';

    insertOps = [
      new WOQLQuery().triple(consSubject, 'rdf:first', insertOldFirstVar),
      new WOQLQuery().triple(consSubject, 'rdf:rest', insertOldRestVar),
      new WOQLQuery().idgen('list_node', [insertOldFirstVar, consSubject], insertNewNode),
      new WOQLQuery().add_triple(insertNewNode, 'rdf:type', 'rdf:List'),
      new WOQLQuery().add_triple(insertNewNode, 'rdf:first', insertOldFirstVar),
      new WOQLQuery().add_triple(insertNewNode, 'rdf:rest', insertOldRestVar),
      new WOQLQuery().delete_triple(consSubject, 'rdf:first', insertOldFirstVar),
      new WOQLQuery().delete_triple(consSubject, 'rdf:rest', insertOldRestVar),
      new WOQLQuery().add_triple(consSubject, 'rdf:first', movedValue),
      new WOQLQuery().add_triple(consSubject, 'rdf:rest', insertNewNode),
    ];
  } else {
    const insertPredNodeVar = 'v:_move_insert_pred_node';
    const insertOldRestVar = 'v:_move_insert_old_rest';
    const insertPredOriginalPos = fromPos > toPos ? toPos - 1 : toPos;

    let findInsertPredecessor;
    if (insertPredOriginalPos === 0) {
      findInsertPredecessor = new WOQLQuery().eq(insertPredNodeVar, consSubject);
    } else {
      const insertPathPattern = `rdf:rest{${insertPredOriginalPos},${insertPredOriginalPos}}`;
      findInsertPredecessor = new WOQLQuery()
        .path(consSubject, insertPathPattern, insertPredNodeVar);
    }

    insertOps = [
      findInsertPredecessor,
      new WOQLQuery().triple(insertPredNodeVar, 'rdf:rest', insertOldRestVar),
      new WOQLQuery().idgen('list_node', [movedValue, insertPredNodeVar], newNode),
      new WOQLQuery().delete_triple(insertPredNodeVar, 'rdf:rest', insertOldRestVar),
      new WOQLQuery().add_triple(insertPredNodeVar, 'rdf:rest', newNode),
      new WOQLQuery().add_triple(newNode, 'rdf:type', 'rdf:List'),
      new WOQLQuery().add_triple(newNode, 'rdf:first', movedValue),
      new WOQLQuery().add_triple(newNode, 'rdf:rest', insertOldRestVar),
    ];
  }

  return new WOQLQuery().and(...readValueOps, ...dropOps, ...insertOps);
};

/**
 * Create an empty rdf:List (just rdf:nil)
 * @param {string} listVar - Variable to bind to rdf:nil
 * @returns {WOQLQuery} Query that creates empty list
 */
WOQLLibrary.prototype.rdflist_empty = function (listVar) {
  return new WOQLQuery().eq(listVar, 'rdf:nil');
};

/**
 * Check if an rdf:List is empty (equals rdf:nil)
 * @param {string} consSubject - Variable or IRI to check
 * @returns {WOQLQuery} Query that succeeds if list is empty
 */
WOQLLibrary.prototype.rdflist_is_empty = function (consSubject) {
  return new WOQLQuery().eq(consSubject, 'rdf:nil');
};

/**
 * Extract a slice of an rdf:List from start to end index (JavaScript slice semantics)
 * Uses path regex {from,to} to match nodes at positions start to end-1,
 * then group_by to collect the rdf:first values.
 * Path queries return results in hop-count order, preserving list element order.
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {number} start - Start index (inclusive), must be >= 0
 * @param {number} end - End index (exclusive), must be >= 0
 * @param {string} resultVar - Variable to bind the array of sliced values (ordered)
 * @returns {WOQLQuery} Query that extracts list slice values into resultVar
 */
WOQLLibrary.prototype.rdflist_slice = function (consSubject, start, end, resultVar) {
  if (start < 0 || end < 0) {
    throw new Error('rdflist_slice: negative indices not supported');
  }

  if (start >= end) {
    return new WOQLQuery().eq(resultVar, []);
  }

  const nodeVar = 'v:_slice_node';
  const valueVar = 'v:_slice_value';

  let findNodes;
  if (start === 0 && end === 1) {
    findNodes = new WOQLQuery().eq(nodeVar, consSubject);
  } else if (start === 0) {
    findNodes = new WOQLQuery().path(consSubject, `rdf:rest{0,${end - 1}}`, nodeVar);
  } else {
    findNodes = new WOQLQuery().path(consSubject, `rdf:rest{${start},${end - 1}}`, nodeVar);
  }

  return new WOQLQuery().group_by(
    [],
    [valueVar],
    resultVar,
    new WOQLQuery().and(
      findNodes,
      new WOQLQuery().triple(nodeVar, 'rdf:first', valueVar),
    ),
  );
};

/**
 * Reverse an rdf:List in-place by swapping rdf:first values across nodes.
 * Optimized: collects all values once via group_by, then uses slice+member
 * to index into the collected list instead of double path traversal.
 * @param {string} consSubject - Variable or IRI of the list to reverse
 * @returns {WOQLQuery} Query that reverses the list in place
 */
WOQLLibrary.prototype.rdflist_reverse = function (consSubject) {
  const nodeVar = 'v:_rev_node';
  const pathVar = 'v:_rev_path';
  const posVar = 'v:_rev_pos';
  const oldValueVar = 'v:_rev_old_value';
  const lenVar = 'v:_rev_len';
  const allValuesVar = 'v:_rev_all_values';
  const revPosVar = 'v:_rev_rev_pos';
  const revPosPlus1Var = 'v:_rev_rev_pos_plus1';
  const singleValListVar = 'v:_rev_single_val_list';
  const newValueVar = 'v:_rev_new_value';

  return new WOQLQuery().and(
    // Get list length
    this.rdflist_length(consSubject, lenVar),
    // Collect all values into a list (single path traversal)
    new WOQLQuery().group_by(
      [],
      ['v:_rev_collect_value'],
      allValuesVar,
      new WOQLQuery().and(
        new WOQLQuery().path(consSubject, 'rdf:rest*', 'v:_rev_collect_node'),
        new WOQLQuery().triple('v:_rev_collect_node', 'rdf:first', 'v:_rev_collect_value'),
      ),
    ),
    // For each node, get its position and current value
    new WOQLQuery().path(consSubject, 'rdf:rest*', nodeVar, pathVar),
    new WOQLQuery().length(pathVar, posVar),
    new WOQLQuery().triple(nodeVar, 'rdf:first', oldValueVar),
    // Calculate reversed position: revPos = (len - 1) - pos
    new WOQLQuery().eval(
      new WOQLQuery().minus(new WOQLQuery().minus(lenVar, 1), posVar),
      revPosVar,
    ),
    // Get value at reversed position using slice + member
    new WOQLQuery().eval(new WOQLQuery().plus(revPosVar, 1), revPosPlus1Var),
    new WOQLQuery().slice(allValuesVar, singleValListVar, revPosVar, revPosPlus1Var),
    new WOQLQuery().member(newValueVar, singleValListVar),
    // Rewrite: delete old rdf:first, add new rdf:first
    new WOQLQuery().delete_triple(nodeVar, 'rdf:first', oldValueVar),
    new WOQLQuery().add_triple(nodeVar, 'rdf:first', newValueVar),
  );
};

module.exports = WOQLLibrary;
