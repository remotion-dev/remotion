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

export interface NoRestrictedImportPathCommonOptions {
    name: string;
    message?: string;
}

export type EitherImportNamesOrAllowImportName =
  | { importNames?: string[]; allowImportNames?: never }
  | { allowImportNames?: string[]; importNames?: never }

export type ValidNoRestrictedImportPathOptions = NoRestrictedImportPathCommonOptions & EitherImportNamesOrAllowImportName;

export interface NoRestrictedImportPatternCommonOptions {
    message?: string;
    caseSensitive?: boolean;
}

// Base type for group or regex constraint, ensuring mutual exclusivity
export type EitherGroupOrRegEx =
  | { group: string[]; regex?: never }
  | { regex: string; group?: never };

// Base type for import name specifiers, ensuring mutual exclusivity
export type EitherNameSpecifiers = 
    | { importNames: string[]; allowImportNames?: never; importNamePattern?: never; allowImportNamePattern?: never }
    | { importNamePattern: string; allowImportNames?: never; importNames?: never; allowImportNamePattern?: never }
    | { allowImportNames: string[]; importNames?: never; importNamePattern?: never; allowImportNamePattern?: never }
    | { allowImportNamePattern: string; importNames?: never; allowImportNames?: never; importNamePattern?: never }

// Adds oneOf and not constraints, ensuring group or regex are present and mutually exclusive sets for importNames, allowImportNames, etc., as per the schema.
export type ValidNoRestrictedImportPatternOptions = NoRestrictedImportPatternCommonOptions & EitherGroupOrRegEx & EitherNameSpecifiers;

export interface ECMAScript6 extends Linter.RulesRecord {
    /**
     * Rule to require braces around arrow function bodies.
     *
     * @since 1.8.0
     * @see https://eslint.org/docs/latest/rules/arrow-body-style
     */
    "arrow-body-style":
        | Linter.RuleEntry<
            [
                "as-needed",
                Partial<{
                    /**
                     * @default false
                     */
                    requireReturnForObjectLiteral: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<["always" | "never"]>;

    /**
     * Rule to require parentheses around arrow function arguments.
     *
     * @since 1.0.0-rc-1
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/arrow-parens) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/arrow-parens
     */
    "arrow-parens":
        | Linter.RuleEntry<["always"]>
        | Linter.RuleEntry<
            [
                "as-needed",
                Partial<{
                    /**
                     * @default false
                     */
                    requireForBlockBody: boolean;
                }>,
            ]
        >;

    /**
     * Rule to enforce consistent spacing before and after the arrow in arrow functions.
     *
     * @since 1.0.0-rc-1
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/arrow-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/arrow-spacing
     */
    "arrow-spacing": Linter.RuleEntry<[]>;

    /**
     * Rule to require `super()` calls in constructors.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.24.0
     * @see https://eslint.org/docs/latest/rules/constructor-super
     */
    "constructor-super": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce consistent spacing around `*` operators in generator functions.
     *
     * @since 0.17.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/generator-star-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/generator-star-spacing
     */
    "generator-star-spacing": Linter.RuleEntry<
        [
            | Partial<{
                before: boolean;
                after: boolean;
                named:
                    | Partial<{
                        before: boolean;
                        after: boolean;
                    }>
                    | "before"
                    | "after"
                    | "both"
                    | "neither";
                anonymous:
                    | Partial<{
                        before: boolean;
                        after: boolean;
                    }>
                    | "before"
                    | "after"
                    | "both"
                    | "neither";
                method:
                    | Partial<{
                        before: boolean;
                        after: boolean;
                    }>
                    | "before"
                    | "after"
                    | "both"
                    | "neither";
            }>
            | "before"
            | "after"
            | "both"
            | "neither",
        ]
    >;

    /**
     * Rule to require or disallow logical assignment operator shorthand.
     *
     * @since 8.24.0
     * @see https://eslint.org/docs/latest/rules/logical-assignment-operators
     */
    "logical-assignment-operators":
        | Linter.RuleEntry<
            [
                "always",
                Partial<{
                    /**
                     * @default false
                     */
                    enforceForIfStatements: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<["never"]>;

    /**
     * Rule to disallow reassigning class members.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 1.0.0-rc-1
     * @see https://eslint.org/docs/latest/rules/no-class-assign
     */
    "no-class-assign": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow arrow functions where they could be confused with comparisons.
     *
     * @since 2.0.0-alpha-2
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/no-confusing-arrow) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/no-confusing-arrow
     */
    "no-confusing-arrow": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                allowParens: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow reassigning `const` variables.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 1.0.0-rc-1
     * @see https://eslint.org/docs/latest/rules/no-const-assign
     */
    "no-const-assign": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow duplicate class members.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 1.2.0
     * @see https://eslint.org/docs/latest/rules/no-dupe-class-members
     */
    "no-dupe-class-members": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow duplicate module imports.
     *
     * @since 2.5.0
     * @see https://eslint.org/docs/latest/rules/no-duplicate-imports
     */
    "no-duplicate-imports": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                includeExports: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow `new` operators with global non-constructor functions.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 8.27.0
     * @see https://eslint.org/docs/latest/rules/no-new-native-nonconstructor
     */
    "no-new-native-nonconstructor": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow specified names in exports.
     *
     * @since 7.0.0-alpha.0
     * @see https://eslint.org/docs/latest/rules/no-restricted-exports
     */
    "no-restricted-exports": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default []
                 */
                restrictedNamedExports: string[];
                /**
                 * @since 9.3.0
                 */
                restrictedNamedExportsPattern: string;
                /**
                 * @since 8.33.0
                 */
                restrictDefaultExports: Partial<{
                    /**
                     * @default false
                     */
                    direct: boolean;
                    /**
                     * @default false
                     */
                    named: boolean;
                    /**
                     * @default false
                     */
                    defaultFrom: boolean;
                    /**
                     * @default false
                     */
                    namedFrom: boolean;
                    /**
                     * @default false
                     */
                    namespaceFrom: boolean;
                }>;
            }>,
        ]
    >;

    /**
     * Rule to disallow specified modules when loaded by `import`.
     *
     * @since 2.0.0-alpha-1
     * @see https://eslint.org/docs/latest/rules/no-restricted-imports
     */
    "no-restricted-imports": Linter.RuleEntry<
        [
            ...Array<
                | string
                | ValidNoRestrictedImportPathOptions
                | Partial<{
                      paths: Array<string | ValidNoRestrictedImportPathOptions>;
                      patterns: Array<string | ValidNoRestrictedImportPatternOptions>;
                  }>
            >
        ]
    >;

    /**
     * Rule to disallow `this`/`super` before calling `super()` in constructors.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 0.24.0
     * @see https://eslint.org/docs/latest/rules/no-this-before-super
     */
    "no-this-before-super": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow unnecessary computed property keys in objects and classes.
     *
     * @since 2.9.0
     * @see https://eslint.org/docs/latest/rules/no-useless-computed-key
     */
    "no-useless-computed-key": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default true
                 */
                enforceForClassMembers: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow unnecessary constructors.
     *
     * @since 2.0.0-beta.1
     * @see https://eslint.org/docs/latest/rules/no-useless-constructor
     */
    "no-useless-constructor": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow renaming import, export, and destructured assignments to the same name.
     *
     * @since 2.11.0
     * @see https://eslint.org/docs/latest/rules/no-useless-rename
     */
    "no-useless-rename": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                ignoreImport: boolean;
                /**
                 * @default false
                 */
                ignoreExport: boolean;
                /**
                 * @default false
                 */
                ignoreDestructuring: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require `let` or `const` instead of `var`.
     *
     * @since 0.12.0
     * @see https://eslint.org/docs/latest/rules/no-var
     */
    "no-var": Linter.RuleEntry<[]>;

    /**
     * Rule to require or disallow method and property shorthand syntax for object literals.
     *
     * @since 0.20.0
     * @see https://eslint.org/docs/latest/rules/object-shorthand
     */
    "object-shorthand":
        | Linter.RuleEntry<
            [
                "always" | "methods",
                Partial<{
                    /**
                     * @default false
                     */
                    avoidQuotes: boolean;
                    /**
                     * @default false
                     */
                    ignoreConstructors: boolean;
                    /**
                     * @since 8.22.0
                     */
                    methodsIgnorePattern: string;
                    /**
                     * @default false
                     */
                    avoidExplicitReturnArrows: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<
            [
                "properties",
                Partial<{
                    /**
                     * @default false
                     */
                    avoidQuotes: boolean;
                }>,
            ]
        >
        | Linter.RuleEntry<["never" | "consistent" | "consistent-as-needed"]>;

    /**
     * Rule to require using arrow functions for callbacks.
     *
     * @since 1.2.0
     * @see https://eslint.org/docs/latest/rules/prefer-arrow-callback
     */
    "prefer-arrow-callback": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                allowNamedFunctions: boolean;
                /**
                 * @default true
                 */
                allowUnboundThis: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require `const` declarations for variables that are never reassigned after declared.
     *
     * @since 0.23.0
     * @see https://eslint.org/docs/latest/rules/prefer-const
     */
    "prefer-const": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default 'any'
                 */
                destructuring: "any" | "all";
                /**
                 * @default false
                 */
                ignoreReadBeforeAssign: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require destructuring from arrays and/or objects.
     *
     * @since 3.13.0
     * @see https://eslint.org/docs/latest/rules/prefer-destructuring
     */
    "prefer-destructuring": Linter.RuleEntry<
        [
            Partial<
                | {
                    VariableDeclarator: Partial<{
                        array: boolean;
                        object: boolean;
                    }>;
                    AssignmentExpression: Partial<{
                        array: boolean;
                        object: boolean;
                    }>;
                }
                | {
                    array: boolean;
                    object: boolean;
                }
            >,
            Partial<{
                enforceForRenamedProperties: boolean;
            }>,
        ]
    >;

    /**
     * Rule to disallow the use of `Math.pow` in favor of the `**` operator.
     *
     * @since 6.7.0
     * @see https://eslint.org/docs/latest/rules/prefer-exponentiation-operator
     */
    "prefer-exponentiation-operator": Linter.RuleEntry<[]>;

    /**
     * Rule to disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and hexadecimal literals.
     *
     * @since 3.5.0
     * @see https://eslint.org/docs/latest/rules/prefer-numeric-literals
     */
    "prefer-numeric-literals": Linter.RuleEntry<[]>;

    /**
     * Rule to require rest parameters instead of `arguments`.
     *
     * @since 2.0.0-alpha-1
     * @see https://eslint.org/docs/latest/rules/prefer-rest-params
     */
    "prefer-rest-params": Linter.RuleEntry<[]>;

    /**
     * Rule to require spread operators instead of `.apply()`.
     *
     * @since 1.0.0-rc-1
     * @see https://eslint.org/docs/latest/rules/prefer-spread
     */
    "prefer-spread": Linter.RuleEntry<[]>;

    /**
     * Rule to require template literals instead of string concatenation.
     *
     * @since 1.2.0
     * @see https://eslint.org/docs/latest/rules/prefer-template
     */
    "prefer-template": Linter.RuleEntry<[]>;

    /**
     * Rule to require generator functions to contain `yield`.
     *
     * @remarks
     * Recommended by ESLint, the rule was enabled in `eslint:recommended`.
     *
     * @since 1.0.0-rc-1
     * @see https://eslint.org/docs/latest/rules/require-yield
     */
    "require-yield": Linter.RuleEntry<[]>;

    /**
     * Rule to enforce spacing between rest and spread operators and their expressions.
     *
     * @since 2.12.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/rest-spread-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/rest-spread-spacing
     */
    "rest-spread-spacing": Linter.RuleEntry<["never" | "always"]>;

    /**
     * Rule to enforce sorted `import` declarations within modules.
     *
     * @since 2.0.0-beta.1
     * @see https://eslint.org/docs/latest/rules/sort-imports
     */
    "sort-imports": Linter.RuleEntry<
        [
            Partial<{
                /**
                 * @default false
                 */
                ignoreCase: boolean;
                /**
                 * @default false
                 */
                ignoreDeclarationSort: boolean;
                /**
                 * @default false
                 */
                ignoreMemberSort: boolean;
                /**
                 * @default ['none', 'all', 'multiple', 'single']
                 */
                memberSyntaxSortOrder: Array<"none" | "all" | "multiple" | "single">;
                /**
                 * @default false
                 */
                allowSeparatedGroups: boolean;
            }>,
        ]
    >;

    /**
     * Rule to require symbol descriptions.
     *
     * @since 3.4.0
     * @see https://eslint.org/docs/latest/rules/symbol-description
     */
    "symbol-description": Linter.RuleEntry<[]>;

    /**
     * Rule to require or disallow spacing around embedded expressions of template strings.
     *
     * @since 2.0.0-rc.0
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/template-curly-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/template-curly-spacing
     */
    "template-curly-spacing": Linter.RuleEntry<["never" | "always"]>;

    /**
     * Rule to require or disallow spacing around the `*` in `yield*` expressions.
     *
     * @since 2.0.0-alpha-1
     * @deprecated since 8.53.0, please use the [corresponding rule](https://eslint.style/rules/js/yield-star-spacing) in `@stylistic/eslint-plugin-js`.
     * @see https://eslint.org/docs/latest/rules/yield-star-spacing
     */
    "yield-star-spacing": Linter.RuleEntry<
        [
            | Partial<{
                before: boolean;
                after: boolean;
            }>
            | "before"
            | "after"
            | "both"
            | "neither",
        ]
    >;
}
