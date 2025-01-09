import {RuleTester} from '@typescript-eslint/rule-tester';
import {afterAll, describe, it} from 'bun:test';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

export const makeRuleTester = () => {
	return new RuleTester({
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	});
};
