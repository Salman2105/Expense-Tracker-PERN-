/**
 * Test-only CommonJS stand-in for the `uuid` package.
 *
 * `uuid@14` ships as ESM-only with no CommonJS build. Node 22+'s native
 * `require(esm)` interop lets the real application load it fine under
 * `node server.js`, but Jest's CJS module system cannot. This shim
 * re-implements the one function the app actually uses (`validate`),
 * copied verbatim from `uuid`'s own regex, so tests exercise the same
 * validation behavior without depending on Jest ESM support.
 *
 * Not used by any application code — wired in only via jest.config.js
 * moduleNameMapper.
 */
const UUID_REGEX =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

const validate = (uuid) =>
  typeof uuid === "string" && UUID_REGEX.test(uuid);

module.exports = { validate };
