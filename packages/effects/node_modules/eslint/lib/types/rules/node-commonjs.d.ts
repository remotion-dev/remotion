/**
 * @fileoverview This file contains the rule types for ESLint. It was initially extracted
 * from the `@types/eslint` package.
 */

/*
 * MIT License
 * Copyright (c) Microsoft Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE
 */

import { Linter } from "../index";

export interface NodeJSAndCommonJS extends Linter.RulesRecord {
    /**
     * Rule to require `return` statements after callbacks.
     *
     * @since 1.0.0-rc-1
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/callback-return
     */
    "callback-return": Linter.RuleEntry<[string[]]>;

    /**
     * Rule to require `require()` calls to be placed at top-level module scope.
     *
     * @since 1.4.0
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/global-require
     */
    "global-require": Linter.RuleEntry<[]>;

    /**
     * Rule to require error handling in callbacks.
     *
     * @since 0.4.5
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/handle-callback-err
     */
    "handle-callback-err": Linter.RuleEntry<[string]>;

    /**
     * Rule to disallow use of the `Buffer()` constructor.
     *
     * @since 4.0.0-alpha.0
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/no-buffer-constructor
     */
    "no-buffer-constructor": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `require` calls to be mixed with regular variable declarations.
     *
     * @since 0.0.9
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/no-mixed-requires
     */
    "no-mixed-requires": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                grouping: boolean;
                /**
                 * @default false
                 */
                allowCall: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow `new` operators with calls to `require`.
     *
     * @since 0.6.0
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/no-new-require
     */
    "no-new-require": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow string concatenation with `__dirname` and `__filename`.
     *
     * @since 0.4.0
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/no-path-concat
     */
    "no-path-concat": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow the use of `process.env`.
     *
     * @since 0.9.0
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/no-process-env
     */
    "no-process-env": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow the use of `process.exit()`.
     *
     * @since 0.4.0
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/no-process-exit
     */
    "no-process-exit": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow specified modules when loaded by `require`.
     *
     * @since 0.6.0
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/no-restricted-modules
     */
    "no-restricted-modules": Linter.RuleEntry<
        [
            ...Array<
                | string
                | {
                    name: string;
                    message?: string | undefined;
                }
                | Partial<{
                    paths: Array<
                        | string
                        | {
                            name: string;
                            message?: string | undefined;
                        }
                    >;
                    patterns: string[];
                }>
            >,
        ]
    >;

    /**
     * Rule to disallow synchronous methods.
     *
     * @since 0.0.9
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/no-sync
     */
    "no-sync": Linter.RuleEntry<
        [
            {
                /**
                 * @default false
                 */
                allowAtRootLevel: boolean;
            },
        ]
    >;
}
