import rule from '../rules/deterministic-randomness';
import {makeRuleTester} from './rule-tester';

const ruleTester = makeRuleTester();

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
