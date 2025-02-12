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

export interface PossibleErrors extends Linter.RulesRecord {
    /**
     * Rule to enforce `for` loop update clause moving the counter in the right direction.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 4.0.0-beta.0
     * @see https://eslint.org/docs/latest/rules/for-direction
     */
    "for-direction": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce `return` statements in getters.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 4.2.0
     * @see https://eslint.org/docs/latest/rules/getter-return
     */
    "getter-return": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowImplicit: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow using an async function as a Promise executor.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 5.3.0
     * @see https://eslint.org/docs/latest/rules/no-async-promise-executor
     */
    "no-async-promise-executor": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `await` inside of loops.
     *
     * @since 3.12.0
     * @see https://eslint.org/docs/latest/rules/no-await-in-loop
     */
    "no-await-in-loop": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow comparing against `-0`.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 3.17.0
     * @see https://eslint.org/docs/latest/rules/no-compare-neg-zero
     */
    "no-compare-neg-zero": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow assignment operators in conditional expressions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-cond-assign
     */
    "no-cond-assign": Linter.RuleEntry<["except-parens" | "always"]>;

    /**
     * Rule to disallow the use of `console`.
     *
     * @since 0.0.2
     * @see https://eslint.org/docs/latest/rules/no-console
     */
    "no-console": Linter.RuleEntry<
        [
            Partial<{
                allow: Array<keyof Console>;
            }>,
        ]
    >;

    /**
     * Rule to disallow expressions where the operation doesn't affect the value.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 8.14.0
     * @see https://eslint.org/docs/latest/rules/no-constant-binary-expression
     */
    "no-constant-binary-expression": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow constant expressions in conditions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.4.1
     * @see https://eslint.org/docs/latest/rules/no-constant-condition
     */
    "no-constant-condition": Linter.RuleEntry<
        [
            {
                /**
                 * @default true
                 */
                checkLoops: boolean;
            },
        ]
    >;

    /**
     * Rule to disallow returning value from constructor.
     *
     * @since 6.7.0
     * @see https://eslint.org/docs/latest/rules/no-constructor-return
     */
    "no-constructor-return": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow control characters in regular expressions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.1.0
     * @see https://eslint.org/docs/latest/rules/no-control-regex
     */
    "no-control-regex": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow the use of `debugger`.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.2
     * @see https://eslint.org/docs/latest/rules/no-debugger
     */
    "no-debugger": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow duplicate arguments in `function` definitions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.16.0
     * @see https://eslint.org/docs/latest/rules/no-dupe-args
     */
    "no-dupe-args": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow duplicate conditions in if-else-if chains.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 6.7.0
     * @see https://eslint.org/docs/latest/rules/no-dupe-else-if
     */
    "no-dupe-else-if": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow duplicate keys in object literals.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-dupe-keys
     */
    "no-dupe-keys": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow duplicate case labels.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.17.0
     * @see https://eslint.org/docs/latest/rules/no-duplicate-case
     */
    "no-duplicate-case": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow empty block statements.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.2
     * @see https://eslint.org/docs/latest/rules/no-empty
     */
    "no-empty": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowEmptyCatch: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow empty character classes in regular expressions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.22.0
     * @see https://eslint.org/docs/latest/rules/no-empty-character-class
     */
    "no-empty-character-class": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow reassigning exceptions in `catch` clauses.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-ex-assign
     */
    "no-ex-assign": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unnecessary boolean casts.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.4.0
     * @see https://eslint.org/docs/latest/rules/no-extra-boolean-cast
     */
    "no-extra-boolean-cast": Linter.RuleEntry<
        [
            | Partial<{
                  /**
                   * @since 9.3.0
                   * @default false
                   */
                  enforceForInnerExpressions: boolean;
                  /**
                   * @deprecated
                   */
                  enforceForLogicalOperands: never;
              }>
            | Partial<{
                  /**
                   * @deprecated
                   * @since 7.0.0-alpha.2
                   * @default false
                   */
                  enforceForLogicalOperands: boolean;
                  enforceForInnerExpressions: never;
              }>,
        ]
    >;

    /**
     * Rule to disallow unnecessary parentheses.
     *
     * @since 0.1.4
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-extra-parens) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-extra-parens
     */
    "no-extra-parens":
        | Linter.RuleEntry<
            [
                "all",
                Partial<{
                    /**
                     * @default true,
                     */
                    conditionalAssign: boolean;
                    /**
                     * @default true
                     */
                    returnAssign: boolean;
                    /**
                     * @default true
                     */
                    nestedBinaryExpressions: boolean;
                    /**
                     * @default 'none'
                     */
                    ignoreJSX: "none" | "all" | "multi-line" | "single-line";
                    /**
                     * @default true
                     */
                    enforceForArrowConditionals: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<["functions"]>;

    /**
     * Rule to disallow unnecessary semicolons.
     *
     * @since 0.0.9
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-extra-semi) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-extra-semi
     */
    "no-extra-semi": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow reassigning `function` declarations.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-func-assign
     */
    "no-func-assign": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow variable or `function` declarations in nested blocks.
     *
     * @since 0.6.0
     * @see https://eslint.org/docs/latest/rules/no-inner-declarations
     */
    "no-inner-declarations": Linter.RuleEntry<["functions" | "both"]>;

    /**
     * Rule to disallow invalid regular expression strings in `RegExp` constructors.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.1.4
     * @see https://eslint.org/docs/latest/rules/no-invalid-regexp
     */
    "no-invalid-regexp": Linter.RuleEntry<
        [
            Partial<{
                allowConstructorFlags: string[];
            }>,
        ]
    >;

    /**
     * Rule to disallow irregular whitespace.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.9.0
     * @see https://eslint.org/docs/latest/rules/no-irregular-whitespace
     */
    "no-irregular-whitespace": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                skipStrings: boolean;
                /**
                 * @default false
                 */
                skipComments: boolean;
                /**
                 * @default false
                 */
                skipRegExps: boolean;
                /**
                 * @default false
                 */
                skipTemplates: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow literal numbers that lose precision.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 7.1.0
     * @see https://eslint.org/docs/latest/rules/no-loss-of-precision
     */
    "no-loss-of-precision": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow characters which are made with multiple code points in character class syntax.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 5.3.0
     * @see https://eslint.org/docs/latest/rules/no-misleading-character-class
     */
    "no-misleading-character-class": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @since 9.3.0
                 * @default false
                 */
                allowEscape: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow calling global object properties as functions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-obj-calls
     */
    "no-obj-calls": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow returning values from Promise executor functions.
     *
     * @since 7.3.0
     * @see https://eslint.org/docs/latest/rules/no-promise-executor-return
     */
    "no-promise-executor-return": Linter.RuleEntry<[
        {
            /**
             * @default false
             */
            allowVoid?: boolean;
        },
    ]>;

    /**
     * Rule to disallow calling some `Object.prototype` methods directly on objects.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 2.11.0
     * @see https://eslint.org/docs/latest/rules/no-prototype-builtins
     */
    "no-prototype-builtins": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow multiple spaces in regular expressions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.4.0
     * @see https://eslint.org/docs/latest/rules/no-regex-spaces
     */
    "no-regex-spaces": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow returning values from setters.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 6.7.0
     * @see https://eslint.org/docs/latest/rules/no-setter-return
     */
    "no-setter-return": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow sparse arrays.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.4.0
     * @see https://eslint.org/docs/latest/rules/no-sparse-arrays
     */
    "no-sparse-arrays": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow template literal placeholder syntax in regular strings.
     *
     * @since 3.3.0
     * @see https://eslint.org/docs/latest/rules/no-template-curly-in-string
     */
    "no-template-curly-in-string": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow confusing multiline expressions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.24.0
     * @see https://eslint.org/docs/latest/rules/no-unexpected-multiline
     */
    "no-unexpected-multiline": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unreachable code after `return`, `throw`, `continue`, and `break` statements.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.6
     * @see https://eslint.org/docs/latest/rules/no-unreachable
     */
    "no-unreachable": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow loops with a body that allows only one iteration.
     *
     * @since 7.3.0
     * @see https://eslint.org/docs/latest/rules/no-unreachable-loop
     */
    "no-unreachable-loop": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default []
                 */
                ignore: "WhileStatement" | "DoWhileStatement" | "ForStatement" | "ForInStatement" | "ForOfStatement";
            }>,
        ]
    >;

    /**
     * Rule to disallow control flow statements in `finally` blocks.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 2.9.0
     * @see https://eslint.org/docs/latest/rules/no-unsafe-finally
     */
    "no-unsafe-finally": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow negating the left operand of relational operators.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 3.3.0
     * @see https://eslint.org/docs/latest/rules/no-unsafe-negation
     */
    "no-unsafe-negation": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @since 6.6.0
                 * @default false
                 */
                enforceForOrderingRelations: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow use of optional chaining in contexts where the `undefined` value is not allowed.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 7.15.0
     * @see https://eslint.org/docs/latest/rules/no-unsafe-optional-chaining
     */
    "no-unsafe-optional-chaining": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                disallowArithmeticOperators: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow unused private class members.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 8.1.0
     * @see https://eslint.org/docs/latest/rules/no-unused-private-class-members
     */
    "no-unused-private-class-members": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow assignments that can lead to race conditions due to usage of `await` or `yield`.
     *
     * @since 5.3.0
     * @see https://eslint.org/docs/latest/rules/require-atomic-updates
     */
    "require-atomic-updates": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @since 8.3.0
                 * @default false
                 */
                allowProperties: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require calls to `isNaN()` when checking for `NaN`.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.6
     * @see https://eslint.org/docs/latest/rules/use-isnan
     */
    "use-isnan": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                enforceForSwitchCase: boolean;
                /**
                 * @default true
                 */
                enforceForIndexOf: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce comparing `typeof` expressions against valid strings.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.5.0
     * @see https://eslint.org/docs/latest/rules/valid-typeof
     */
    "valid-typeof": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                requireStringLiterals: boolean;
            }>,
        ]
    >;
}
