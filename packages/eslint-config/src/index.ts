import { autoImports } from "./auto-import-rules";
import { allowESLintShareableConfig } from "./patch-eslint";

const baseExtends = ["eslint:recommended", "plugin:@remotion/recommended"];

const getRules = (typescript: boolean) => {
  return {
    // prettier
    curly: 0,
    "lines-around-comment": 0,
    "max-len": 0,
    "no-confusing-arrow": 0,
    "no-mixed-operators": 0,
    "no-tabs": 0,
    "no-unexpected-multiline": 0,
    quotes: 0,
    "@typescript-eslint/quotes": 0,
    "babel/quotes": 0,
    "array-bracket-newline": "off",
    "array-bracket-spacing": "off",
    "array-element-newline": "off",
    "arrow-parens": "off",
    "arrow-spacing": "off",
    "block-spacing": "off",
    "brace-style": "off",
    "comma-dangle": "off",
    "comma-spacing": "off",
    "comma-style": "off",
    "computed-property-spacing": "off",
    "dot-location": "off",
    "eol-last": "off",
    "func-call-spacing": "off",
    "function-call-argument-newline": "off",
    "function-paren-newline": "off",
    "generator-star": "off",
    "generator-star-spacing": "off",
    "implicit-arrow-linebreak": "off",
    indent: "off",
    "jsx-quotes": "off",
    "key-spacing": "off",
    "keyword-spacing": "off",
    "linebreak-style": "off",
    "multiline-ternary": "off",
    "newline-per-chained-call": "off",
    "new-parens": "off",
    "no-arrow-condition": "off",
    "no-comma-dangle": "off",
    "no-extra-parens": "off",
    "no-extra-semi": "off",
    "no-floating-decimal": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-multi-spaces": "off",
    "no-multiple-empty-lines": "off",
    "no-reserved-keys": "off",
    "no-space-before-semi": "off",
    "no-trailing-spaces": "off",
    "no-whitespace-before-property": "off",
    "no-wrap-func": "off",
    "nonblock-statement-body-position": "off",
    "object-curly-newline": "off",
    "object-curly-spacing": "off",
    "object-property-newline": "off",
    "one-var-declaration-per-line": "off",
    "operator-linebreak": "off",
    "padded-blocks": "off",
    "quote-props": "off",
    "rest-spread-spacing": "off",
    semi: "off",
    "semi-spacing": "off",
    "semi-style": "off",
    "space-after-function-name": "off",
    "space-after-keywords": "off",
    "space-before-blocks": "off",
    "space-before-function-paren": "off",
    "space-before-function-parentheses": "off",
    "space-before-keywords": "off",
    "space-in-brackets": "off",
    "space-in-parens": "off",
    "space-infix-ops": "off",
    "space-return-throw-case": "off",
    "space-unary-ops": "off",
    "space-unary-word-ops": "off",
    "switch-colon-spacing": "off",
    "template-curly-spacing": "off",
    "template-tag-spacing": "off",
    "unicode-bom": "off",
    "wrap-iife": "off",
    "wrap-regex": "off",
    "yield-star-spacing": "off",
    "@typescript-eslint/brace-style": "off",
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/comma-spacing": "off",
    "@typescript-eslint/func-call-spacing": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/keyword-spacing": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/no-extra-parens": "off",
    "@typescript-eslint/no-extra-semi": "off",
    "@typescript-eslint/object-curly-spacing": "off",
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/space-before-function-paren": "off",
    "@typescript-eslint/space-infix-ops": "off",
    "@typescript-eslint/type-annotation-spacing": "off",
    "react/jsx-child-element-spacing": "off",
    "react/jsx-closing-bracket-location": "off",
    "react/jsx-closing-tag-location": "off",
    "react/jsx-curly-newline": "off",
    "react/jsx-curly-spacing": "off",
    "react/jsx-equals-spacing": "off",
    "react/jsx-first-prop-new-line": "off",
    "react/jsx-indent": "off",
    "react/jsx-indent-props": "off",
    "react/jsx-max-props-per-line": "off",
    "react/jsx-newline": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-props-no-multi-spaces": "off",
    "react/jsx-tag-spacing": "off",
    "react/jsx-wrap-multilines": "off",
    // xo config
    "for-direction": "error",
    "getter-return": "error",
    "no-async-promise-executor": "error",
    "no-compare-neg-zero": "error",
    "no-cond-assign": "error",
    "no-constant-condition": "error",
    "no-control-regex": "error",
    "no-debugger": "error",
    "no-dupe-args": "error",
    "no-dupe-else-if": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty-character-class": "error",
    "no-empty": [
      "error",
      {
        allowEmptyCatch: true,
      },
    ],
    "no-ex-assign": "error",
    "no-extra-boolean-cast": "error",
    // Disabled because of https://github.com/eslint/eslint/issues/6028
    // 'no-extra-parens': [
    // 	'error',
    // 	'all',
    // 	{
    // 		conditionalAssign: false,
    // 		nestedBinaryExpressions: false,
    // 		ignoreJSX: 'multi-line'
    // 	}
    // ],
    "no-func-assign": "error",
    "no-import-assign": "error",
    "no-inner-declarations": "error",
    "no-invalid-regexp": "error",
    "no-irregular-whitespace": "error",
    "no-loss-of-precision": "error",
    "no-misleading-character-class": "error",
    "no-obj-calls": "error",
    "no-promise-executor-return": "error",
    "no-prototype-builtins": "error",
    "no-regex-spaces": "error",
    "no-setter-return": "error",
    "no-sparse-arrays": "error",
    "no-template-curly-in-string": "error",
    "no-unreachable": "error",
    "no-unreachable-loop": "error",
    "no-unsafe-finally": "error",
    "no-unsafe-negation": "error",
    "no-unsafe-optional-chaining": [
      "error",
      {
        disallowArithmeticOperators: true,
      },
    ],
    "no-useless-backreference": "error",
    "use-isnan": "error",
    "valid-typeof": [
      "error",
      {
        requireStringLiterals: false,
      },
    ],
    "accessor-pairs": [
      "error",
      {
        enforceForClassMembers: true,
      },
    ],
    "array-callback-return": [
      "error",
      {
        allowImplicit: true,
      },
    ],
    "block-scoped-var": "error",
    complexity: "warn",
    "default-case": "error",
    "default-case-last": "error",
    "default-param-last": "error",
    "dot-notation": "error",
    eqeqeq: "error",
    "grouped-accessor-pairs": ["error", "getBeforeSet"],
    "guard-for-in": "error",
    "no-alert": "error",
    "no-caller": "error",
    "no-case-declarations": "error",
    "no-constructor-return": "error",
    "no-else-return": [
      "error",
      {
        allowElseIf: false,
      },
    ],
    "no-empty-pattern": "error",
    "no-eq-null": "error",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-fallthrough": "error",
    "no-global-assign": "error",
    "no-implicit-coercion": "error",
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-iterator": "error",
    "no-labels": "error",
    "no-lone-blocks": "error",
    "no-multi-str": "error",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-nonoctal-decimal-escape": "error",
    "no-new": "error",
    "no-octal-escape": "error",
    "no-octal": "error",
    "no-proto": "error",
    "no-redeclare": "error",
    "no-return-assign": ["error", "always"],
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-assign": [
      "error",
      {
        props: true,
      },
    ],
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-throw-literal": "error",
    "no-unmodified-loop-condition": "error",
    "no-unused-labels": "error",
    "no-useless-call": "error",
    "no-useless-concat": "error",
    "no-useless-escape": "error",
    "no-useless-return": "error",
    "no-void": "error",
    "no-warning-comments": "warn",
    "no-with": "error",
    "prefer-promise-reject-errors": [
      "error",
      {
        allowEmptyReject: true,
      },
    ],
    "prefer-regex-literals": "error",
    radix: "error",

    // Disabled for now as it causes too much churn
    // TODO: Enable it in the future when I have time to deal with
    // the churn and the rule is stable and has an autofixer
    // 'require-unicode-regexp': 'error',

    yoda: "error",
    "no-delete-var": "error",
    "no-label-var": "error",
    "no-restricted-globals": ["error", "event"],
    "no-shadow-restricted-names": "error",
    "no-undef-init": "error",
    "no-buffer-constructor": "error",
    "no-restricted-imports": [
      "error",
      "domain",
      "freelist",
      "smalloc",
      "sys",
      "colors",
    ],

    camelcase: [
      "error",
      {
        properties: "always",
      },
    ],
    "capitalized-comments": [
      "error",
      "always",
      {
        // You can also ignore this rule by wrapping the first word in quotes.
        // c8 => https://github.com/bcoe/c8
        ignorePattern: /pragma|ignore|prettier-ignore|webpack\w+:|c8/.source,
        ignoreInlineComments: true,
        ignoreConsecutiveComments: true,
      },
    ],
    "func-name-matching": [
      "error",
      {
        considerPropertyDescriptor: true,
      },
    ],
    "func-names": ["error", "never"],
    "lines-between-class-members": [
      "error",
      "always",
      {
        // Workaround to allow class fields to not have lines between them.
        // TODO: Get ESLint to add an option to ignore class fields.
        exceptAfterSingleLine: true,
      },
    ],
    "max-depth": "warn",
    "max-nested-callbacks": ["warn", 4],
    "max-params": [
      "warn",
      {
        max: 4,
      },
    ],
    "max-statements-per-line": "error",
    "no-array-constructor": "error",
    "no-lonely-if": "error",
    "no-multi-assign": "error",
    "no-negated-condition": "error",
    "no-new-object": "error",
    "no-restricted-syntax": ["error", "WithStatement"],
    "no-unneeded-ternary": "error",
    // Disabled because of https://github.com/xojs/eslint-config-xo/issues/27
    // 'object-property-newline': 'error',
    "one-var": ["error", "never"],
    "operator-assignment": ["error", "always"],
    "padding-line-between-statements": "off",
    "prefer-exponentiation-operator": "error",
    "spaced-comment": [
      "error",
      "always",
      {
        line: {
          exceptions: ["-", "+", "*"],
          markers: ["!", "/", "=>"],
        },
        block: {
          exceptions: ["-", "+", "*"],
          markers: ["!", "*"],
          balanced: true,
        },
      },
    ],
    "constructor-super": "error",
    "no-class-assign": "error",
    "no-const-assign": "error",
    "no-dupe-class-members": "error",
    "no-new-symbol": "error",
    "no-this-before-super": "error",
    "no-useless-computed-key": [
      "error",
      {
        enforceForClassMembers: true,
      },
    ],
    "no-useless-constructor": "error",
    "no-useless-rename": "error",
    "require-yield": "error",
    "symbol-description": "error",
    "no-var": "error",
    "object-shorthand": ["error", "always"],
    "prefer-arrow-callback": [
      "error",
      {
        allowNamedFunctions: true,
      },
    ],
    "prefer-const": [
      "error",
      {
        destructuring: "all",
      },
    ],
    "prefer-numeric-literals": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-object-spread": "error",
    "prefer-destructuring": [
      "error",
      {
        // `array` is disabled because it forces destructuring on
        // stupid stuff like `foo.bar = process.argv[2];`
        // TODO: Open ESLint issue about this
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,

          // Disabled because object assignment destructuring requires parens wrapping:
          // `let foo; ({foo} = object);`
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    "no-useless-catch": "error",
    // xo-react rules
    "react/boolean-prop-naming": [
      "error",
      {
        validateNested: true,
      },
    ],
    "react/button-has-type": "error",
    "react/default-props-match-prop-types": "error",
    "react/no-access-state-in-setstate": "error",
    "react/no-children-prop": "error",
    "react/no-danger": "error",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": "error",
    "react/no-did-update-set-state": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-find-dom-node": "error",
    "react/no-is-mounted": "error",
    "react/no-redundant-should-component-update": "error",
    "react/no-render-return-value": "error",
    "react/no-typos": "error",
    "react/no-string-refs": [
      "error",
      {
        noTemplateLiterals: true,
      },
    ],
    "react/no-this-in-sfc": "error",
    "react/no-unsafe": "error",
    "react/no-unused-prop-types": "error",
    "react/no-unused-state": "error",
    "react/prefer-read-only-props": "error",
    "react/require-default-props": [
      "error",
      {
        forbidDefaultForRequired: true,
        ignoreFunctionalComponents: true,
      },
    ],
    "react/self-closing-comp": "error",
    "react/state-in-constructor": ["error", "never"],
    "react/static-property-placement": "error",
    "react/style-prop-object": "error",
    "react/void-dom-elements-no-children": "error",
    "react/jsx-boolean-value": "error",
    "react/jsx-no-bind": [
      "error",
      {
        allowArrowFunctions: true,
      },
    ],
    "react/jsx-no-comment-textnodes": "error",
    "react/jsx-no-duplicate-props": [
      "error",
      {
        ignoreCase: true,
      },
    ],
    "react/jsx-no-script-url": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-curly-brace-presence": ["error", "never"],
    "react/jsx-fragments": ["error", "syntax"],
    "react/jsx-pascal-case": "error",
    "react/jsx-sort-props": [
      "error",
      {
        callbacksLast: true,
        shorthandFirst: true,
        noSortAlphabetically: true,
        reservedFirst: true,
      },
    ],
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",

    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    // Turning off rules that are too strict or don't apply to Remotion
    "react/jsx-no-constructed-context-values": "off",
    "no-console": "off",
    "10x/react-in-scope": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-key": "off",
    "react/jsx-no-target-blank": "off",
    // The following rules are handled by typescript-eslint
    ...(typescript
      ? {
          "no-unused-vars": "off",
          "no-undef": "off",
          "no-shadow": "off",
          // Using `require` is useful for importing PNG sequences: require('frame' + frame + '.png')
          "@typescript-eslint/no-var-requires": "off",
        }
      : {
          "no-undef": [
            "error",
            {
              typeof: true,
            },
          ],

          "no-unused-vars": [
            "error",
            {
              vars: "all",
              args: "after-used",
              ignoreRestSiblings: true,
              argsIgnorePattern: /^_/.source,
              caughtErrors: "all",
              caughtErrorsIgnorePattern: /^_$/.source,
            },
          ],
        }),
    // In Root.tsx we encourage using fragment for just a single composition
    // since we intend to add more compositions later and you should then use a fragment.
    "react/jsx-no-useless-fragment": "off",
    // This is generally okay because on every frame, there will be a full rerender anyway!
    "react/no-array-index-key": "off",
    "10x/auto-import": [
      "error",
      {
        imports: autoImports,
      },
    ],
  };
};

allowESLintShareableConfig();

export = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  plugins: ["react", "react-hooks", "@typescript-eslint", "10x", "@remotion"],
  extends: baseExtends,
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  overrides: [
    {
      files: ["*.{ts,tsx}"],
      extends: ["plugin:@typescript-eslint/recommended", ...baseExtends],
      parser: "@typescript-eslint/parser",
      rules: getRules(true),
    },
  ],
  rules: getRules(false),
  settings: {
    react: {
      version: "detect",
    },
  },
};
