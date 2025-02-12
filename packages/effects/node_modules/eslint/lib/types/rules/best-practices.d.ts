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

export interface BestPractices extends Linter.RulesRecord {
    /**
     * Rule to enforce getter and setter pairs in objects and classes.
     *
     * @since 0.22.0
     * @see https://eslint.org/docs/latest/rules/accessor-pairs
     */
    "accessor-pairs": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                setWithoutGet: boolean;
                /**
                 * @default false
                 */
                getWithoutSet: boolean;
                /**
                 * @default true
                 */
                enforceForClassMembers: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce `return` statements in callbacks of array methods.
     *
     * @since 2.0.0-alpha-1
     * @see https://eslint.org/docs/latest/rules/array-callback-return
     */
    "array-callback-return": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowImplicit: boolean;
                /**
                 * @default false
                 */
                checkForEach: boolean;
                /**
                 * @default false
                 */
                allowVoid: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce the use of variables within the scope they are defined.
     *
     * @since 0.1.0
     * @see https://eslint.org/docs/latest/rules/block-scoped-var
     */
    "block-scoped-var": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce that class methods utilize `this`.
     *
     * @since 3.4.0
     * @see https://eslint.org/docs/latest/rules/class-methods-use-this
     */
    "class-methods-use-this": Linter.RuleEntry<
        [
            Partial<{
                exceptMethods: string[];
            }>,
        ]
    >;

    /**
     * Rule to enforce a maximum cyclomatic complexity allowed in a program.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/complexity
     */
    complexity: Linter.RuleEntry<
        [
            | Partial<{
                /**
                 * @default 20
                 */
                max: number;
                /**
                 * @deprecated
                 * @default 20
                 */
                maximum: number;
                /**
                 * @default "classic"
                 * @since 9.12.0
                 */
                variant: "classic" | "modified";
            }>
            | number,
        ]
    >;

    /**
     * Rule to require `return` statements to either always or never specify values.
     *
     * @since 0.4.0
     * @see https://eslint.org/docs/latest/rules/consistent-return
     */
    "consistent-return": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                treatUndefinedAsUnspecified: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent brace style for all control statements.
     *
     * @since 0.0.2
     * @see https://eslint.org/docs/latest/rules/curly
     */
    curly: Linter.RuleEntry<["all" | "multi" | "multi-line" | "multi-or-nest" | "consistent"]>;

    /**
     * Rule to require `default` cases in `switch` statements.
     *
     * @since 0.6.0
     * @see https://eslint.org/docs/latest/rules/default-case
     */
    "default-case": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default '^no default$'
                 */
                commentPattern: string;
            }>,
        ]
    >;

    /**
     * Rule to enforce `default` clauses in `switch` statements to be last.
     *
     * @since 7.0.0-alpha.0
     * @see https://eslint.org/docs/latest/rules/default-case-last
     */
    "default-case-last": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce default parameters to be last.
     *
     * @since 6.4.0
     * @see https://eslint.org/docs/latest/rules/default-param-last
     */
    "default-param-last": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce consistent newlines before and after dots.
     *
     * @since 0.21.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/dot-location) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/dot-location
     */
    "dot-location": Linter.RuleEntry<["object" | "property"]>;

    /**
     * Rule to enforce dot notation whenever possible.
     *
     * @since 0.0.7
     * @see https://eslint.org/docs/latest/rules/dot-notation
     */
    "dot-notation": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                allowKeywords: boolean;
                allowPattern: string;
            }>,
        ]
    >;

    /**
     * Rule to require the use of `===` and `!==`.
     *
     * @since 0.0.2
     * @see https://eslint.org/docs/latest/rules/eqeqeq
     */
    eqeqeq:
        | Linter.RuleEntry<
            [
                "always",
                Partial<{
                    /**
                     * @default 'always'
                     */
                    null: "always" | "never" | "ignore";
                }>,
            ]
        >
        | Linter.RuleEntry<["smart" | "allow-null"]>;

    /**
     * Rule to require grouped accessor pairs in object literals and classes.
     *
     * @since 6.7.0
     * @see https://eslint.org/docs/latest/rules/grouped-accessor-pairs
     */
    "grouped-accessor-pairs": Linter.RuleEntry<["anyOrder" | "getBeforeSet" | "setBeforeGet"]>;

    /**
     * Rule to require `for-in` loops to include an `if` statement.
     *
     * @since 0.0.6
     * @see https://eslint.org/docs/latest/rules/guard-for-in
     */
    "guard-for-in": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce a maximum number of classes per file.
     *
     * @since 5.0.0-alpha.3
     * @see https://eslint.org/docs/latest/rules/max-classes-per-file
     */
    "max-classes-per-file": Linter.RuleEntry<[number]>;

    /**
     * Rule to disallow the use of `alert`, `confirm`, and `prompt`.
     *
     * @since 0.0.5
     * @see https://eslint.org/docs/latest/rules/no-alert
     */
    "no-alert": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow the use of `arguments.caller` or `arguments.callee`.
     *
     * @since 0.0.6
     * @see https://eslint.org/docs/latest/rules/no-caller
     */
    "no-caller": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow lexical declarations in case clauses.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 1.9.0
     * @see https://eslint.org/docs/latest/rules/no-case-declarations
     */
    "no-case-declarations": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow equal signs explicitly at the beginning of regular expressions.
     *
     * @since 0.1.0
     * @see https://eslint.org/docs/latest/rules/no-div-regex
     */
    "no-div-regex": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `else` blocks after `return` statements in `if` statements.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-else-return
     */
    "no-else-return": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                allowElseIf: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow empty functions.
     *
     * @since 2.0.0
     * @see https://eslint.org/docs/latest/rules/no-empty-function
     */
    "no-empty-function": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default []
                 */
                allow: Array<
                    | "functions"
                    | "arrowFunctions"
                    | "generatorFunctions"
                    | "methods"
                    | "generatorMethods"
                    | "getters"
                    | "setters"
                    | "constructors"
                    | "asyncFunctions"
                    | "asyncMethods"
                >;
            }>,
        ]
    >;

    /**
     * Rule to disallow empty destructuring patterns.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 1.7.0
     * @see https://eslint.org/docs/latest/rules/no-empty-pattern
     */
    "no-empty-pattern": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow empty static blocks.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 8.27.0
     * @see https://eslint.org/docs/latest/rules/no-empty-static-block
     */
    "no-empty-static-block": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `null` comparisons without type-checking operators.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-eq-null
     */
    "no-eq-null": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow the use of `eval()`.
     *
     * @since 0.0.2
     * @see https://eslint.org/docs/latest/rules/no-eval
     */
    "no-eval": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowIndirect: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow extending native types.
     *
     * @since 0.1.4
     * @see https://eslint.org/docs/latest/rules/no-extend-native
     */
    "no-extend-native": Linter.RuleEntry<
        [
            Partial<{
                exceptions: string[];
            }>,
        ]
    >;

    /**
     * Rule to disallow unnecessary calls to `.bind()`.
     *
     * @since 0.8.0
     * @see https://eslint.org/docs/latest/rules/no-extra-bind
     */
    "no-extra-bind": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unnecessary labels.
     *
     * @since 2.0.0-rc.0
     * @see https://eslint.org/docs/latest/rules/no-extra-label
     */
    "no-extra-label": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow fallthrough of `case` statements.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.7
     * @see https://eslint.org/docs/latest/rules/no-fallthrough
     */
    "no-fallthrough": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default 'falls?\s?through'
                 */
                commentPattern: string;
                /**
                 * @default false
                 */
                allowEmptyCase: boolean;
                /**
                 * @default false
                 */
                reportUnusedFallthroughComment: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow leading or trailing decimal points in numeric literals.
     *
     * @since 0.0.6
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-floating-decimal) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-floating-decimal
     */
    "no-floating-decimal": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow assignments to native objects or read-only global variables.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 3.3.0
     * @see https://eslint.org/docs/latest/rules/no-global-assign
     */
    "no-global-assign": Linter.RuleEntry<
        [
            Partial<{
                exceptions: string[];
            }>,
        ]
    >;

    /**
     * Rule to disallow shorthand type conversions.
     *
     * @since 1.0.0-rc-2
     * @see https://eslint.org/docs/latest/rules/no-implicit-coercion
     */
    "no-implicit-coercion": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                boolean: boolean;
                /**
                 * @default true
                 */
                number: boolean;
                /**
                 * @default true
                 */
                string: boolean;
                /**
                 * @default false
                 */
                disallowTemplateShorthand: boolean;
                /**
                 * @default []
                 */
                allow: Array<"~" | "!!" | "+" | "- -" | "-" | "*">;
            }>,
        ]
    >;

    /**
     * Rule to disallow declarations in the global scope.
     *
     * @since 2.0.0-alpha-1
     * @see https://eslint.org/docs/latest/rules/no-implicit-globals
     */
    "no-implicit-globals": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow the use of `eval()`-like methods.
     *
     * @since 0.0.7
     * @see https://eslint.org/docs/latest/rules/no-implied-eval
     */
    "no-implied-eval": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow assigning to imported bindings.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 6.4.0
     * @see https://eslint.org/docs/latest/rules/no-import-assign
     */
    "no-import-assign": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow use of `this` in contexts where the value of `this` is `undefined`.
     *
     * @since 1.0.0-rc-2
     * @see https://eslint.org/docs/latest/rules/no-invalid-this
     */
    "no-invalid-this": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                capIsConstructor: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow the use of the `__iterator__` property.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-iterator
     */
    "no-iterator": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow labeled statements.
     *
     * @since 0.4.0
     * @see https://eslint.org/docs/latest/rules/no-labels
     */
    "no-labels": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowLoop: boolean;
                /**
                 * @default false
                 */
                allowSwitch: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow unnecessary nested blocks.
     *
     * @since 0.4.0
     * @see https://eslint.org/docs/latest/rules/no-lone-blocks
     */
    "no-lone-blocks": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow function declarations that contain unsafe references inside loop statements.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-loop-func
     */
    "no-loop-func": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow magic numbers.
     *
     * @since 1.7.0
     * @see https://eslint.org/docs/latest/rules/no-magic-numbers
     */
    "no-magic-numbers": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default []
                 */
                ignore: number[];
                /**
                 * @default false
                 */
                ignoreArrayIndexes: boolean;
                /**
                 * @default false
                 */
                enforceConst: boolean;
                /**
                 * @default false
                 */
                detectObjects: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow multiple spaces.
     *
     * @since 0.9.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-multi-spaces) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-multi-spaces
     */
    "no-multi-spaces": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                ignoreEOLComments: boolean;
                /**
                 * @default { Property: true }
                 */
                exceptions: Record<string, boolean>;
            }>,
        ]
    >;

    /**
     * Rule to disallow multiline strings.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-multi-str
     */
    "no-multi-str": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `new` operators outside of assignments or comparisons.
     *
     * @since 0.0.7
     * @see https://eslint.org/docs/latest/rules/no-new
     */
    "no-new": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `new` operators with the `Function` object.
     *
     * @since 0.0.7
     * @see https://eslint.org/docs/latest/rules/no-new-func
     */
    "no-new-func": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `new` operators with the `String`, `Number`, and `Boolean` objects.
     *
     * @since 0.0.6
     * @see https://eslint.org/docs/latest/rules/no-new-wrappers
     */
    "no-new-wrappers": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `\8` and `\9` escape sequences in string literals.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 7.14.0
     * @see https://eslint.org/docs/latest/rules/no-nonoctal-decimal-escape
     */
    "no-nonoctal-decimal-escape": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow octal literals.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.6
     * @see https://eslint.org/docs/latest/rules/no-octal
     */
    "no-octal": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow octal escape sequences in string literals.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-octal-escape
     */
    "no-octal-escape": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow reassigning function parameters.
     *
     * @since 0.18.0
     * @see https://eslint.org/docs/latest/rules/no-param-reassign
     */
    "no-param-reassign": Linter.RuleEntry<
        [
            | {
                  props?: false;
              }
            | ({
                  props: true;
              } & Partial<{
                  /**
                   * @default []
                   */
                  ignorePropertyModificationsFor: string[];
                  /**
                   * @since 6.6.0
                   * @default []
                   */
                  ignorePropertyModificationsForRegex: string[];
              }>),
        ]
    >;

    /**
     * Rule to disallow the use of the `__proto__` property.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-proto
     */
    "no-proto": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow variable redeclaration.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-redeclare
     */
    "no-redeclare": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                builtinGlobals: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow certain properties on certain objects.
     *
     * @since 3.5.0
     * @see https://eslint.org/docs/latest/rules/no-restricted-properties
     */
    "no-restricted-properties": Linter.RuleEntry<
        [
            ...Array<
                | {
                    object: string;
                    property?: string | undefined;
                    message?: string | undefined;
                }
                | {
                    property: string;
                    message?: string | undefined;
                }
            >,
        ]
    >;

    /**
     * Rule to disallow assignment operators in `return` statements.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-return-assign
     */
    "no-return-assign": Linter.RuleEntry<["except-parens" | "always"]>;

    /**
     * Rule to disallow unnecessary `return await`.
     *
     * @since 3.10.0
     * @deprecated
     * @see https://eslint.org/docs/latest/rules/no-return-await
     */
    "no-return-await": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `javascript:` URLs.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-script-url
     */
    "no-script-url": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow assignments where both sides are exactly the same.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 2.0.0-rc.0
     * @see https://eslint.org/docs/latest/rules/no-self-assign
     */
    "no-self-assign": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow comparisons where both sides are exactly the same.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-self-compare
     */
    "no-self-compare": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow comma operators.
     *
     * @since 0.5.1
     * @see https://eslint.org/docs/latest/rules/no-sequences
     */
    "no-sequences": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @since 7.23.0
                 * @default true
                 */
                allowInParentheses: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow throwing literals as exceptions.
     *
     * @since 0.15.0
     * @see https://eslint.org/docs/latest/rules/no-throw-literal
     */
    "no-throw-literal": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unmodified loop conditions.
     *
     * @since 2.0.0-alpha-2
     * @see https://eslint.org/docs/latest/rules/no-unmodified-loop-condition
     */
    "no-unmodified-loop-condition": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unused expressions.
     *
     * @since 0.1.0
     * @see https://eslint.org/docs/latest/rules/no-unused-expressions
     */
    "no-unused-expressions": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowShortCircuit: boolean;
                /**
                 * @default false
                 */
                allowTernary: boolean;
                /**
                 * @default false
                 */
                allowTaggedTemplates: boolean;
                /**
                 * @since 7.20.0
                 * @default false
                 */
                enforceForJSX: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow unused labels.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 2.0.0-rc.0
     * @see https://eslint.org/docs/latest/rules/no-unused-labels
     */
    "no-unused-labels": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow variable assignments when the value is not used.
     *
     * @since 9.0.0-alpha.1
     * @see https://eslint.org/docs/latest/rules/no-useless-assignment
     */
    "no-useless-assignment": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow useless backreferences in regular expressions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 7.0.0-alpha.0
     * @see https://eslint.org/docs/latest/rules/no-useless-backreference
     */
    "no-useless-backreference": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unnecessary calls to `.call()` and `.apply()`.
     *
     * @since 1.0.0-rc-1
     * @see https://eslint.org/docs/latest/rules/no-useless-call
     */
    "no-useless-call": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unnecessary `catch` clauses.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 5.11.0
     * @see https://eslint.org/docs/latest/rules/no-useless-catch
     */
    "no-useless-catch": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unnecessary concatenation of literals or template literals.
     *
     * @since 1.3.0
     * @see https://eslint.org/docs/latest/rules/no-useless-concat
     */
    "no-useless-concat": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unnecessary escape characters.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 2.5.0
     * @see https://eslint.org/docs/latest/rules/no-useless-escape
     */
    "no-useless-escape": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow redundant return statements.
     *
     * @since 3.9.0
     * @see https://eslint.org/docs/latest/rules/no-useless-return
     */
    "no-useless-return": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `void` operators.
     *
     * @since 0.8.0
     * @see https://eslint.org/docs/latest/rules/no-void
     */
    "no-void": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowAsStatement: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow specified warning terms in comments.
     *
     * @since 0.4.4
     * @see https://eslint.org/docs/latest/rules/no-warning-comments
     */
    "no-warning-comments": Linter.RuleEntry<
        [
            {
                /**
                 * @default ["todo", "fixme", "xxx"]
                 */
                terms: string[];
                /**
                 * @default 'start'
                 */
                location: "start" | "anywhere";
            },
        ]
    >;

    /**
     * Rule to disallow `with` statements.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.2
     * @see https://eslint.org/docs/latest/rules/no-with
     */
    "no-with": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce using named capture group in regular expression.
     *
     * @since 5.15.0
     * @see https://eslint.org/docs/latest/rules/prefer-named-capture-group
     */
    "prefer-named-capture-group": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow use of `Object.prototype.hasOwnProperty.call()` and prefer use of `Object.hasOwn()`.
     *
     * @since 8.5.0
     * @see https://eslint.org/docs/latest/rules/prefer-object-has-own
     */
    "prefer-object-has-own": Linter.RuleEntry<[]>;

    /**
     * Rule to require using Error objects as Promise rejection reasons.
     *
     * @since 3.14.0
     * @see https://eslint.org/docs/latest/rules/prefer-promise-reject-errors
     */
    "prefer-promise-reject-errors": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowEmptyReject: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow use of the `RegExp` constructor in favor of regular expression literals.
     *
     * @since 6.4.0
     * @see https://eslint.org/docs/latest/rules/prefer-regex-literals
     */
    "prefer-regex-literals": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                disallowRedundantWrapping: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce the consistent use of the radix argument when using `parseInt()`.
     *
     * @since 0.0.7
     * @see https://eslint.org/docs/latest/rules/radix
     */
    radix: Linter.RuleEntry<["always" | "as-needed"]>;

    /**
     * Rule to disallow async functions which have no `await` expression.
     *
     * @since 3.11.0
     * @see https://eslint.org/docs/latest/rules/require-await
     */
    "require-await": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce the use of `u` or `v` flag on regular expressions.
     *
     * @since 5.3.0
     * @see https://eslint.org/docs/latest/rules/require-unicode-regexp
     */
    "require-unicode-regexp": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                requireFlag: "u" | "v";
            }>,
        ]
    >;

    /**
     * Rule to require `var` declarations be placed at the top of their containing scope.
     *
     * @since 0.8.0
     * @see https://eslint.org/docs/latest/rules/vars-on-top
     */
    "vars-on-top": Linter.RuleEntry<[]>;

    /**
     * Rule to require parentheses around immediate `function` invocations.
     *
     * @since 0.0.9
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/wrap-iife) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/wrap-iife
     */
    "wrap-iife": Linter.RuleEntry<
        [
            "outside" | "inside" | "any",
            Partial<{
                /**
                 * @default false
                 */
                functionPrototypeMethods: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require or disallow "Yoda" conditions.
     *
     * @since 0.7.1
     * @see https://eslint.org/docs/latest/rules/yoda
     */
    yoda:
        | Linter.RuleEntry<
            [
                "never",
                Partial<{
                    exceptRange: boolean;
                    onlyEquality: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<["always"]>;
}
