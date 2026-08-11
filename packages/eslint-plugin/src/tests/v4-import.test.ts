import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/v4-import';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
});

ruleTester.run('v4-import', rule, {
	valid: [
		'import {interpolate} from "remotion"',
		'import {Config} from "@remotion/cli/config"',
	],
	invalid: [
		{
			code: 'import {Config} from "remotion"',
			errors: [
				{
					messageId: 'ImportConfig',
				},
			],
		},
		{
			code: 'import {Config, interpolate} from "remotion"',
			errors: [
				{
					messageId: 'ImportConfig',
				},
			],
		},
	],
});
