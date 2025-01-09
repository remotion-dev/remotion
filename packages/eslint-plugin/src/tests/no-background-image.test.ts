import rule from '../rules/no-background-image';
import {makeRuleTester} from './rule-tester';

const ruleTester = makeRuleTester();

ruleTester.run('no-background-image', rule, {
	valid: [
		`const hi = {"background-image": 0}`,
		'const hi = {backgroundImage: "linear-gradient(to right, black, white)"}',
		`const hi = {backgroundImage: \`linear-gradient($\{hithere\})\`}`,
	],
	invalid: [
		{
			code: `const hi = {backgroundImage: "url()"}`,
			errors: [
				{
					messageId: 'BackgroundImage',
				},
			],
		},
		{
			code: `const hi = {backgroundImage: \`url($\{hithere\})\`}`,
			errors: [
				{
					messageId: 'BackgroundImage',
				},
			],
		},
	],
});
