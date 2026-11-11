# [Feature] TerminusDB 12.1 client: viewer removal, native fetch, zero runtime dependencies, full coverage pass

## Why

Three long-standing debts come due together for 12.1.0. `lib/viewer` — ~6,000 lines of chart/table/graph rendering config, roughly a third of `lib/` — is application-layer code that never belonged in a database client and was deprecated in 12.0.9. The HTTP layer still ran on axios plus `form-data`, `buffer` and `pako`: four runtime dependencies doing jobs the platform now does natively in Node 20+ and every modern browser. And test coverage had gaps precisely where the code was least exercised — the WOQL builder families, the pretty-printer, the access-control driver and the error surface.

## What changed

**HTTP layer.** `lib/dispatchRequest.js` is rewritten on native `fetch`. Bodies serialize once per case, responses parse text-then-JSON, non-2xx responses convert through `apiErrorFormatted` with the same `{status, data}` shape axios produced, and `TerminusDB-Data-Version` is read via `Headers.get`. Multipart uploads use native `FormData`/`Blob` — one code path for Node and browser, which also repairs the browser upload path that silently depended on a `Buffer` polyfill webpack no longer provides. Opt-in request gzip now uses `CompressionStream`. `lib/axiosInstance.js` and the public `axiosInstance` export are gone.

**Dependencies.** `axios`, `form-data`, `buffer`, `pako` and `undici` are all removed — `dependencies` is now empty. The 2020-era bypass that silently trusted any self-signed certificate on `https://127.0.0.1` went with them: TerminusDB dev servers run plain HTTP on `:6363`, no known setup serves self-signed TLS on loopback, and the bypass quietly weakened verification for every Node consumer. Anyone who needs it sets `NODE_TLS_REJECT_UNAUTHORIZED=0` explicitly.

**Viewer removal.** `lib/viewer` is deleted outright (it carried deprecation warnings since 12.0.9), along with its tests, the `woqlRule.spec.js` battery and the webpack configuration that existed only for it. Shipped package dropped from ~587 kB to ~349 kB packed; the UMD browser bundle went from ~282 kB to ~207 kB before the pako removal trimmed it further.

**Package and release metadata.** `files` whitelist is `["lib", "dist", "RELEASE_NOTES.md"]` — `Contributing.md` no longer ships in the tarball. Philippe Höij is now the npm `author` (philippe.hoij@dfrnt.com); Kevin Feeney moves to `contributors`. The 12.0.9 entry was moved out of a misplaced `docs/RELEASE_NOTES.md` into the root `RELEASE_NOTES.md`, which now lists 12.1.0 correctly. Publishing runs on GitHub Actions via npm Trusted Publishing/OIDC with provenance — no npm token — on `release: published`, with setup documented in `docs/npm_publish_setup.md`.

**Coverage.** Two unit-test waves land here. The first (98 tests) covers the `rdflist_*` rdf:List API (taking `woqlLibrary.js` to 100%), the temporal/interval builders, the string/set/paging/idgen families and the `*_slice`/`*_next`/`*_previous`/`get`/`put`/`as` methods. The second (94 tests) pushes branches: a missing-argument validation sweep across 42 WOQL builders, `findLastProperty` recursion through `and`/`or`/`query` and property triples, the prefix-management and optional-argument dispatch calls in `woqlClient`, the `ConnectionConfig` URL builders across system-db/`_meta`/`_commits`/ref/param branches, and the `DateHelper`/`TypeHelper` edge cases in `utils`. A third wave (158 tests) takes the two core files near the ceiling: every `WOQLQuery` builder is exercised on a non-empty cursor (the `wrapCursorWithAnd` path), with valid and partial argument shapes, `as()` tuples/`Var`/type forms, `get`/`put` resource variants, chained `select`/`from`/`into`, the base-class stubs, and `dispatchRequest`'s stream-buffering, unicode-auth and string-`DELETE` paths. `woqlQuery.js` reaches 99.0% statements and `dispatchRequest.js` 99.1% — what remains is an istanbul artifact (the `function`-keyword marker on `prototype.X = function` never increments although the bodies run) plus one defensive guard in `formatAuthHeader` that its callers make unreachable. Overall: 97.4% statements, 92.7% branches, 98.7% functions. The `cover` script gate moves from a symbolic `--lines 30` to `--statements 97 --branches 92 --functions 98 --lines 97` so the level cannot silently regress. Four new integration suites do the same for the jest-measured surface: `woql_printer.test.ts` pretty-prints real generated queries through every decompile path, `access_control.test.ts` exercises the `AccessControl` driver endpoints and missing-argument guards against the live server with `afterAll` cleanup, `error_paths.test.ts` triggers real server errors and covers the caller-less `ErrorMessage` exports, and `utils_builder_surface.test.ts` covers the `Utils` helpers, `TypeHelper`, the `DateHelper` xsd family and the `WOQLQuery` builder surface. Stray `console.log` output removed from `woql_prefix` and `woql_rdflist_operations`.

## Bugs found by the new tests

- `woqlPrinter.decompileRegexPattern` only recognised `@type` names starting with `Path` — an inverse path (`InversePathPredicate`) fell through to `str.replace()` on a non-string and crashed. Now recognises path-pattern objects safely.
- `undici` could not consume the node `form-data` stream — it stringified it to `[object FormData]` — and chunked multipart hangs SWI-Prolog. Native `FormData` sidesteps both.
- `sendOrgInvite`/`sendAccessRequest` create `admin/invites` and `admin/access_requests` pseudo-orgs on the server as a side effect; the suite now deletes them so re-runs stay clean.
- `DateHelper.extractXsdTimezone` computed the `±HH:MM` offset but discarded it — offsets always returned `false`. Now returns the suffix when the colon at `len-3` confirms an offset, so plain dates (`-` at `len-6`) no longer false-match; two tests that encoded the bug were corrected.
- Documented lenient parse contract: `DateHelper.parseDate` takes bare component values for `xsd:gDay`/`gMonthDay` (`'15'`, `'11-15'`) and re-serializes to canonical xsd (`'---15'`, `'--11-15'`); `xsd:gMonth` alone requires the `--` prefix.
- `remote()` checked `typeof opts` where no `opts` parameter exists — `cursor.options` could never be set. Now checks `formatObj`, restoring the documented options behavior.
- `substr()` dereferenced `subString.length` before the parameter check, so `substr('joe')` crashed instead of returning a `parameterError`. Guarded; the error path is now reachable.
- `plus`/`minus`/`times`/`div`/`divide` spread `args.map(this.arop)` — `arop` ran unbound and crashed on `this.cleanArithmeticValue` with more than two arguments. Bound via arrow so `plus(1, 2, 3)` and friends work as documented.
- Documented quirks now asserted: `get` pairs variables as indicator/value columns while `put` indexes each; `Utils.shorten` returns the fragment, not a prefixed name; `convertTimestampToXsd` takes unix seconds, not an ISO string.

## Verification

- `npm run cover`: 1605 mocha tests passing — 97.4% statements, 92.7% branches, 98.7% functions — with the nyc gate now enforced at 97/92/98/97
- `npm run test:integration`: 32 suites, 491 tests passing — every instrumented file above 80% statements (lowest: `woqlDoc.js` at 80.8%, `woqlPrinter.js` from 20.6% to 85.7%, `utils.js` from 50.6% to 90.2%, `accessControl.js` from 62.4% to 92.8%, `woqlBuilder.js` from 75.6% to 97.4%)
- `npm run lint:check`, `npm run build`, `npm run validate-types:strict`: clean
- Live multipart CSV queries verified end-to-end from Chromium, Firefox and WebKit against a real TerminusDB server

## For consumers

The public WOQL API is unchanged. Breaking surface: `axiosInstance` is no longer exported, anything imported from `lib/viewer` is gone, and Node now enforces normal TLS verification on loopback HTTPS. Install size drops to zero runtime dependencies.
