import js from '@eslint/js';
import {Linter} from 'eslint';

export const rules = ({react}: {react: boolean}) => {
	return {
		...js.configs.recommended.rules,
		'for-direction': 'error',
		'getter-return': 'error',
		'no-async-promise-executor': 'error',
		'no-compare-neg-zero': 'error',
		'no-cond-assign': 'error',
		'no-constant-condition': 'error',
		'no-control-regex': 'error',
		'no-debugger': 'error',
		'no-dupe-args': 'error',
		'no-dupe-else-if': 'error',
		'no-dupe-keys': 'error',
		'no-duplicate-case': 'error',
		'no-empty-character-class': 'error',
		'no-empty': [
			'error',
			{
				allowEmptyCatch: true,
			},
		],
		'no-ex-assign': 'error',
		'no-extra-boolean-cast': 'error',
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
		'no-func-assign': 'error',
		'no-import-assign': 'error',
		'no-inner-declarations': 'error',
		'no-invalid-regexp': 'error',
		'no-irregular-whitespace': 'error',
		'no-loss-of-precision': 'error',
		'no-misleading-character-class': 'error',
		'no-obj-calls': 'error',
		'no-promise-executor-return': 'error',
		'no-prototype-builtins': 'error',
		'no-regex-spaces': 'error',
		'no-setter-return': 'error',
		'no-sparse-arrays': 'error',
		'no-unreachable': 'error',
		'no-unreachable-loop': 'error',
		'no-unsafe-finally': 'error',
		'no-unsafe-negation': [
			'error',
			{
				enforceForOrderingRelations: true,
			},
		],
		'no-unsafe-optional-chaining': [
			'error',
			{
				disallowArithmeticOperators: true,
			},
		],
		'no-useless-backreference': 'error',
		'use-isnan': 'error',
		'valid-typeof': [
			'error',
			{
				requireStringLiterals: false,
			},
		],
		'accessor-pairs': [
			'error',
			{
				enforceForClassMembers: true,
			},
		],
		'array-callback-return': [
			'error',
			{
				allowImplicit: true,
			},
		],
		'block-scoped-var': 'error',
		'default-case-last': 'error',
		'default-param-last': 'error',
		'dot-notation': 'error',
		'dot-location': ['error', 'property'],
		eqeqeq: 'error',
		'grouped-accessor-pairs': ['error', 'getBeforeSet'],
		'no-alert': 'error',
		'no-caller': 'error',
		'no-case-declarations': 'error',
		'no-constructor-return': 'error',
		'no-else-return': [
			'error',
			{
				allowElseIf: false,
			},
		],
		'no-empty-pattern': 'error',
		'no-eq-null': 'error',
		'no-eval': 'error',
		'no-extend-native': 'error',
		'no-extra-bind': 'error',
		'no-extra-label': 'error',
		'no-fallthrough': 'error',
		'no-global-assign': 'error',
		'no-implicit-coercion': 'error',
		'no-implicit-globals': 'error',
		'no-implied-eval': 'error',
		'no-iterator': 'error',
		'no-labels': 'error',
		'no-lone-blocks': 'error',
		'no-multi-str': 'error',
		'no-new-func': 'error',
		'no-new-wrappers': 'error',
		'no-nonoctal-decimal-escape': 'error',
		'no-new': 'error',
		'no-octal-escape': 'error',
		'no-octal': 'error',
		'no-proto': 'error',
		'no-redeclare': 'error',
		'no-return-assign': ['error', 'always'],
		'no-return-await': 'error',
		'no-script-url': 'error',
		'no-self-assign': [
			'error',
			{
				props: true,
			},
		],
		'no-self-compare': 'error',
		'no-sequences': 'error',
		'no-throw-literal': 'error',
		'no-unmodified-loop-condition': 'error',
		'no-unused-expressions': [
			'error',
			{
				enforceForJSX: true,
			},
		],
		'no-unused-labels': 'error',
		'no-useless-call': 'error',
		'no-useless-catch': 'error',
		'no-useless-concat': 'error',
		'no-useless-escape': 'error',
		'no-useless-return': 'error',
		'no-void': 'error',
		'no-with': 'error',

		// Disabled for now as Firefox doesn't support named capture groups and I'm tired of getting issues about the use of named capture groups...
		// 'prefer-named-capture-group': 'error'

		'prefer-promise-reject-errors': [
			'error',
			{
				allowEmptyReject: true,
			},
		],
		'prefer-regex-literals': 'error',
		radix: 'error',

		yoda: 'error',
		'no-delete-var': 'error',
		'no-label-var': 'error',
		'no-restricted-globals': ['error', 'event'],
		'no-shadow-restricted-names': 'error',
		'no-undef-init': 'error',
		'no-buffer-constructor': 'error',
		'no-restricted-imports': [
			'error',
			{
				paths: [
					'error',
					'domain',
					'freelist',
					'smalloc',
					'punycode',
					'sys',
					'querystring',
					'colors',
				],
				patterns: [
					'@remotion/*/src/*',
					'@remotion/*/dist/*',
					'remotion/src/*',
					'remotion/dist/*',
					'!@remotion/promo-pages/dist/*',
				],
			},
		],
		'func-name-matching': [
			'error',
			{
				considerPropertyDescriptor: true,
			},
		],
		'func-names': ['error', 'never'],
		'lines-between-class-members': [
			'error',
			'always',
			{
				// Workaround to allow class fields to not have lines between them.
				// TODO: Get ESLint to add an option to ignore class fields.
				exceptAfterSingleLine: true,
			},
		],
		'max-nested-callbacks': ['warn', 4],
		'max-params': [
			'warn',
			{
				max: 4,
			},
		],
		'max-statements-per-line': 'error',
		'new-cap': [
			'error',
			{
				newIsCap: true,
				capIsNew: true,
			},
		],
		'no-array-constructor': 'error',
		'no-bitwise': 'off',
		'no-lonely-if': 'error',
		'no-multi-assign': 'error',
		'no-new-object': 'error',
		'no-unneeded-ternary': 'error',
		// Disabled because of https://github.com/xojs/eslint-config-xo/issues/27
		// 'object-property-newline': 'error',
		'one-var': ['error', 'never'],
		'operator-assignment': ['error', 'always'],
		'padding-line-between-statements': [
			'error',
			{
				blankLine: 'always',
				prev: 'multiline-block-like',
				next: '*',
			},
		],
		'prefer-exponentiation-operator': 'error',
		'prefer-object-spread': 'error',
		'spaced-comment': [
			'error',
			'always',
			{
				line: {
					exceptions: ['-', '+', '*'],
					markers: ['!', '/', '=>'],
				},
				block: {
					exceptions: ['-', '+', '*'],
					markers: ['!', '*'],
					balanced: true,
				},
			},
		],
		'constructor-super': 'error',
		'no-class-assign': 'error',
		'no-const-assign': 'error',
		'no-dupe-class-members': 'error',
		'no-new-symbol': 'error',
		'no-this-before-super': 'error',
		'no-useless-computed-key': [
			'error',
			{
				enforceForClassMembers: true,
			},
		],
		'no-useless-constructor': 'error',
		'no-useless-rename': 'error',
		'no-var': 'error',
		'object-shorthand': ['error', 'always'],
		'prefer-arrow-callback': [
			'error',
			{
				allowNamedFunctions: true,
			},
		],
		'prefer-const': [
			'error',
			{
				destructuring: 'all',
			},
		],
		'prefer-destructuring': [
			'error',
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
		'prefer-numeric-literals': 'error',
		'prefer-rest-params': 'error',
		'prefer-spread': 'error',
		'require-yield': 'error',
		'symbol-description': 'error',
		'arrow-body-style': 'off',
		camelcase: 'off',
		'guard-for-in': 'off',
		'no-console': 'error',
		'no-await-in-loop': 'off',
		'capitalized-comments': 'off',
		'no-mixed-spaces-and-tabs': 'off',
		'operator-linebreak': 'off',
		'space-before-function-paren': 'off',
		'no-template-curly-in-string': 'error',
		'default-case': 'error',
		'generator-star-spacing': 'off',

		'no-warning-comments': 'warn',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-use-before-define': 'error',
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				vars: 'all',
				args: 'after-used',
				ignoreRestSiblings: true,
			},
		],
		'@typescript-eslint/no-shadow': [
			'error',
			{
				builtinGlobals: false,
				hoist: 'all',
			},
		],
		// We don't want to name it IState
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/camelcase': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/prefer-regexp-exec': 'off',
		'@typescript-eslint/explicit-member-accessibility': 'off',
		'@typescript-eslint/ban-ts-ignore': 'off',
		'@typescript-eslint/prefer-as-const': 'error',
		'@typescript-eslint/prefer-ts-expect-error': 'error',
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/prefer-interface': 'off',
		'@typescript-eslint/ban-types': 'off',
		'require-atomic-updates': 'off',
		complexity: 'off',
		'no-shadow': 'off',
		'no-undef': 'off',
		'require-await': 1,
		curly: 'off',

		// information. (These are marked with `0` instead of `"off"` so that a
		// script can distinguish them.)
		'lines-around-comment': 'off',
		'max-len': 'off',
		'no-confusing-arrow': 'off',
		'no-mixed-operators': 'off',
		'no-tabs': 'off',
		'no-unexpected-multiline': 'off',
		quotes: 'off',
		'@typescript-eslint/quotes': 'off',
		'vue/html-self-closing': 'off',
		'vue/max-len': 'off',

		// The rest are rules that you never need to enable when using Prettier.
		'array-bracket-newline': 'off',
		'array-bracket-spacing': 'off',
		'array-element-newline': 'off',
		'arrow-parens': 'off',
		'arrow-spacing': 'off',
		'block-spacing': 'off',
		'brace-style': 'off',
		'comma-dangle': 'off',
		'comma-spacing': 'off',
		'comma-style': 'off',
		'computed-property-spacing': 'off',
		'eol-last': 'off',
		'func-call-spacing': 'off',
		'function-call-argument-newline': 'off',
		'function-paren-newline': 'off',
		'generator-star': 'off',
		'implicit-arrow-linebreak': 'off',
		indent: 'off',
		'jsx-quotes': 'off',
		'key-spacing': 'off',
		'keyword-spacing': 'off',
		'linebreak-style': 'off',
		'multiline-ternary': 'off',
		'newline-per-chained-call': 'off',
		'new-parens': 'off',
		'no-arrow-condition': 'off',
		'no-comma-dangle': 'off',
		'no-extra-parens': 'off',
		'no-extra-semi': 'off',
		'no-floating-decimal': 'off',
		'no-multi-spaces': 'off',
		'no-multiple-empty-lines': 'off',
		'no-reserved-keys': 'off',
		'no-space-before-semi': 'off',
		'no-trailing-spaces': 'off',
		'no-whitespace-before-property': 'off',
		'no-wrap-func': 'off',
		'nonblock-statement-body-position': 'off',
		'object-curly-newline': 'off',
		'object-curly-spacing': 'off',
		'object-property-newline': 'off',
		'one-var-declaration-per-line': 'off',
		'padded-blocks': 'off',
		'quote-props': 'off',
		'rest-spread-spacing': 'off',
		semi: 'off',
		'semi-spacing': 'off',
		'semi-style': 'off',
		'space-after-function-name': 'off',
		'space-after-keywords': 'off',
		'space-before-blocks': 'off',
		'space-before-function-parentheses': 'off',
		'space-before-keywords': 'off',
		'space-in-brackets': 'off',
		'space-in-parens': 'off',
		'space-infix-ops': 'off',
		'space-return-throw-case': 'off',
		'space-unary-ops': 'off',
		'space-unary-word-ops': 'off',
		'switch-colon-spacing': 'off',
		'template-curly-spacing': 'off',
		'template-tag-spacing': 'off',
		'unicode-bom': 'off',
		'wrap-iife': 'off',
		'wrap-regex': 'off',
		'yield-star-spacing': 'off',
		'@typescript-eslint/brace-style': 'off',
		'@typescript-eslint/comma-dangle': 'off',
		'@typescript-eslint/comma-spacing': 'off',
		'@typescript-eslint/func-call-spacing': 'off',
		'@typescript-eslint/indent': 'off',
		'@typescript-eslint/keyword-spacing': 'off',
		'@typescript-eslint/member-delimiter-style': 'off',
		'@typescript-eslint/no-extra-parens': 'off',
		'@typescript-eslint/no-extra-semi': 'off',
		'@typescript-eslint/object-curly-spacing': 'off',
		'@typescript-eslint/semi': 'off',
		'@typescript-eslint/space-before-function-paren': 'off',
		'@typescript-eslint/space-infix-ops': 'off',
		'@typescript-eslint/type-annotation-spacing': 'off',
		...(react
			? ({
					'react/jsx-sort-props': [
						'error',
						{
							callbacksLast: false,
							shorthandFirst: false,
							shorthandLast: false,
							ignoreCase: false,
							noSortAlphabetically: true,
							reservedFirst: true,
						},
					],
					'react/jsx-no-target-blank': 'off',
					'react/no-did-mount-set-state': 'error',
					'react/no-deprecated': 'warn',
					'react/no-this-in-sfc': 'error',
					'react/no-direct-mutation-state': 'error',

					// currently has a bug
					'react/jsx-curly-brace-presence': react ? 'off' : undefined,
					'react/react-in-jsx-scope': react ? 'off' : undefined,
					'react/no-unused-prop-types': react ? 'off' : undefined,
					'react/button-has-type': react ? 'error' : undefined,
					'react/default-props-match-prop-types': react ? 'error' : undefined,
					'react/function-component-definition': react
						? [
								'error',
								{
									namedComponents: 'arrow-function',
									unnamedComponents: 'arrow-function',
								},
							]
						: undefined,
					'react/jsx-child-element-spacing': 'off',
					'react/jsx-closing-bracket-location': 'off',
					'react/jsx-closing-tag-location': 'off',
					'react/jsx-curly-newline': 'off',
					'react/jsx-curly-spacing': 'off',
					'react/jsx-equals-spacing': 'off',
					'react/jsx-first-prop-new-line': 'off',
					'react/jsx-indent-props': 'off',
					'react/jsx-max-props-per-line': 'off',
					'react/jsx-newline': 'off',
					'react/jsx-one-expression-per-line': 'off',
					'react/jsx-props-no-multi-spaces': 'off',
					'react/jsx-tag-spacing': 'off',
					'react/jsx-wrap-multilines': 'off',
					'react/self-closing-comp': react
						? [
								'warn',
								{
									component: true,
									html: true,
								},
							]
						: undefined,
					'react/prop-types': react ? 'off' : undefined,
					'react/forbid-component-props': react ? 'off' : undefined,
					'react/jsx-indent': 'off',

					'react/no-access-state-in-setstate': 'error',
					'react/no-array-index-key': 'error',
					'react/no-children-prop': 'error',
					'react/no-danger': 'error',
					'react/no-danger-with-children': 'error',
					'react/no-did-update-set-state': 'error',
					'react/no-find-dom-node': 'error',
					'react/no-is-mounted': 'error',
					'react/no-redundant-should-component-update': 'error',
					'react/no-render-return-value': 'error',
					'react/no-typos': 'error',
					'react/no-string-refs': [
						'error',
						{
							noTemplateLiterals: true,
						},
					],
					'react/no-unescaped-entities': 'error',
					'react/no-unknown-property': 'error',
					'react/no-unsafe': 'error',
					'react/no-unused-state': 'error',
					'react/prefer-read-only-props': 'error',
					'react/require-default-props': [
						'error',
						{
							forbidDefaultForRequired: true,
							ignoreFunctionalComponents: true,
						},
					],
					'react/state-in-constructor': ['error', 'never'],
					'react/static-property-placement': 'error',
					'react/style-prop-object': [
						'error',
						{
							allow: [
								// This allows react-intl’s `<FormattedNumber value={0.42} style='percent'/>`.
								'FormattedNumber',
							],
						},
					],
					'react/void-dom-elements-no-children': 'error',
					'react/jsx-boolean-value': 'error',
					'react/jsx-key': [
						'error',
						{
							checkFragmentShorthand: true,
							checkKeyMustBeforeSpread: true,
						},
					],
					'react/jsx-no-bind': [
						'error',
						{
							allowArrowFunctions: true,
						},
					],
					'react/jsx-no-comment-textnodes': 'error',
					'react/jsx-no-constructed-context-values': 'error',
					'react/jsx-no-duplicate-props': [
						'error',
						{
							ignoreCase: true,
						},
					],
					'react/jsx-no-script-url': 'error',

					'react/jsx-no-undef': 'error',
					'react/jsx-no-useless-fragment': 'error',
					'react/jsx-pascal-case': 'error',
					'react/jsx-uses-react': 'error',
					'react/jsx-uses-vars': 'error',
					// Leads to errors like <>'     '</>
					'react/jsx-fragments': react ? 'off' : undefined,
					'react-hooks/rules-of-hooks': 'error',
					'react-hooks/exhaustive-deps': 'error',
				} satisfies Partial<Linter.RulesRecord>)
			: {}),
	} satisfies Partial<Linter.RulesRecord>;
};

export const plugins = ({react}: {react: boolean}) => {
	return [
		react ? 'react' : undefined,
		react ? 'react-hooks' : undefined,
		'@typescript-eslint/eslint-plugin',
	].filter(Boolean) as string[];
};

export const base = ({
	react,
	flatConfig,
}: {
	react: boolean;
	flatConfig: boolean;
}): Linter.LegacyConfig => {
	return {
		env: {
			node: true,
			browser: true,
			es6: true,
			jest: false,
		},
		plugins: flatConfig ? undefined : plugins({react}),
		extends: [
			flatConfig ? undefined : 'plugin:@typescript-eslint/recommended',
			'eslint:recommended',
		].filter(Boolean) as string[],
		parser: flatConfig ? undefined : '@typescript-eslint/parser',
		parserOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			ecmaFeatures: {
				jsx: true,
			},
		},
		rules: rules({react}),
		settings: {
			...(react
				? {
						react: {
							version: '19.0.0',
						},
					}
				: {}),
		},
		overrides: [
			{
				files: ['**.js'],
				rules: {
					'@typescript-eslint/no-var-requires': 'off',
				},
			},
		],
	};
};
