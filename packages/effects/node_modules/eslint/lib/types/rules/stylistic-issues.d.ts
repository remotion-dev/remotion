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

export interface StylisticIssues extends Linter.RulesRecord {
    /**
     * Rule to enforce linebreaks after opening and before closing array brackets.
     *
     * @since 4.0.0-alpha.1
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/array-bracket-newline) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/array-bracket-newline
     */
    "array-bracket-newline": Linter.RuleEntry<
        [
            | "always"
            | "never"
            | "consistent"
            | Partial<{
                /**
                 * @default true
                 */
                multiline: boolean;
                /**
                 * @default null
                 */
                minItems: number | null;
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent spacing inside array brackets.
     *
     * @since 0.24.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/array-bracket-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/array-bracket-spacing
     */
    "array-bracket-spacing":
        | Linter.RuleEntry<
            [
                "never",
                Partial<{
                    /**
                     * @default false
                     */
                    singleValue: boolean;
                    /**
                     * @default false
                     */
                    objectsInArrays: boolean;
                    /**
                     * @default false
                     */
                    arraysInArrays: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<
            [
                "always",
                Partial<{
                    /**
                     * @default true
                     */
                    singleValue: boolean;
                    /**
                     * @default true
                     */
                    objectsInArrays: boolean;
                    /**
                     * @default true
                     */
                    arraysInArrays: boolean;
                }>,
            ]
        >;

    /**
     * Rule to enforce line breaks after each array element.
     *
     * @since 4.0.0-rc.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/array-element-newline) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/array-element-newline
     */
    "array-element-newline": Linter.RuleEntry<
        [
            | "always"
            | "never"
            | "consistent"
            | Partial<{
                /**
                 * @default true
                 */
                multiline: boolean;
                /**
                 * @default null
                 */
                minItems: number | null;
            }>,
        ]
    >;

    /**
     * Rule to disallow or enforce spaces inside of blocks after opening block and before closing block.
     *
     * @since 1.2.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/block-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/block-spacing
     */
    "block-spacing": Linter.RuleEntry<["always" | "never"]>;

    /**
     * Rule to enforce consistent brace style for blocks.
     *
     * @since 0.0.7
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/brace-style) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/brace-style
     */
    "brace-style": Linter.RuleEntry<
        [
            "1tbs" | "stroustrup" | "allman",
            Partial<{
                /**
                 * @default false
                 */
                allowSingleLine: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce camelcase naming convention.
     *
     * @since 0.0.2
     * @see https://eslint.org/docs/latest/rules/camelcase
     */
    camelcase: Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default 'always'
                 */
                properties: "always" | "never";
                /**
                 * @default false
                 */
                ignoreDestructuring: boolean;
                /**
                 * @since 6.7.0
                 * @default false
                 */
                ignoreImports: boolean;
                /**
                 * @since 7.4.0
                 * @default false
                 */
                ignoreGlobals: boolean;
                /**
                 * @remarks
                 * Also accept for regular expression patterns
                 */
                allow: string[];
            }>,
        ]
    >;

    /**
     * Rule to enforce or disallow capitalization of the first letter of a comment.
     *
     * @since 3.11.0
     * @see https://eslint.org/docs/latest/rules/capitalized-comments
     */
    "capitalized-comments": Linter.RuleEntry<
        [
            "always" | "never",
            Partial<{
                ignorePattern: string;
                /**
                 * @default false
                 */
                ignoreInlineComments: boolean;
                /**
                 * @default false
                 */
                ignoreConsecutiveComments: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require or disallow trailing commas.
     *
     * @since 0.16.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/comma-dangle) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/comma-dangle
     */
    "comma-dangle": Linter.RuleEntry<
        [
            | "never"
            | "always"
            | "always-multiline"
            | "only-multiline"
            | Partial<{
                /**
                 * @default 'never'
                 */
                arrays: "never" | "always" | "always-multiline" | "only-multiline";
                /**
                 * @default 'never'
                 */
                objects: "never" | "always" | "always-multiline" | "only-multiline";
                /**
                 * @default 'never'
                 */
                imports: "never" | "always" | "always-multiline" | "only-multiline";
                /**
                 * @default 'never'
                 */
                exports: "never" | "always" | "always-multiline" | "only-multiline";
                /**
                 * @default 'never'
                 */
                functions: "never" | "always" | "always-multiline" | "only-multiline";
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent spacing before and after commas.
     *
     * @since 0.9.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/comma-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/comma-spacing
     */
    "comma-spacing": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                before: boolean;
                /**
                 * @default true
                 */
                after: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent comma style.
     *
     * @since 0.9.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/comma-style) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/comma-style
     */
    "comma-style": Linter.RuleEntry<
        [
            "last" | "first",
            Partial<{
                exceptions: Record<string, boolean>;
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent spacing inside computed property brackets.
     *
     * @since 0.23.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/computed-property-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/computed-property-spacing
     */
    "computed-property-spacing": Linter.RuleEntry<["never" | "always"]>;

    /**
     * Rule to enforce consistent naming when capturing the current execution context.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/consistent-this
     */
    "consistent-this": Linter.RuleEntry<[...string[]]>;

    /**
     * Rule to require or disallow newline at the end of files.
     *
     * @since 0.7.1
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/eol-last) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/eol-last
     */
    "eol-last": Linter.RuleEntry<
        [
            "always" | "never", // | 'unix' | 'windows'
        ]
    >;

    /**
     * Rule to require or disallow spacing between function identifiers and their invocations.
     *
     * @since 3.3.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/function-call-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/func-call-spacing
     */
    "func-call-spacing": Linter.RuleEntry<["never" | "always"]>;

    /**
     * Rule to require function names to match the name of the variable or property to which they are assigned.
     *
     * @since 3.8.0
     * @see https://eslint.org/docs/latest/rules/func-name-matching
     */
    "func-name-matching":
        | Linter.RuleEntry<
            [
                "always" | "never",
                Partial<{
                    /**
                     * @default false
                     */
                    considerPropertyDescriptor: boolean;
                    /**
                     * @default false
                     */
                    includeCommonJSModuleExports: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<
            [
                Partial<{
                    /**
                     * @default false
                     */
                    considerPropertyDescriptor: boolean;
                    /**
                     * @default false
                     */
                    includeCommonJSModuleExports: boolean;
                }>,
            ]
        >;

    /**
     * Rule to require or disallow named `function` expressions.
     *
     * @since 0.4.0
     * @see https://eslint.org/docs/latest/rules/func-names
     */
    "func-names": Linter.RuleEntry<
        [
            "always" | "as-needed" | "never",
            Partial<{
                generators: "always" | "as-needed" | "never";
            }>,
        ]
    >;

    /**
     * Rule to enforce the consistent use of either `function` declarations or expressions assigned to variables.
     *
     * @since 0.2.0
     * @see https://eslint.org/docs/latest/rules/func-style
     */
    "func-style": Linter.RuleEntry<
        [
            "expression" | "declaration",
            Partial<{
                /**
                 * @default false
                 */
                allowArrowFunctions: boolean;
                overrides: {
                    namedExports: "declaration" | "expression" | "ignore";
                }
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent line breaks inside function parentheses.
     *
     * @since 4.6.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/function-paren-newline) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/function-paren-newline
     */
    "function-paren-newline": Linter.RuleEntry<
        [
            | "always"
            | "never"
            | "multiline"
            | "multiline-arguments"
            | "consistent"
            | Partial<{
                minItems: number;
            }>,
        ]
    >;

    /**
     * Rule to disallow specified identifiers.
     *
     * @since 2.0.0-beta.2
     * @deprecated please use [`id-denylist`](https://eslint.org/docs/latest/rules/id-denylist).
     * @see https://eslint.org/docs/latest/rules/id-blacklist
     */
    "id-blacklist": Linter.RuleEntry<[...string[]]>;

    /**
     * Rule to disallow specified identifiers.
     *
     * @since 7.4.0
     * @see https://eslint.org/docs/latest/rules/id-denylist
     */
    "id-denylist": Linter.RuleEntry<string[]>;

    /**
     * Rule to enforce minimum and maximum identifier lengths.
     *
     * @since 1.0.0
     * @see https://eslint.org/docs/latest/rules/id-length
     */
    "id-length": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default 2
                 */
                min: number;
                /**
                 * @default Infinity
                 */
                max: number;
                /**
                 * @default 'always'
                 */
                properties: "always" | "never";
                exceptions: string[];
            }>,
        ]
    >;

    /**
     * Rule to require identifiers to match a specified regular expression.
     *
     * @since 1.0.0
     * @see https://eslint.org/docs/latest/rules/id-match
     */
    "id-match": Linter.RuleEntry<
        [
            string,
            Partial<{
                /**
                 * @default false
                 */
                properties: boolean;
                /**
                 * @default false
                 */
                onlyDeclarations: boolean;
                /**
                 * @default false
                 */
                ignoreDestructuring: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce the location of arrow function bodies.
     *
     * @since 4.12.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/implicit-arrow-linebreak) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/implicit-arrow-linebreak
     */
    "implicit-arrow-linebreak": Linter.RuleEntry<["beside" | "below"]>;

    /**
     * Rule to enforce consistent indentation.
     *
     * @since 0.14.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/indent) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/indent
     */
    indent: Linter.RuleEntry<
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
     * Rule to enforce the consistent use of either double or single quotes in JSX attributes.
     *
     * @since 1.4.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/jsx-quotes) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/jsx-quotes
     */
    "jsx-quotes": Linter.RuleEntry<["prefer-double" | "prefer-single"]>;

    /**
     * Rule to enforce consistent spacing between keys and values in object literal properties.
     *
     * @since 0.9.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/key-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/key-spacing
     */
    "key-spacing": Linter.RuleEntry<
        [
            | Partial<
                | {
                    /**
                     * @default false
                     */
                    beforeColon: boolean;
                    /**
                     * @default true
                     */
                    afterColon: boolean;
                    /**
                     * @default 'strict'
                     */
                    mode: "strict" | "minimum";
                    align:
                        | Partial<{
                            /**
                             * @default false
                             */
                            beforeColon: boolean;
                            /**
                             * @default true
                             */
                            afterColon: boolean;
                            /**
                             * @default 'colon'
                             */
                            on: "value" | "colon";
                            /**
                             * @default 'strict'
                             */
                            mode: "strict" | "minimum";
                        }>
                        | "value"
                        | "colon";
                }
                | {
                    singleLine?:
                        | Partial<{
                            /**
                             * @default false
                             */
                            beforeColon: boolean;
                            /**
                             * @default true
                             */
                            afterColon: boolean;
                            /**
                             * @default 'strict'
                             */
                            mode: "strict" | "minimum";
                        }>
                        | undefined;
                    multiLine?:
                        | Partial<{
                            /**
                             * @default false
                             */
                            beforeColon: boolean;
                            /**
                             * @default true
                             */
                            afterColon: boolean;
                            /**
                             * @default 'strict'
                             */
                            mode: "strict" | "minimum";
                            align:
                                | Partial<{
                                    /**
                                     * @default false
                                     */
                                    beforeColon: boolean;
                                    /**
                                     * @default true
                                     */
                                    afterColon: boolean;
                                    /**
                                     * @default 'colon'
                                     */
                                    on: "value" | "colon";
                                    /**
                                     * @default 'strict'
                                     */
                                    mode: "strict" | "minimum";
                                }>
                                | "value"
                                | "colon";
                        }>
                        | undefined;
                }
            >
            | {
                align: Partial<{
                    /**
                     * @default false
                     */
                    beforeColon: boolean;
                    /**
                     * @default true
                     */
                    afterColon: boolean;
                    /**
                     * @default 'colon'
                     */
                    on: "value" | "colon";
                    /**
                     * @default 'strict'
                     */
                    mode: "strict" | "minimum";
                }>;
                singleLine?:
                    | Partial<{
                        /**
                         * @default false
                         */
                        beforeColon: boolean;
                        /**
                         * @default true
                         */
                        afterColon: boolean;
                        /**
                         * @default 'strict'
                         */
                        mode: "strict" | "minimum";
                    }>
                    | undefined;
                multiLine?:
                    | Partial<{
                        /**
                         * @default false
                         */
                        beforeColon: boolean;
                        /**
                         * @default true
                         */
                        afterColon: boolean;
                        /**
                         * @default 'strict'
                         */
                        mode: "strict" | "minimum";
                    }>
                    | undefined;
            },
        ]
    >;

    /**
     * Rule to enforce consistent spacing before and after keywords.
     *
     * @since 2.0.0-beta.1
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/keyword-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/keyword-spacing
     */
    "keyword-spacing": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                before: boolean;
                /**
                 * @default true
                 */
                after: boolean;
                overrides: Record<
                    string,
                    Partial<{
                        before: boolean;
                        after: boolean;
                    }>
                >;
            }>,
        ]
    >;

    /**
     * Rule to enforce position of line comments.
     *
     * @since 3.5.0
     * @deprecated since 9.3.0, please use the [corresponding rule](https://eslint.style/rules/js/line-comment-position) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/line-comment-position
     */
    "line-comment-position": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default 'above'
                 */
                position: "above" | "beside";
                ignorePattern: string;
                /**
                 * @default true
                 */
                applyDefaultIgnorePatterns: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent linebreak style.
     *
     * @since 0.21.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/linebreak-style) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/linebreak-style
     */
    "linebreak-style": Linter.RuleEntry<["unix" | "windows"]>;

    /**
     * Rule to require empty lines around comments.
     *
     * @since 0.22.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/lines-around-comment) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/lines-around-comment
     */
    "lines-around-comment": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                beforeBlockComment: boolean;
                /**
                 * @default false
                 */
                afterBlockComment: boolean;
                /**
                 * @default false
                 */
                beforeLineComment: boolean;
                /**
                 * @default false
                 */
                afterLineComment: boolean;
                /**
                 * @default false
                 */
                allowBlockStart: boolean;
                /**
                 * @default false
                 */
                allowBlockEnd: boolean;
                /**
                 * @default false
                 */
                allowObjectStart: boolean;
                /**
                 * @default false
                 */
                allowObjectEnd: boolean;
                /**
                 * @default false
                 */
                allowArrayStart: boolean;
                /**
                 * @default false
                 */
                allowArrayEnd: boolean;
                /**
                 * @default false
                 */
                allowClassStart: boolean;
                /**
                 * @default false
                 */
                allowClassEnd: boolean;
                ignorePattern: string;
                /**
                 * @default true
                 */
                applyDefaultIgnorePatterns: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require or disallow an empty line between class members.
     *
     * @since 4.9.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/lines-between-class-members) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/lines-between-class-members
     */
    "lines-between-class-members": Linter.RuleEntry<
        [
            "always" | "never" | {
                enforce: Array<
                    {
                        blankLine: "always" | "never";
                        prev: "method" | "field" | "*";
                        next: "method" | "field" | "*";
                    }
                >
            },
            Partial<{
                /**
                 * @default false
                 */
                exceptAfterSingleLine: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce a maximum depth that blocks can be nested.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/max-depth
     */
    "max-depth": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default 4
                 */
                max: number;
            }>,
        ]
    >;

    /**
     * Rule to enforce a maximum line length.
     *
     * @since 0.0.9
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/max-len) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/max-len
     */
    "max-len": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default 80
                 */
                code: number;
                /**
                 * @default 4
                 */
                tabWidth: number;
                comments: number;
                ignorePattern: string;
                /**
                 * @default false
                 */
                ignoreComments: boolean;
                /**
                 * @default false
                 */
                ignoreTrailingComments: boolean;
                /**
                 * @default false
                 */
                ignoreUrls: boolean;
                /**
                 * @default false
                 */
                ignoreStrings: boolean;
                /**
                 * @default false
                 */
                ignoreTemplateLiterals: boolean;
                /**
                 * @default false
                 */
                ignoreRegExpLiterals: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce a maximum number of lines per file.
     *
     * @since 2.12.0
     * @see https://eslint.org/docs/latest/rules/max-lines
     */
    "max-lines": Linter.RuleEntry<
        [
            | Partial<{
                /**
                 * @default 300
                 */
                max: number;
                /**
                 * @default false
                 */
                skipBlankLines: boolean;
                /**
                 * @default false
                 */
                skipComments: boolean;
            }>
            | number,
        ]
    >;

    /**
     * Rule to enforce a maximum number of lines of code in a function.
     *
     * @since 5.0.0
     * @see https://eslint.org/docs/latest/rules/max-lines-per-function
     */
    "max-lines-per-function": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default 50
                 */
                max: number;
                /**
                 * @default false
                 */
                skipBlankLines: boolean;
                /**
                 * @default false
                 */
                skipComments: boolean;
                /**
                 * @default false
                 */
                IIFEs: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce a maximum depth that callbacks can be nested.
     *
     * @since 0.2.0
     * @see https://eslint.org/docs/latest/rules/max-nested-callbacks
     */
    "max-nested-callbacks": Linter.RuleEntry<
        [
            | Partial<{
                /**
                 * @default 10
                 */
                max: number;
            }>
            | number,
        ]
    >;

    /**
     * Rule to enforce a maximum number of parameters in function definitions.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/max-params
     */
    "max-params": Linter.RuleEntry<
        [
            | Partial<{
                /**
                 * @default 3
                 */
                max: number;
            }>
            | number,
        ]
    >;

    /**
     * Rule to enforce a maximum number of statements allowed in function blocks.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/max-statements
     */
    "max-statements": Linter.RuleEntry<
        [
            | Partial<{
                /**
                 * @default 10
                 */
                max: number;
                /**
                 * @default false
                 */
                ignoreTopLevelFunctions: boolean;
            }>
            | number,
        ]
    >;

    /**
     * Rule to enforce a maximum number of statements allowed per line.
     *
     * @since 2.5.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/max-statements-per-line) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/max-statements-per-line
     */
    "max-statements-per-line": Linter.RuleEntry<
        [
            | Partial<{
                /**
                 * @default 1
                 */
                max: number;
            }>
            | number,
        ]
    >;

    /**
     * Rule to enforce a particular style for multiline comments.
     *
     * @since 4.10.0
     * @deprecated since 9.3.0, please use the [corresponding rule](https://eslint.style/rules/js/multiline-comment-style) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/multiline-comment-style
     */
    "multiline-comment-style": Linter.RuleEntry<["starred-block" | "bare-block" | "separate-lines"]>;

    /**
     * Rule to enforce newlines between operands of ternary expressions.
     *
     * @since 3.1.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/multiline-ternary) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/multiline-ternary
     */
    "multiline-ternary": Linter.RuleEntry<["always" | "always-multiline" | "never"]>;

    /**
     * Rule to require constructor names to begin with a capital letter.
     *
     * @since 0.0.3-0
     * @see https://eslint.org/docs/latest/rules/new-cap
     */
    "new-cap": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                newIsCap: boolean;
                /**
                 * @default true
                 */
                capIsNew: boolean;
                newIsCapExceptions: string[];
                newIsCapExceptionPattern: string;
                capIsNewExceptions: string[];
                capIsNewExceptionPattern: string;
                /**
                 * @default true
                 */
                properties: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce or disallow parentheses when invoking a constructor with no arguments.
     *
     * @since 0.0.6
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/new-parens) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/new-parens
     */
    "new-parens": Linter.RuleEntry<["always" | "never"]>;

    /**
     * Rule to require a newline after each call in a method chain.
     *
     * @since 2.0.0-rc.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/newline-per-chained-call) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/newline-per-chained-call
     */
    "newline-per-chained-call": Linter.RuleEntry<
        [
            {
                /**
                 * @default 2
                 */
                ignoreChainWithDepth: number;
            },
        ]
    >;

    /**
     * Rule to disallow `Array` constructors.
     *
     * @since 0.4.0
     * @see https://eslint.org/docs/latest/rules/no-array-constructor
     */
    "no-array-constructor": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow bitwise operators.
     *
     * @since 0.0.2
     * @see https://eslint.org/docs/latest/rules/no-bitwise
     */
    "no-bitwise": Linter.RuleEntry<
        [
            Partial<{
                allow: string[];
                /**
                 * @default false
                 */
                int32Hint: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow `continue` statements.
     *
     * @since 0.19.0
     * @see https://eslint.org/docs/latest/rules/no-continue
     */
    "no-continue": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow inline comments after code.
     *
     * @since 0.10.0
     * @see https://eslint.org/docs/latest/rules/no-inline-comments
     */
    "no-inline-comments": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `if` statements as the only statement in `else` blocks.
     *
     * @since 0.6.0
     * @see https://eslint.org/docs/latest/rules/no-lonely-if
     */
    "no-lonely-if": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow mixed binary operators.
     *
     * @since 2.12.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-mixed-operators) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-mixed-operators
     */
    "no-mixed-operators": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default
                 * [
                 *     ["+", "-", "*", "/", "%", "**"],
                 *     ["&", "|", "^", "~", "<<", ">>", ">>>"],
                 *     ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
                 *     ["&&", "||"],
                 *     ["in", "instanceof"]
                 * ]
                 */
                groups: string[][];
                /**
                 * @default true
                 */
                allowSamePrecedence: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow mixed spaces and tabs for indentation.
     *
     * @since 0.7.1
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-mixed-spaces-and-tabs) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-mixed-spaces-and-tabs
     */
    "no-mixed-spaces-and-tabs": Linter.RuleEntry<["smart-tabs"]>;

    /**
     * Rule to disallow use of chained assignment expressions.
     *
     * @since 3.14.0
     * @see https://eslint.org/docs/latest/rules/no-multi-assign
     */
    "no-multi-assign": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow multiple empty lines.
     *
     * @since 0.9.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-multiple-empty-lines) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-multiple-empty-lines
     */
    "no-multiple-empty-lines": Linter.RuleEntry<
        [
            | Partial<{
                /**
                 * @default 2
                 */
                max: number;
                maxEOF: number;
                maxBOF: number;
            }>
            | number,
        ]
    >;

    /**
     * Rule to disallow negated conditions.
     *
     * @since 1.6.0
     * @see https://eslint.org/docs/latest/rules/no-negated-condition
     */
    "no-negated-condition": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow nested ternary expressions.
     *
     * @since 0.2.0
     * @see https://eslint.org/docs/latest/rules/no-nested-ternary
     */
    "no-nested-ternary": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow calls to the `Object` constructor without an argument.
     *
     * @since 8.50.0
     * @see https://eslint.org/docs/latest/rules/no-object-constructor
     */
    "no-object-constructor": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow the unary operators `++` and `--`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-plusplus
     */
    "no-plusplus": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowForLoopAfterthoughts: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow specified syntax.
     *
     * @since 1.4.0
     * @see https://eslint.org/docs/latest/rules/no-restricted-syntax
     */
    "no-restricted-syntax": Linter.RuleEntry<
        [
            ...Array<
                | string
                | {
                    selector: string;
                    message?: string | undefined;
                }
            >,
        ]
    >;

    /**
     * Rule to disallow all tabs.
     *
     * @since 3.2.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-tabs) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-tabs
     */
    "no-tabs": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowIndentationTabs: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow ternary operators.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-ternary
     */
    "no-ternary": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow trailing whitespace at the end of lines.
     *
     * @since 0.7.1
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-trailing-spaces) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-trailing-spaces
     */
    "no-trailing-spaces": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                skipBlankLines: boolean;
                /**
                 * @default false
                 */
                ignoreComments: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow dangling underscores in identifiers.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-underscore-dangle
     */
    "no-underscore-dangle": Linter.RuleEntry<
        [
            Partial<{
                allow: string[];
                /**
                 * @default false
                 */
                allowAfterThis: boolean;
                /**
                 * @default false
                 */
                allowAfterSuper: boolean;
                /**
                 * @since 6.7.0
                 * @default false
                 */
                allowAfterThisConstructor: boolean;
                /**
                 * @default false
                 */
                enforceInMethodNames: boolean;
                /**
                 * @since 8.15.0
                 * @default false
                 */
                enforceInClassFields: boolean;
                /**
                 * @since 8.31.0
                 * @default true
                 */
                allowInArrayDestructuring: boolean;
                /**
                 * @since 8.31.0
                 * @default true
                 */
                allowInObjectDestructuring: boolean;
                /**
                 * @since 7.7.0
                 * @default true
                 */
                allowFunctionParams: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow ternary operators when simpler alternatives exist.
     *
     * @since 0.21.0
     * @see https://eslint.org/docs/latest/rules/no-unneeded-ternary
     */
    "no-unneeded-ternary": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                defaultAssignment: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow whitespace before properties.
     *
     * @since 2.0.0-beta.1
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-whitespace-before-property) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-whitespace-before-property
     */
    "no-whitespace-before-property": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce the location of single-line statements.
     *
     * @since 3.17.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/nonblock-statement-body-position) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/nonblock-statement-body-position
     */
    "nonblock-statement-body-position": Linter.RuleEntry<
        [
            "beside" | "below" | "any",
            Partial<{
                overrides: Record<string, "beside" | "below" | "any">;
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent line breaks after opening and before closing braces.
     *
     * @since 2.12.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/object-curly-newline) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/object-curly-newline
     */
    "object-curly-newline": Linter.RuleEntry<
        [
            | "always"
            | "never"
            | Partial<{
                /**
                 * @default false
                 */
                multiline: boolean;
                minProperties: number;
                /**
                 * @default true
                 */
                consistent: boolean;
            }>
            | Partial<
                Record<
                    "ObjectExpression" | "ObjectPattern" | "ImportDeclaration" | "ExportDeclaration",
                    | "always"
                    | "never"
                    | Partial<{
                        /**
                         * @default false
                         */
                        multiline: boolean;
                        minProperties: number;
                        /**
                         * @default true
                         */
                        consistent: boolean;
                    }>
                >
            >,
        ]
    >;

    /**
     * Rule to enforce consistent spacing inside braces.
     *
     * @since 0.22.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/object-curly-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/object-curly-spacing
     */
    "object-curly-spacing":
        | Linter.RuleEntry<
            [
                "never",
                {
                    /**
                     * @default false
                     */
                    arraysInObjects: boolean;
                    /**
                     * @default false
                     */
                    objectsInObjects: boolean;
                },
            ]
        >
        | Linter.RuleEntry<
            [
                "always",
                {
                    /**
                     * @default true
                     */
                    arraysInObjects: boolean;
                    /**
                     * @default true
                     */
                    objectsInObjects: boolean;
                },
            ]
        >;

    /**
     * Rule to enforce placing object properties on separate lines.
     *
     * @since 2.10.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/object-property-newline) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/object-property-newline
     */
    "object-property-newline": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowAllPropertiesOnSameLine: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce variables to be declared either together or separately in functions.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/one-var
     */
    "one-var": Linter.RuleEntry<
        [
            | "always"
            | "never"
            | "consecutive"
            | Partial<
                {
                    /**
                     * @default false
                     */
                    separateRequires: boolean;
                } & Record<"var" | "let" | "const", "always" | "never" | "consecutive">
            >
            | Partial<Record<"initialized" | "uninitialized", "always" | "never" | "consecutive">>,
        ]
    >;

    /**
     * Rule to require or disallow newlines around variable declarations.
     *
     * @since 2.0.0-beta.3
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/one-var-declaration-per-line) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/one-var-declaration-per-line
     */
    "one-var-declaration-per-line": Linter.RuleEntry<["initializations" | "always"]>;

    /**
     * Rule to require or disallow assignment operator shorthand where possible.
     *
     * @since 0.10.0
     * @see https://eslint.org/docs/latest/rules/operator-assignment
     */
    "operator-assignment": Linter.RuleEntry<["always" | "never"]>;

    /**
     * Rule to enforce consistent linebreak style for operators.
     *
     * @since 0.19.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/operator-linebreak) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/operator-linebreak
     */
    "operator-linebreak": Linter.RuleEntry<
        [
            "after" | "before" | "none",
            Partial<{
                overrides: Record<string, "after" | "before" | "none">;
            }>,
        ]
    >;

    /**
     * Rule to require or disallow padding within blocks.
     *
     * @since 0.9.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/padded-blocks) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/padded-blocks
     */
    "padded-blocks": Linter.RuleEntry<
        [
            "always" | "never" | Partial<Record<"blocks" | "classes" | "switches", "always" | "never">>,
            {
                /**
                 * @default false
                 */
                allowSingleLineBlocks: boolean;
            },
        ]
    >;

    /**
     * Rule to require or disallow padding lines between statements.
     *
     * @since 4.0.0-beta.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/padding-line-between-statements) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/padding-line-between-statements
     */
    "padding-line-between-statements": Linter.RuleEntry<
        [
            ...Array<
                {
                    blankLine: "any" | "never" | "always";
                } & Record<"prev" | "next", string | string[]>
            >,
        ]
    >;

    /**
     * Rule to disallow using `Object.assign` with an object literal as the first argument and prefer the use of object spread instead.
     *
     * @since 5.0.0-alpha.3
     * @see https://eslint.org/docs/latest/rules/prefer-object-spread
     */
    "prefer-object-spread": Linter.RuleEntry<[]>;

    /**
     * Rule to require quotes around object literal property names.
     *
     * @since 0.0.6
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/quote-props) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/quote-props
     */
    "quote-props":
        | Linter.RuleEntry<["always" | "consistent"]>
        | Linter.RuleEntry<
            [
                "as-needed",
                Partial<{
                    /**
                     * @default false
                     */
                    keywords: boolean;
                    /**
                     * @default true
                     */
                    unnecessary: boolean;
                    /**
                     * @default false
                     */
                    numbers: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<
            [
                "consistent-as-needed",
                Partial<{
                    /**
                     * @default false
                     */
                    keywords: boolean;
                }>,
            ]
        >;

    /**
     * Rule to enforce the consistent use of either backticks, double, or single quotes.
     *
     * @since 0.0.7
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/quotes) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/quotes
     */
    quotes: Linter.RuleEntry<
        [
            "double" | "single" | "backtick",
            Partial<{
                /**
                 * @default false
                 */
                avoidEscape: boolean;
                /**
                 * @default false
                 */
                allowTemplateLiterals: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require or disallow semicolons instead of ASI.
     *
     * @since 0.0.6
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/semi) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/semi
     */
    semi:
        | Linter.RuleEntry<
            [
                "always",
                Partial<{
                    /**
                     * @default false
                     */
                    omitLastInOneLineBlock: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<
            [
                "never",
                Partial<{
                    /**
                     * @default 'any'
                     */
                    beforeStatementContinuationChars: "any" | "always" | "never";
                }>,
            ]
        >;

    /**
     * Rule to enforce consistent spacing before and after semicolons.
     *
     * @since 0.16.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/semi-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/semi-spacing
     */
    "semi-spacing": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                before: boolean;
                /**
                 * @default true
                 */
                after: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce location of semicolons.
     *
     * @since 4.0.0-beta.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/semi-style) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/semi-style
     */
    "semi-style": Linter.RuleEntry<["last" | "first"]>;

    /**
     * Rule to require object keys to be sorted.
     *
     * @since 3.3.0
     * @see https://eslint.org/docs/latest/rules/sort-keys
     */
    "sort-keys": Linter.RuleEntry<
        [
            "asc" | "desc",
            Partial<{
                /**
                 * @default true
                 */
                caseSensitive: boolean;
                /**
                 * @default 2
                 */
                minKeys: number;
                /**
                 * @default false
                 */
                natural: boolean;
                /**
                 * @default false
                 */
                allowLineSeparatedGroups: boolean;
                /**
                 * @default false
                 */
                ignoreComputedKeys: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require variables within the same declaration block to be sorted.
     *
     * @since 0.2.0
     * @see https://eslint.org/docs/latest/rules/sort-vars
     */
    "sort-vars": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                ignoreCase: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent spacing before blocks.
     *
     * @since 0.9.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/space-before-blocks) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/space-before-blocks
     */
    "space-before-blocks": Linter.RuleEntry<
        ["always" | "never" | Partial<Record<"functions" | "keywords" | "classes", "always" | "never" | "off">>]
    >;

    /**
     * Rule to enforce consistent spacing before `function` definition opening parenthesis.
     *
     * @since 0.18.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/space-before-function-paren) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/space-before-function-paren
     */
    "space-before-function-paren": Linter.RuleEntry<
        ["always" | "never" | Partial<Record<"anonymous" | "named" | "asyncArrow", "always" | "never" | "ignore">>]
    >;

    /**
     * Rule to enforce consistent spacing inside parentheses.
     *
     * @since 0.8.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/space-in-parens) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/space-in-parens
     */
    "space-in-parens": Linter.RuleEntry<
        [
            "never" | "always",
            Partial<{
                exceptions: string[];
            }>,
        ]
    >;

    /**
     * Rule to require spacing around infix operators.
     *
     * @since 0.2.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/space-infix-ops) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/space-infix-ops
     */
    "space-infix-ops": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                int32Hint: boolean;
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent spacing before or after unary operators.
     *
     * @since 0.10.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/space-unary-ops) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/space-unary-ops
     */
    "space-unary-ops": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                words: boolean;
                /**
                 * @default false
                 */
                nonwords: boolean;
                overrides: Record<string, boolean>;
            }>,
        ]
    >;

    /**
     * Rule to enforce consistent spacing after the `//` or `/*` in a comment.
     *
     * @since 0.23.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/spaced-comment) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/spaced-comment
     */
    "spaced-comment": Linter.RuleEntry<
        [
            "always" | "never",
            {
                exceptions: string[];
                markers: string[];
                line: {
                    exceptions: string[];
                    markers: string[];
                };
                block: {
                    exceptions: string[];
                    markers: string[];
                    /**
                     * @default false
                     */
                    balanced: boolean;
                };
            },
        ]
    >;

    /**
     * Rule to enforce spacing around colons of switch statements.
     *
     * @since 4.0.0-beta.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/switch-colon-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/switch-colon-spacing
     */
    "switch-colon-spacing": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                before: boolean;
                /**
                 * @default true
                 */
                after: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require or disallow spacing between template tags and their literals.
     *
     * @since 3.15.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/template-tag-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/template-tag-spacing
     */
    "template-tag-spacing": Linter.RuleEntry<["never" | "always"]>;

    /**
     * Rule to require or disallow Unicode byte order mark (BOM).
     *
     * @since 2.11.0
     * @see https://eslint.org/docs/latest/rules/unicode-bom
     */
    "unicode-bom": Linter.RuleEntry<["never" | "always"]>;

    /**
     * Rule to require parenthesis around regex literals.
     *
     * @since 0.1.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/wrap-regex) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/wrap-regex
     */
    "wrap-regex": Linter.RuleEntry<[]>;
}
