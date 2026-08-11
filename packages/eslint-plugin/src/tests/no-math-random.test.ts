import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/deterministic-randomness';
const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
});

ruleTester.run('deterministic-randomness', rule, {
	valid: ['import {random} from "remotion";\nconst hi = random(null)'],
	invalid: [
		{
			code: 'Math.random()',
			errors: [
				{
					messageId: 'DeterministicRandomness',
				},
			],
		},
	],
});
