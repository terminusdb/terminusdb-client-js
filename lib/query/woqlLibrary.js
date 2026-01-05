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
 * Collect all rdf:List elements into a single array.
 * Works in two modes:
 * - Generator: If listVar is unbound, binds it to the array of all rdf:first values
 * - Matching: If listVar is bound to an array, succeeds only if values match
 * Uses group_by to collect all values in order (path queries return in hop-count order).
 * @param {string} consSubject - Variable or IRI of the list cons cell (rdf:List head)
 * @param {string} listVar - Variable to bind/match the resulting list values array
 * @returns {WOQLQuery} Query that binds list as array to listVar (single binding)
 * @example
 * // Collect all task titles from a document's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_list("v:list_head", "v:all_tasks")
 * );
 * // Result: { bindings: [{ "v:all_tasks": ["Task A", "Task B", "Task C"] }] }
 */
WOQLLibrary.prototype.rdflist_list = function (consSubject, listVar) {
  // Include ALL parameters + internal variables in localize spec
  const [localized, v] = new WOQLQuery().localize({
    consSubject,
    listVar,
    cell: null,
    value: null,
  });
  return localized(
    new WOQLQuery().group_by(
      [],
      [v.value],
      v.listVar,
      new WOQLQuery().and(
        new WOQLQuery().path(v.consSubject, 'rdf:rest*', v.cell),
        new WOQLQuery().triple(v.cell, 'rdf:first', v.value),
      ),
    ),
  );
};

/**
 * Internal: Get first element without localization.
 * Used by other rdflist functions to avoid nested localization.
 * @param {string|Var} consSubject - Variable or IRI of the list cons cell
 * @param {string|Var} valueVar - Variable to bind the first value
 * @returns {WOQLQuery} Query that binds first value to valueVar
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
WOQLLibrary.prototype._rdflist_peek_raw = function (consSubject, valueVar) {
  return new WOQLQuery().and(
    new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().triple(consSubject, 'rdf:first', valueVar),
  );
};

/**
 * Get the first element of an rdf:List (peek operation).
 * Works as generator (binds value) or matcher (checks if first element matches).
 * @param {string} consSubject - Variable or IRI of the list cons cell
 * @param {string} valueVar - Variable to bind the first value
 * @returns {WOQLQuery} Query that binds first value to valueVar
 * @example
 * // Get the first task from a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_peek("v:list_head", "v:first_task")
 * );
 * // Result: { bindings: [{ "v:first_task": "Task A" }] }
 */
WOQLLibrary.prototype.rdflist_peek = function (consSubject, valueVar) {
  const [localized, v] = new WOQLQuery().localize({ consSubject, valueVar });
  // eslint-disable-next-line no-underscore-dangle
  return localized(this._rdflist_peek_raw(v.consSubject, v.valueVar));
};

/**
 * Get the last element of an rdf:List
 * Traverses to the final cons cell (whose rdf:rest is rdf:nil) and gets its rdf:first
 * @param {string} consSubject - Variable or IRI of the list cons cell
 * @param {string} valueVar - Variable to bind the last value
 * @returns {WOQLQuery} Query that binds last value to valueVar
 */
WOQLLibrary.prototype.rdflist_last = function (consSubject, valueVar) {
  // Include ALL parameters + internal variables in localize spec
  const [localized, v] = new WOQLQuery().localize({
    consSubject,
    valueVar,
    last_cell: null,
  });
  return localized(
    new WOQLQuery().and(
      new WOQLQuery().triple(v.consSubject, 'rdf:type', 'rdf:List'),
      new WOQLQuery().path(v.consSubject, 'rdf:rest*', v.last_cell),
      new WOQLQuery().triple(v.last_cell, 'rdf:rest', 'rdf:nil'),
      new WOQLQuery().triple(v.last_cell, 'rdf:first', v.valueVar),
    ),
  );
};

/**
 * Internal: Get element at 0-indexed position without localization.
 * @param {string|Var} consSubject - Variable or IRI of the list cons cell
 * @param {number} index - 0-based index (must be number >= 0)
 * @param {string|Var} valueVar - Variable to bind the value
 * @returns {WOQLQuery} Query that binds value at index to valueVar
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
WOQLLibrary.prototype._rdflist_nth0_raw = function (consSubject, index, valueVar) {
  if (index === 0) {
    // eslint-disable-next-line no-underscore-dangle
    return this._rdflist_peek_raw(consSubject, valueVar);
  }
  const pathPattern = `rdf:rest{${index},${index}}`;
  return new WOQLQuery().and(
    new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().path(consSubject, pathPattern, 'v:_nth_cell'),
    new WOQLQuery().triple('v:_nth_cell', 'rdf:first', valueVar),
  );
};

/**
 * Get element at 0-indexed position in an rdf:List.
 * Works as generator (binds value) or matcher (checks if element at index matches).
 * @param {string} consSubject - Variable or IRI of the list cons cell
 * @param {number|string} index - 0-based index (number or variable)
 * @param {string} valueVar - Variable to bind the value at that index
 * @returns {WOQLQuery} Query that binds value at index to valueVar
 * @example
 * // Get the second task (index 1) from a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_nth0("v:list_head", 1, "v:second_task")
 * );
 * // Result: { bindings: [{ "v:second_task": "Task B" }] }
 */
WOQLLibrary.prototype.rdflist_nth0 = function (consSubject, index, valueVar) {
  if (typeof index === 'number') {
    if (index < 0) {
      throw new Error('rdflist_nth0 requires index >= 0.');
    }
    const [localized, v] = new WOQLQuery().localize({
      consSubject,
      valueVar,
    });
    // eslint-disable-next-line no-underscore-dangle
    return localized(this._rdflist_nth0_raw(v.consSubject, index, v.valueVar));
  }
  // Dynamic index via variable - use path with length matching
  const [localized, v] = new WOQLQuery().localize({
    consSubject, index, valueVar, cell: null, path: null,
  });
  return localized(
    new WOQLQuery().and(
      new WOQLQuery().triple(v.consSubject, 'rdf:type', 'rdf:List'),
      new WOQLQuery().path(v.consSubject, 'rdf:rest*', v.cell, v.path),
      new WOQLQuery().length(v.path, v.index),
      new WOQLQuery().triple(v.cell, 'rdf:first', v.valueVar),
    ),
  );
};

/**
 * Get element at 1-indexed position in an rdf:List.
 * Works as generator (binds value) or matcher (checks if element at index matches).
 * @param {string} consSubject - Variable or IRI of the list cons cell
 * @param {number|string} index - 1-based index (number or variable)
 * @param {string} valueVar - Variable to bind the value at that index
 * @returns {WOQLQuery} Query that binds value at index to valueVar
 * @example
 * // Get the second task (index 2, 1-based) from a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_nth1("v:list_head", 2, "v:second_task")
 * );
 * // Result: { bindings: [{ "v:second_task": "Task B" }] }
 */
WOQLLibrary.prototype.rdflist_nth1 = function (consSubject, index, valueVar) {
  if (typeof index === 'number') {
    if (index < 1) {
      throw new Error('rdflist_nth1 requires index >= 1.');
    }
    const [localized, v] = new WOQLQuery().localize({
      consSubject,
      valueVar,
    });
    // eslint-disable-next-line no-underscore-dangle
    return localized(this._rdflist_nth0_raw(v.consSubject, index - 1, v.valueVar));
  }
  // Dynamic index via variable - not supported with localize, would need server-side arithmetic
  throw new Error('rdflist_nth1 with variable index not yet supported with localize pattern');
};

/**
 * Internal: Check if a value is a member of an rdf:List without localization.
 * Used by other rdflist functions to avoid nested localization.
 * @param {string|Var} value - Variable or value to find in the list
 * @param {string|Var} consSubject - Variable or IRI of the list cons cell
 * @param {string|Var} cellVar - Cell variable (required, must be from VarsUnique)
 * @returns {WOQLQuery} Query that succeeds if value is in the list
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
WOQLLibrary.prototype._rdflist_member_raw = function (value, consSubject, cellVar) {
  return new WOQLQuery().and(
    new WOQLQuery().path(consSubject, 'rdf:rest*', cellVar),
    new WOQLQuery().triple(cellVar, 'rdf:first', value),
  );
};

/**
 * Traverse an rdf:List and yield each element as a separate binding (streaming).
 * Works in two modes:
 * - Generator: If value is unbound, yields one binding per list element
 * - Matcher: If value is bound, succeeds only if value is a member of the list
 * Ideal for large lists and streaming use cases.
 * @param {string} consSubject - Variable or IRI of the list cons cell (rdf:List head)
 * @param {string} value - Variable to bind each value, or value to check membership
 * @returns {WOQLQuery} Query that yields/matches list elements
 * @example
 * // Stream all tasks from a project's task list (one binding per element)
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_member("v:list_head", "v:task")
 * );
 * // Result: { bindings: [{ "v:task": "Task A" }, { "v:task": "Task B" }, ...] }
 */
WOQLLibrary.prototype.rdflist_member = function (consSubject, value) {
  // Include ALL parameters + internal variables in localize spec
  const [localized, v] = new WOQLQuery().localize({
    consSubject,
    value,
    member_cell: null,
  });
  return localized(
    new WOQLQuery().and(
      new WOQLQuery().triple(v.consSubject, 'rdf:type', 'rdf:List'),
      // eslint-disable-next-line no-underscore-dangle
      this._rdflist_member_raw(v.value, v.consSubject, v.member_cell),
    ),
  );
};

/**
 * Internal: Get the length of an rdf:List without localization.
 * Used by other rdflist functions to avoid nested localization.
 * @param {string|Var} consSubject - Variable or IRI of the list cons cell
 * @param {string|Var} lengthVar - Variable to bind the length
 * @param {string|Var} pathVar - Path variable (required, must be from VarsUnique)
 * @returns {WOQLQuery} Query that binds list length to lengthVar
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
WOQLLibrary.prototype._rdflist_length_raw = function (consSubject, lengthVar, pathVar) {
  return new WOQLQuery().and(
    new WOQLQuery().triple(consSubject, 'rdf:type', 'rdf:List'),
    new WOQLQuery().path(consSubject, 'rdf:rest*', 'rdf:nil', pathVar),
    new WOQLQuery().length(pathVar, lengthVar),
  );
};

/**
 * Get the length of an rdf:List.
 * Uses path query to traverse all rest links and count them.
 * Works as generator (binds length) or matcher (checks if length matches).
 * @param {string} consSubject - Variable or IRI of the list cons cell
 * @param {string} lengthVar - Variable to bind the length
 * @returns {WOQLQuery} Query that binds list length to lengthVar
 * @example
 * // Get the number of tasks in a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_length("v:list_head", "v:count")
 * );
 * // Result: { bindings: [{ "v:count": 3 }] }
 */
WOQLLibrary.prototype.rdflist_length = function (consSubject, lengthVar) {
  // Include ALL parameters + internal variables in localize spec
  const [localized, v] = new WOQLQuery().localize({
    consSubject,
    lengthVar,
    length_path: null,
  });
  // eslint-disable-next-line no-underscore-dangle
  return localized(this._rdflist_length_raw(v.consSubject, v.lengthVar, v.length_path));
};

/**
 * Pop the first element from an rdf:List in-place.
 * Removes the first element and promotes the second element to head position.
 * The list head IRI remains unchanged - the second cons cell is removed.
 * @param {string} consSubject - Variable or IRI of the list cons cell
 * @param {string} valueVar - Variable to bind the popped value
 * @returns {WOQLQuery} Query that pops first element and binds it to valueVar
 * @example
 * // Pop the first task from a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_pop("v:list_head", "v:first_task")
 * );
 * // Result: list [A, B, C] becomes [B, C], binds "A" to v:first_task
 */
WOQLLibrary.prototype.rdflist_pop = function (consSubject, valueVar) {
  const [localized, v] = new WOQLQuery().localize({
    consSubject, valueVar, second_cons: null, new_first: null, new_rest: null,
  });
  return localized(
    new WOQLQuery().and(
      new WOQLQuery().triple(v.consSubject, 'rdf:first', v.valueVar),
      new WOQLQuery().triple(v.consSubject, 'rdf:rest', v.second_cons),
      new WOQLQuery().triple(v.second_cons, 'rdf:first', v.new_first),
      new WOQLQuery().triple(v.second_cons, 'rdf:rest', v.new_rest),
      new WOQLQuery().delete_triple(v.second_cons, 'rdf:type', 'rdf:List'),
      new WOQLQuery().delete_triple(v.second_cons, 'rdf:first', v.new_first),
      new WOQLQuery().delete_triple(v.second_cons, 'rdf:rest', v.new_rest),
      new WOQLQuery().delete_triple(v.consSubject, 'rdf:first', v.valueVar),
      new WOQLQuery().delete_triple(v.consSubject, 'rdf:rest', v.second_cons),
      new WOQLQuery().add_triple(v.consSubject, 'rdf:first', v.new_first),
      new WOQLQuery().add_triple(v.consSubject, 'rdf:rest', v.new_rest),
    ),
  );
};

/**
 * Push a new element to the front of an rdf:List in-place.
 * Modifies the existing cons cell: moves old first value to a new cons cell,
 * sets new value as rdf:first, and links to the new cons as rdf:rest.
 * The list head IRI remains unchanged.
 * @param {string|Var} consSubject - Variable or IRI of the list cons cell
 * @param {string|Var} value - Value to push to the front
 * @returns {WOQLQuery} Query that pushes value to front of list in-place
 * @example
 * // Push a new task to the front of a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_push("v:list_head", WOQL.string("New Task"))
 * );
 * // Result: list [A, B, C] becomes [New Task, A, B, C], head IRI unchanged
 */
WOQLLibrary.prototype.rdflist_push = function (consSubject, value) {
  const [localized, v] = new WOQLQuery().localize({
    consSubject, value, old_first: null, old_rest: null, new_cons: null,
  });
  return localized(
    new WOQLQuery().and(
      new WOQLQuery().triple(v.consSubject, 'rdf:first', v.old_first),
      new WOQLQuery().triple(v.consSubject, 'rdf:rest', v.old_rest),
      new WOQLQuery().idgen_random('terminusdb://data/Cons/', v.new_cons),
      new WOQLQuery().add_triple(v.new_cons, 'rdf:type', 'rdf:List'),
      new WOQLQuery().add_triple(v.new_cons, 'rdf:first', v.old_first),
      new WOQLQuery().add_triple(v.new_cons, 'rdf:rest', v.old_rest),
      new WOQLQuery().delete_triple(v.consSubject, 'rdf:first', v.old_first),
      new WOQLQuery().delete_triple(v.consSubject, 'rdf:rest', v.old_rest),
      new WOQLQuery().add_triple(v.consSubject, 'rdf:first', v.value),
      new WOQLQuery().add_triple(v.consSubject, 'rdf:rest', v.new_cons),
    ),
  );
};

/**
 * Append an element to the end of an rdf:List.
 * Traverses to the last cell and adds new cell there.
 * @param {string|Var} consSubject - Variable or IRI of the list head
 * @param {string|Var} value - Value to append
 * @param {string} [newCellVar] - Optional variable to bind the new cell
 * @returns {WOQLQuery} Query that appends value to end of list
 * @example
 * // Append a new task to the end of a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_append("v:list_head", WOQL.string("New Task"))
 * );
 * // Result: appends "New Task" to end of list
 */
WOQLLibrary.prototype.rdflist_append = function (consSubject, value, newCell = 'v:_append_new_cell') {
  const [localized, v] = new WOQLQuery().localize({
    consSubject, value, newCell, last_cell: null,
  });
  return localized(
    new WOQLQuery().and(
      new WOQLQuery().triple(v.consSubject, 'rdf:type', 'rdf:List'),
      new WOQLQuery().path(v.consSubject, 'rdf:rest*', v.last_cell),
      new WOQLQuery().triple(v.last_cell, 'rdf:rest', 'rdf:nil'),
      new WOQLQuery().idgen_random('terminusdb://data/Cons/', v.newCell),
      new WOQLQuery().delete_triple(v.last_cell, 'rdf:rest', 'rdf:nil'),
      new WOQLQuery().add_triple(v.last_cell, 'rdf:rest', v.newCell),
      new WOQLQuery().add_triple(v.newCell, 'rdf:type', 'rdf:List'),
      new WOQLQuery().add_triple(v.newCell, 'rdf:first', v.value),
      new WOQLQuery().add_triple(v.newCell, 'rdf:rest', 'rdf:nil'),
    ),
  );
};

/**
 * Delete all cons cells of an rdf:List and return rdf:nil as the new list value.
 * Since a cons cell cannot become rdf:nil, this deletes all cells and binds
 * rdf:nil to a variable so the caller can update the reference to the list.
 * NOTE: This only removes the list structure. To delete subdocuments
 * referenced by the list, use rdflist_member with delete_document first.
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {string} newListVar - Variable to bind rdf:nil (the empty list)
 * @returns {WOQLQuery} Query that deletes all cons cells and binds rdf:nil
 * @example
 * // Clear a list of literals and update the reference to point to rdf:nil:
 * const clearListQuery = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:old_list"),
 *   WOQL.lib().rdflist_clear("v:old_list", "v:empty_list"),
 *   WOQL.delete_triple("doc:Project/1", "tasks", "v:old_list"),
 *   WOQL.add_triple("doc:Project/1", "tasks", "v:empty_list")
 * );
 *
 * // Full pattern: delete subdocuments, clear list, update reference:
 * const fullClearQuery = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:old_list"),
 *   WOQL.group_by([], "v:subdoc", "v:members",
 *     WOQL.and(
 *       WOQL.lib().rdflist_member("v:old_list", "v:subdoc"),
 *       WOQL.delete_document("v:subdoc")
 *     )
 *   ),
 *   WOQL.lib().rdflist_clear("v:old_list", "v:empty_list"),
 *   WOQL.delete_triple("doc:Project/1", "tasks", "v:old_list"),
 *   WOQL.add_triple("doc:Project/1", "tasks", "v:empty_list")
 * );
 */
WOQLLibrary.prototype.rdflist_clear = function (consSubject, newListVar) {
  const [localized, v] = new WOQLQuery().localize({
    consSubject,
    newListVar,
    cell: null,
    cell_first: null,
    cell_rest: null,
    head_first: null,
    head_rest: null,
  });
  return localized(
    new WOQLQuery().and(
      // Bind the new list value (rdf:nil = empty list)
      new WOQLQuery().equals(v.newListVar, 'rdf:nil'),
      // Delete all triples from tail cons cells (those reachable via rdf:rest+)
      new WOQLQuery().optional(
        new WOQLQuery().and(
          new WOQLQuery().path(v.consSubject, 'rdf:rest+', v.cell),
          new WOQLQuery().triple(v.cell, 'rdf:type', 'rdf:List'),
          new WOQLQuery().triple(v.cell, 'rdf:first', v.cell_first),
          new WOQLQuery().triple(v.cell, 'rdf:rest', v.cell_rest),
          new WOQLQuery().delete_triple(v.cell, 'rdf:type', 'rdf:List'),
          new WOQLQuery().delete_triple(v.cell, 'rdf:first', v.cell_first),
          new WOQLQuery().delete_triple(v.cell, 'rdf:rest', v.cell_rest),
        ),
      ),
      // Delete the head cons cell completely
      new WOQLQuery().triple(v.consSubject, 'rdf:type', 'rdf:List'),
      new WOQLQuery().triple(v.consSubject, 'rdf:first', v.head_first),
      new WOQLQuery().triple(v.consSubject, 'rdf:rest', v.head_rest),
      new WOQLQuery().delete_triple(v.consSubject, 'rdf:type', 'rdf:List'),
      new WOQLQuery().delete_triple(v.consSubject, 'rdf:first', v.head_first),
      new WOQLQuery().delete_triple(v.consSubject, 'rdf:rest', v.head_rest),
    ),
  );
};

/**
 * Insert a value at a specific position in an rdf:List.
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {number} position - Position to insert at (0-indexed)
 * @param {string|Var} value - Value to insert
 * @param {string|Var} [newNodeVar] - Optional variable to bind the new node
 * @returns {WOQLQuery} Query that inserts value at position
 * @example
 * // Insert a task at position 1 in a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_insert("v:list_head", 1, WOQL.string("Inserted Task"))
 * );
 * // Result: [A, Inserted Task, B, C]
 */
WOQLLibrary.prototype.rdflist_insert = function (consSubject, position, value, newNodeVar = 'v:_insert_new_node') {
  if (position < 0) {
    throw new Error('rdflist_insert requires position >= 0.');
  }

  if (position === 0) {
    const [localized, v] = new WOQLQuery().localize({
      consSubject, value, newNodeVar, old_first: null, old_rest: null,
    });
    return localized(
      new WOQLQuery().and(
        new WOQLQuery().triple(v.consSubject, 'rdf:first', v.old_first),
        new WOQLQuery().triple(v.consSubject, 'rdf:rest', v.old_rest),
        new WOQLQuery().idgen('list_node', [v.old_first, v.consSubject], v.newNodeVar),
        new WOQLQuery().add_triple(v.newNodeVar, 'rdf:type', 'rdf:List'),
        new WOQLQuery().add_triple(v.newNodeVar, 'rdf:first', v.old_first),
        new WOQLQuery().add_triple(v.newNodeVar, 'rdf:rest', v.old_rest),
        new WOQLQuery().delete_triple(v.consSubject, 'rdf:first', v.old_first),
        new WOQLQuery().delete_triple(v.consSubject, 'rdf:rest', v.old_rest),
        new WOQLQuery().add_triple(v.consSubject, 'rdf:first', v.value),
        new WOQLQuery().add_triple(v.consSubject, 'rdf:rest', v.newNodeVar),
      ),
    );
  }

  const [localized, v] = new WOQLQuery().localize({
    consSubject, value, newNodeVar, pred_node: null, old_rest: null,
  });
  const restCount = position - 1;
  const pathPattern = restCount === 0 ? '' : `rdf:rest{${restCount},${restCount}}`;

  const findPredecessor = restCount === 0
    ? new WOQLQuery().eq(v.pred_node, v.consSubject)
    : new WOQLQuery().path(v.consSubject, pathPattern, v.pred_node);

  return localized(
    new WOQLQuery().and(
      findPredecessor,
      new WOQLQuery().triple(v.pred_node, 'rdf:rest', v.old_rest),
      new WOQLQuery().idgen('list_node', [v.value, v.pred_node], v.newNodeVar),
      new WOQLQuery().delete_triple(v.pred_node, 'rdf:rest', v.old_rest),
      new WOQLQuery().add_triple(v.pred_node, 'rdf:rest', v.newNodeVar),
      new WOQLQuery().add_triple(v.newNodeVar, 'rdf:type', 'rdf:List'),
      new WOQLQuery().add_triple(v.newNodeVar, 'rdf:first', v.value),
      new WOQLQuery().add_triple(v.newNodeVar, 'rdf:rest', v.old_rest),
    ),
  );
};

/**
 * Drop/remove a single element from an rdf:List at a specific position.
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {number} position - Position of element to remove (0-indexed)
 * @returns {WOQLQuery} Query that removes the element at position
 * @example
 * // Remove the task at position 1 from a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_drop("v:list_head", 1)
 * );
 * // Result: [A, C] (B removed)
 */
WOQLLibrary.prototype.rdflist_drop = function (consSubject, position) {
  if (position < 0) {
    throw new Error('rdflist_drop requires position >= 0.');
  }

  if (position === 0) {
    const [localized, v] = new WOQLQuery().localize({
      consSubject, old_first: null, rest_node: null, next_first: null, next_rest: null,
    });
    return localized(
      new WOQLQuery().and(
        new WOQLQuery().triple(v.consSubject, 'rdf:first', v.old_first),
        new WOQLQuery().triple(v.consSubject, 'rdf:rest', v.rest_node),
        new WOQLQuery().triple(v.rest_node, 'rdf:first', v.next_first),
        new WOQLQuery().triple(v.rest_node, 'rdf:rest', v.next_rest),
        new WOQLQuery().delete_triple(v.rest_node, 'rdf:type', 'rdf:List'),
        new WOQLQuery().delete_triple(v.rest_node, 'rdf:first', v.next_first),
        new WOQLQuery().delete_triple(v.rest_node, 'rdf:rest', v.next_rest),
        new WOQLQuery().delete_triple(v.consSubject, 'rdf:first', v.old_first),
        new WOQLQuery().delete_triple(v.consSubject, 'rdf:rest', v.rest_node),
        new WOQLQuery().add_triple(v.consSubject, 'rdf:first', v.next_first),
        new WOQLQuery().add_triple(v.consSubject, 'rdf:rest', v.next_rest),
      ),
    );
  }

  const [localized, v] = new WOQLQuery().localize({
    consSubject, pred_node: null, drop_node: null, drop_first: null, drop_rest: null,
  });
  const restCount = position - 1;
  const pathPattern = restCount === 0 ? '' : `rdf:rest{${restCount},${restCount}}`;

  const findPredecessor = restCount === 0
    ? new WOQLQuery().eq(v.pred_node, v.consSubject)
    : new WOQLQuery().path(v.consSubject, pathPattern, v.pred_node);

  return localized(
    new WOQLQuery().and(
      findPredecessor,
      new WOQLQuery().triple(v.pred_node, 'rdf:rest', v.drop_node),
      new WOQLQuery().triple(v.drop_node, 'rdf:first', v.drop_first),
      new WOQLQuery().triple(v.drop_node, 'rdf:rest', v.drop_rest),
      new WOQLQuery().delete_triple(v.drop_node, 'rdf:type', 'rdf:List'),
      new WOQLQuery().delete_triple(v.drop_node, 'rdf:first', v.drop_first),
      new WOQLQuery().delete_triple(v.drop_node, 'rdf:rest', v.drop_rest),
      new WOQLQuery().delete_triple(v.pred_node, 'rdf:rest', v.drop_node),
      new WOQLQuery().add_triple(v.pred_node, 'rdf:rest', v.drop_rest),
    ),
  );
};

/**
 * Swap elements at two positions in an rdf:List by exchanging their rdf:first values.
 * This is a simplified implementation that swaps values in-place without moving cons cells.
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {number} posA - First position (0-indexed)
 * @param {number} posB - Second position (0-indexed)
 * @returns {WOQLQuery} Query that swaps elements at the two positions
 * @example
 * // Swap the first and third tasks in a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_swap("v:list_head", 0, 2)
 * );
 * // Result: [C, B, A] (A and C swapped)
 */
WOQLLibrary.prototype.rdflist_swap = function (consSubject, posA, posB) {
  if (posA < 0 || posB < 0) {
    throw new Error('rdflist_swap requires positions >= 0.');
  }

  if (posA === posB) {
    const [localized, v] = new WOQLQuery().localize({ consSubject });
    return localized(new WOQLQuery().triple(v.consSubject, 'rdf:type', 'rdf:List'));
  }

  const [localized, v] = new WOQLQuery().localize({
    consSubject, node_a: null, node_b: null, value_a: null, value_b: null,
  });

  // Find node at posA
  const findNodeA = posA === 0
    ? new WOQLQuery().eq(v.node_a, v.consSubject)
    : new WOQLQuery().path(v.consSubject, `rdf:rest{${posA},${posA}}`, v.node_a);

  // Find node at posB
  const findNodeB = posB === 0
    ? new WOQLQuery().eq(v.node_b, v.consSubject)
    : new WOQLQuery().path(v.consSubject, `rdf:rest{${posB},${posB}}`, v.node_b);

  return localized(
    new WOQLQuery().and(
      findNodeA,
      findNodeB,
      new WOQLQuery().triple(v.node_a, 'rdf:first', v.value_a),
      new WOQLQuery().triple(v.node_b, 'rdf:first', v.value_b),
      new WOQLQuery().delete_triple(v.node_a, 'rdf:first', v.value_a),
      new WOQLQuery().delete_triple(v.node_b, 'rdf:first', v.value_b),
      new WOQLQuery().add_triple(v.node_a, 'rdf:first', v.value_b),
      new WOQLQuery().add_triple(v.node_b, 'rdf:first', v.value_a),
    ),
  );
};

/**
 * Create an empty rdf:List (just rdf:nil).
 * @param {string} listVar - Variable to bind to rdf:nil
 * @returns {WOQLQuery} Query that creates empty list
 * @example
 * // Create an empty list reference
 * const query = WOQL.lib().rdflist_empty("v:empty_list");
 * // Result: { bindings: [{ "v:empty_list": "rdf:nil" }] }
 */
WOQLLibrary.prototype.rdflist_empty = function (listVar) {
  return new WOQLQuery().eq(listVar, 'rdf:nil');
};

/**
 * Check if an rdf:List is empty (equals rdf:nil).
 * @param {string} consSubject - Variable or IRI to check
 * @returns {WOQLQuery} Query that succeeds if list is empty
 * @example
 * // Check if a project's task list is empty
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_is_empty("v:list_head")
 * );
 * // Succeeds only if tasks list is rdf:nil
 */
WOQLLibrary.prototype.rdflist_is_empty = function (consSubject) {
  return new WOQLQuery().eq(consSubject, 'rdf:nil');
};

/**
 * Extract a slice of an rdf:List (range of elements) as an array.
 * Works in two modes:
 * - Generator: If resultVar is unbound, binds it to the array of sliced values
 * - Matcher: If resultVar is bound to an array, succeeds only if values match
 * Path queries return results in hop-count order, preserving list element order.
 * @param {string} consSubject - Variable or IRI of the list head
 * @param {number|string} start - Start index (inclusive) or variable
 * @param {number|string} end - End index (exclusive) or variable
 * @param {string} resultVar - Variable to bind/match the array of sliced values
 * @returns {WOQLQuery} Query that extracts/matches list slice values
 * @example
 * // Get the first two tasks from a project's task list
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_slice("v:list_head", 0, 2, "v:first_two")
 * );
 * // Result: { bindings: [{ "v:first_two": ["Task A", "Task B"] }] }
 */
WOQLLibrary.prototype.rdflist_slice = function (consSubject, start, end, resultVar) {
  if (start < 0 || end < 0) {
    throw new Error('rdflist_slice: negative indices not supported');
  }

  if (start >= end) {
    const [localized, v] = new WOQLQuery().localize({
      consSubject,
      resultVar,
    });
    return localized(new WOQLQuery().eq(v.resultVar, []));
  }

  const [localized, v] = new WOQLQuery().localize({
    consSubject, resultVar, node: null, value: null,
  });

  let findNodes;
  if (start === 0 && end === 1) {
    findNodes = new WOQLQuery().eq(v.node, v.consSubject);
  } else if (start === 0) {
    findNodes = new WOQLQuery().path(v.consSubject, `rdf:rest{0,${end - 1}}`, v.node);
  } else {
    findNodes = new WOQLQuery().path(v.consSubject, `rdf:rest{${start},${end - 1}}`, v.node);
  }

  return localized(
    new WOQLQuery().group_by(
      [],
      [v.value],
      v.resultVar,
      new WOQLQuery().and(
        findNodes,
        new WOQLQuery().triple(v.node, 'rdf:first', v.value),
      ),
    ),
  );
};

/**
 * Reverse an rdf:List in-place by swapping rdf:first values across nodes.
 * Optimized: collects all values once via group_by, then uses slice+member
 * to index into the collected list instead of double path traversal.
 * @param {string} consSubject - Variable or IRI of the list to reverse
 * @returns {WOQLQuery} Query that reverses the list in place
 * @example
 * // Reverse a project's task list in place
 * const query = WOQL.and(
 *   WOQL.triple("doc:Project/1", "tasks", "v:list_head"),
 *   WOQL.lib().rdflist_reverse("v:list_head")
 * );
 * // Result: [A, B, C] becomes [C, B, A]
 */
WOQLLibrary.prototype.rdflist_reverse = function (consSubject) {
  const [localized, v] = new WOQLQuery().localize({
    consSubject,
    node: null,
    path: null,
    old_value: null,
    new_value: null,
    pos: null,
    len: null,
    len_path: null,
    all_values: null,
    rev_pos: null,
    rev_pos_plus1: null,
  });

  // Generate unique local variable name for slice result (using timestamp for uniqueness)
  const sliceResultVar = `v:_slice_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return localized(
    new WOQLQuery().and(
      // Get list length
      // eslint-disable-next-line no-underscore-dangle
      this._rdflist_length_raw(v.consSubject, v.len, v.len_path),
      // Collect all values into a list (single path traversal)
      new WOQLQuery().group_by(
        [],
        '_rev_collect_value',
        v.all_values,
        new WOQLQuery().and(
          new WOQLQuery().path(v.consSubject, 'rdf:rest*', 'v:_rev_collect_node'),
          new WOQLQuery().triple('v:_rev_collect_node', 'rdf:first', 'v:_rev_collect_value'),
        ),
      ),
      // For each node, get its position and current value
      new WOQLQuery().path(v.consSubject, 'rdf:rest*', v.node, v.path),
      new WOQLQuery().length(v.path, v.pos),
      new WOQLQuery().triple(v.node, 'rdf:first', v.old_value),
      // Calculate reversed position: revPos = (len - 1) - pos
      new WOQLQuery().eval(
        new WOQLQuery().minus(new WOQLQuery().minus(v.len, 1), v.pos),
        v.rev_pos,
      ),
      // Get value at reversed position: slice to single-element array, then extract with member
      new WOQLQuery().eval(new WOQLQuery().plus(v.rev_pos, 1), v.rev_pos_plus1),
      new WOQLQuery().slice(v.all_values, sliceResultVar, v.rev_pos, v.rev_pos_plus1),
      // Use member() on WOQL array (slice returns JavaScript array, not RDF list)
      new WOQLQuery().member(v.new_value, sliceResultVar),
      // Rewrite: delete old rdf:first, add new rdf:first
      new WOQLQuery().delete_triple(v.node, 'rdf:first', v.old_value),
      new WOQLQuery().add_triple(v.node, 'rdf:first', v.new_value),
    ),
  );
};

module.exports = WOQLLibrary;
