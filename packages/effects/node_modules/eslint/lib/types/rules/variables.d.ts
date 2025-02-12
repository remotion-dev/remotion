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

export interface Variables extends Linter.RulesRecord {
    /**
     * Rule to require or disallow initialization in variable declarations.
     *
     * @since 1.0.0-rc-1
     * @see https://eslint.org/docs/latest/rules/init-declarations
     */
    "init-declarations":
        | Linter.RuleEntry<["always"]>
        | Linter.RuleEntry<
            [
                "never",
                Partial<{
                    ignoreForLoopInit: boolean;
                }>,
            ]
        >;

    /**
     * Rule to disallow deleting variables.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-delete-var
     */
    "no-delete-var": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow labels that share a name with a variable.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-label-var
     */
    "no-label-var": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow specified global variables.
     *
     * @since 2.3.0
     * @see https://eslint.org/docs/latest/rules/no-restricted-globals
     */
    "no-restricted-globals": Linter.RuleEntry<
        [
            ...Array<
                | string
                | {
                    name: string;
                    message?: string | undefined;
                }
            >,
        ]
    >;

    /**
     * Rule to disallow variable declarations from shadowing variables declared in the outer scope.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-shadow
     */
    "no-shadow": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                builtinGlobals: boolean;
                /**
                 * @default 'functions'
                 */
                hoist: "functions" | "all" | "never";
                allow: string[];
                /**
                 * @since 8.10.0
                 * @default false
                 */
                ignoreOnInitialization: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow identifiers from shadowing restricted names.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.1.4
     * @see https://eslint.org/docs/latest/rules/no-shadow-restricted-names
     */
    "no-shadow-restricted-names": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow the use of undeclared variables unless mentioned in \/*global *\/ comments.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-undef
     */
    "no-undef": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                typeof: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow initializing variables to `undefined`.
     *
     * @since 0.0.6
     * @see https://eslint.org/docs/latest/rules/no-undef-init
     */
    "no-undef-init": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow the use of `undefined` as an identifier.
     *
     * @since 0.7.1
     * @see https://eslint.org/docs/latest/rules/no-undefined
     */
    "no-undefined": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unused variables.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-unused-vars
     */
    "no-unused-vars": Linter.RuleEntry<
        [
            | "all"
            | "local"
            | Partial<{
                /**
                 * @default 'all'
                 */
                vars: "all" | "local";
                varsIgnorePattern: string;
                /**
                 * @default 'after-used'
                 */
                args: "after-used" | "all" | "none";
                /**
                 * @default false
                 */
                ignoreRestSiblings: boolean;
                argsIgnorePattern: string;
                /**
                 * @default 'all'
                 */
                caughtErrors: "none" | "all";
                caughtErrorsIgnorePattern: string;
                destructuredArrayIgnorePattern: string;
                /**
                 * @default false
                 */
                ignoreClassWithStaticInitBlock: boolean;
                /**
                 * @default false
                 */
                reportUsedIgnorePattern: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow the use of variables before they are defined.
     *
     * @since 0.0.9
     * @see https://eslint.org/docs/latest/rules/no-use-before-define
     */
    "no-use-before-define": Linter.RuleEntry<
        [
            | Partial<{
                /**
                 * @default true
                 */
                functions: boolean;
                /**
                 * @default true
                 */
                classes: boolean;
                /**
                 * @default true
                 */
                variables: boolean;
                /**
                 * @default false
                 */
                allowNamedExports: boolean;
            }>
            | "nofunc",
        ]
    >;
}
