/**
 * @fileoverview Shared flags for ESLint.
 */

"use strict";

/**
 * The set of flags that change ESLint behavior with a description.
 * @type {Map<string, string>}
 */
const activeFlags = new Map([
    ["test_only", "Used only for testing."],
    ["unstable_config_lookup_from_file", "Look up `eslint.config.js` from the file being linted."]
]);

/**
 * The set of flags that used to be active but no longer have an effect.
 * @type {Map<string, string>}
 */
const inactiveFlags = new Map([
    ["test_only_old", "Used only for testing."],
    ["unstable_ts_config", "This flag is no longer required to enable TypeScript configuration files."]
]);

module.exports = {
    activeFlags,
    inactiveFlags
};
