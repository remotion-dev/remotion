"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.configs = exports.plugin = exports.parser = void 0;
const eslint_plugin_1 = __importDefault(require("@typescript-eslint/eslint-plugin"));
const parserBase = __importStar(require("@typescript-eslint/parser"));
const config_helper_1 = require("./config-helper");
const all_1 = __importDefault(require("./configs/all"));
const base_1 = __importDefault(require("./configs/base"));
const disable_type_checked_1 = __importDefault(require("./configs/disable-type-checked"));
const eslint_recommended_1 = __importDefault(require("./configs/eslint-recommended"));
const recommended_1 = __importDefault(require("./configs/recommended"));
const recommended_type_checked_1 = __importDefault(require("./configs/recommended-type-checked"));
const recommended_type_checked_only_1 = __importDefault(require("./configs/recommended-type-checked-only"));
const strict_1 = __importDefault(require("./configs/strict"));
const strict_type_checked_1 = __importDefault(require("./configs/strict-type-checked"));
const strict_type_checked_only_1 = __importDefault(require("./configs/strict-type-checked-only"));
const stylistic_1 = __importDefault(require("./configs/stylistic"));
const stylistic_type_checked_1 = __importDefault(require("./configs/stylistic-type-checked"));
const stylistic_type_checked_only_1 = __importDefault(require("./configs/stylistic-type-checked-only"));
exports.parser = {
    meta: parserBase.meta,
    parseForESLint: parserBase.parseForESLint,
};
/*
we could build a plugin object here without the `configs` key - but if we do
that then we create a situation in which
```
require('typescript-eslint').plugin !== require('@typescript-eslint/eslint-plugin')
```

This is bad because it means that 3rd party configs would be required to use
`typescript-eslint` or else they would break a user's config if the user either
used `tseslint.configs.recomended` et al or
```
{
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
}
```

This might be something we could consider okay (eg 3rd party flat configs must
use our new package); however legacy configs consumed via `@eslint/eslintrc`
would never be able to satisfy this constraint and thus users would be blocked
from using them.
*/
exports.plugin = eslint_plugin_1.default;
exports.configs = {
    /**
     * Enables each the rules provided as a part of typescript-eslint. Note that many rules are not applicable in all codebases, or are meant to be configured.
     * @see {@link https://typescript-eslint.io/users/configs#all}
     */
    all: (0, all_1.default)(exports.plugin, exports.parser),
    /**
     * A minimal ruleset that sets only the required parser and plugin options needed to run typescript-eslint.
     * We don't recommend using this directly; instead, extend from an earlier recommended rule.
     * @see {@link https://typescript-eslint.io/users/configs#base}
     */
    base: (0, base_1.default)(exports.plugin, exports.parser),
    /**
     * A utility ruleset that will disable type-aware linting and all type-aware rules available in our project.
     * @see {@link https://typescript-eslint.io/users/configs#disable-type-checked}
     */
    disableTypeChecked: (0, disable_type_checked_1.default)(exports.plugin, exports.parser),
    /**
     * This is a compatibility ruleset that:
     * - disables rules from eslint:recommended which are already handled by TypeScript.
     * - enables rules that make sense due to TS's typechecking / transpilation.
     * @see {@link https://typescript-eslint.io/users/configs/#eslint-recommended}
     */
    eslintRecommended: (0, eslint_recommended_1.default)(exports.plugin, exports.parser),
    /**
     * Recommended rules for code correctness that you can drop in without additional configuration.
     * @see {@link https://typescript-eslint.io/users/configs#recommended}
     */
    recommended: (0, recommended_1.default)(exports.plugin, exports.parser),
    /**
     * Contains all of `recommended` along with additional recommended rules that require type information.
     * @see {@link https://typescript-eslint.io/users/configs#recommended-type-checked}
     */
    recommendedTypeChecked: (0, recommended_type_checked_1.default)(exports.plugin, exports.parser),
    /**
     * A version of `recommended` that only contains type-checked rules and disables of any corresponding core ESLint rules.
     * @see {@link https://typescript-eslint.io/users/configs#recommended-type-checked-only}
     */
    recommendedTypeCheckedOnly: (0, recommended_type_checked_only_1.default)(exports.plugin, exports.parser),
    /**
     * Contains all of `recommended`, as well as additional strict rules that can also catch bugs.
     * @see {@link https://typescript-eslint.io/users/configs#strict}
     */
    strict: (0, strict_1.default)(exports.plugin, exports.parser),
    /**
     * Contains all of `recommended`, `recommended-type-checked`, and `strict`, along with additional strict rules that require type information.
     * @see {@link https://typescript-eslint.io/users/configs#strict-type-checked}
     */
    strictTypeChecked: (0, strict_type_checked_1.default)(exports.plugin, exports.parser),
    /**
     * A version of `strict` that only contains type-checked rules and disables of any corresponding core ESLint rules.
     * @see {@link https://typescript-eslint.io/users/configs#strict-type-checked-only}
     */
    strictTypeCheckedOnly: (0, strict_type_checked_only_1.default)(exports.plugin, exports.parser),
    /**
     * Rules considered to be best practice for modern TypeScript codebases, but that do not impact program logic.
     * @see {@link https://typescript-eslint.io/users/configs#stylistic}
     */
    stylistic: (0, stylistic_1.default)(exports.plugin, exports.parser),
    /**
     * Contains all of `stylistic`, along with additional stylistic rules that require type information.
     * @see {@link https://typescript-eslint.io/users/configs#stylistic-type-checked}
     */
    stylisticTypeChecked: (0, stylistic_type_checked_1.default)(exports.plugin, exports.parser),
    /**
     * A version of `stylistic` that only contains type-checked rules and disables of any corresponding core ESLint rules.
     * @see {@link https://typescript-eslint.io/users/configs#stylistic-type-checked-only}
     */
    stylisticTypeCheckedOnly: (0, stylistic_type_checked_only_1.default)(exports.plugin, exports.parser),
};
/*
we do both a default and named exports to allow people to use this package from
both CJS and ESM in very natural ways.

EG it means that all of the following are valid:

```ts
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
);
```
```ts
import { config, parser, plugin } from 'typescript-eslint';

export default config(
  {
    languageOptions: { parser }
    plugins: { ts: plugin },
  }
);
```
```ts
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  ...tseslint.configs.recommended,
);
```
```ts
const { config, parser, plugin } = require('typescript-eslint');

module.exports = config(
  {
    languageOptions: { parser }
    plugins: { ts: plugin },
  }
);
```
*/
exports.default = {
    config: config_helper_1.config,
    configs: exports.configs,
    parser: exports.parser,
    plugin: exports.plugin,
};
var config_helper_2 = require("./config-helper");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return config_helper_2.config; } });
//# sourceMappingURL=index.js.map