import rule from '../rules/v4-import';
import {makeRuleTester} from './rule-tester';

const ruleTester = makeRuleTester();

ruleTester.run('no-mp4-import', rule, {
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
