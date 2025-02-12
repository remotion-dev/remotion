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

export interface Deprecated extends Linter.RulesRecord {

    /**
     * Rule to enforce line breaks between arguments of a function call.
     *
     * @since 6.2.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/function-call-argument-newline) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/function-call-argument-newline
     */
    "function-call-argument-newline": Linter.RuleEntry<
        [
            /**
             * @default "always"
             */
            "always" | "never" | "consistent"
        ]
    >;

    /**
     * Rule to enforce consistent indentation.
     *
     * @since 4.0.0-alpha.0
     * @deprecated since 4.0.0, use [`indent`](https://eslint.org/docs/rules/indent) instead.
     * @see https://eslint.org/docs/latest/rules/indent-legacy
     */
    "indent-legacy": Linter.RuleEntry<
        [
            number | "tab",
            Partial<{
                /**
                 * @default 0
                 */
                SwitchCase: number;
                /**
                 * @default 1
                 */
                VariableDeclarator:
                    | Partial<{
                        /**
                         * @default 1
                         */
                        var: number | "first";
                        /**
                         * @default 1
                         */
                        let: number | "first";
                        /**
                         * @default 1
                         */
                        const: number | "first";
                    }>
                    | number
                    | "first";
                /**
                 * @default 1
                 */
                outerIIFEBody: number;
                /**
                 * @default 1
                 */
                MemberExpression: number | "off";
                /**
                 * @default { parameters: 1, body: 1 }
                 */
                FunctionDeclaration: Partial<{
                    /**
                     * @default 1
                     */
                    parameters: number | "first" | "off";
                    /**
                     * @default 1
                     */
                    body: number;
                }>;
                /**
                 * @default { parameters: 1, body: 1 }
                 */
                FunctionExpression: Partial<{
                    /**
                     * @default 1
                     */
                    parameters: number | "first" | "off";
                    /**
                     * @default 1
                     */
                    body: number;
                }>;
                /**
                 * @default { arguments: 1 }
                 */
                CallExpression: Partial<{
                    /**
                     * @default 1
                     */
                    arguments: number | "first" | "off";
                }>;
                /**
                 * @default 1
                 */
                ArrayExpression: number | "first" | "off";
                /**
                 * @default 1
                 */
                ObjectExpression: number | "first" | "off";
                /**
                 * @default 1
                 */
                ImportDeclaration: number | "first" | "off";
                /**
                 * @default false
                 */
                flatTernaryExpressions: boolean;
                ignoredNodes: string[];
                /**
                 * @default false
                 */
                ignoreComments: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require or disallow newlines around directives.
     *
     * @since 3.5.0
     * @deprecated since 4.0.0, use [`padding-line-between-statements`](https://eslint.org/docs/rules/padding-line-between-statements) instead.
     * @see https://eslint.org/docs/latest/rules/lines-around-directive
     */
    "lines-around-directive": Linter.RuleEntry<["always" | "never"]>;

    /**
     * Rule to require or disallow an empty line after variable declarations.
     *
     * @since 0.18.0
     * @deprecated since 4.0.0, use [`padding-line-between-statements`](https://eslint.org/docs/rules/padding-line-between-statements) instead.
     * @see https://eslint.org/docs/latest/rules/newline-after-var
     */
    "newline-after-var": Linter.RuleEntry<["always" | "never"]>;

    /**
     * Rule to require an empty line before `return` statements.
     *
     * @since 2.3.0
     * @deprecated since 4.0.0, use [`padding-line-between-statements`](https://eslint.org/docs/rules/padding-line-between-statements) instead.
     * @see https://eslint.org/docs/latest/rules/newline-before-return
     */
    "newline-before-return": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `catch` clause parameters from shadowing variables in the outer scope.
     *
     * @since 0.0.9
     * @deprecated since 5.1.0, use [`no-shadow`](https://eslint.org/docs/rules/no-shadow) instead.
     * @see https://eslint.org/docs/latest/rules/no-catch-shadow
     */
    "no-catch-shadow": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow assignments to native objects or read-only global variables.
     *
     * @since 0.0.9
     * @deprecated since 3.3.0, use [`no-global-assign`](https://eslint.org/docs/rules/no-global-assign) instead.
     * @see https://eslint.org/docs/latest/rules/no-native-reassign
     */
    "no-native-reassign": Linter.RuleEntry<
        [
            Partial<{
                exceptions: string[];
            }>,
        ]
    >;

    /**
     * Rule to disallow negating the left operand in `in` expressions.
     *
     * @since 0.1.2
     * @deprecated since 3.3.0, use [`no-unsafe-negation`](https://eslint.org/docs/rules/no-unsafe-negation) instead.
     * @see https://eslint.org/docs/latest/rules/no-negated-in-lhs
     */
    "no-negated-in-lhs": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `Object` constructors.
     *
     * @since 0.0.9
     * @deprecated since 8.50.0, use [`no-object-constructor`](https://eslint.org/docs/rules/no-object-constructor) instead.
     * @see https://eslint.org/docs/latest/rules/no-new-object
     */
    "no-new-object": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `new` operators with the `Symbol` object.
     *
     * @since 2.0.0-beta.1
     * @deprecated since 8.27.0, use [`no-new-native-nonconstructor`](https://eslint.org/docs/rules/no-new-native-nonconstructor) instead.
     * @see https://eslint.org/docs/latest/rules/no-new-symbol
     */
    "no-new-symbol": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow spacing between function identifiers and their applications (deprecated).
     *
     * @since 0.1.2
     * @deprecated since 3.3.0, use [`func-call-spacing`](https://eslint.org/docs/rules/func-call-spacing) instead.
     * @see https://eslint.org/docs/latest/rules/no-spaced-func
     */
    "no-spaced-func": Linter.RuleEntry<[]>;

    /**
     * Rule to require `Reflect` methods where applicable.
     *
     * @since 1.0.0-rc-2
     * @deprecated since 3.9.0
     * @see https://eslint.org/docs/latest/rules/prefer-reflect
     */
    "prefer-reflect": Linter.RuleEntry<
        [
            Partial<{
                exceptions: string[];
            }>,
        ]
    >;
}
