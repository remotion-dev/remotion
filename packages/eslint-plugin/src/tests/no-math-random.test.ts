import rule from '../rules/deterministic-randomness';
import {createRuleTester} from './create-rule-tester';
const ruleTester = createRuleTester({
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
