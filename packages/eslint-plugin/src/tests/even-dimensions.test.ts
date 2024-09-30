import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/even-dimensions';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('even-dimensions', rule, {
	valid: [
		`
import {Composition} from 'remotion';

export const Re = () => {
  return (
    <Composition height={1000} />
  );
}
          `,
		`
import {Composition} from 'remotion';

export const Re = () => {
  return (
    <Composition width={1000} height={20} />
  );
}
          `,
		`
import {Still} from 'remotion';

export const Re = () => {
  return (
    <Still width={1001} height={20} />
  );
}
          `,
	],
	invalid: [
		{
			code: `
import {Composition} from 'remotion';

export const Re = () => {
  return (
    <Composition height={1001} />
  );
}
      `,
			errors: [
				{
					messageId: 'EvenDimensions',
				},
			],
		},
		{
			code: `
import {Composition} from 'remotion';

export const Re = () => {
  return (
    <Composition width={1001} />
  );
}
      `,
			errors: [
				{
					messageId: 'EvenDimensions',
				},
			],
		},
	],
});
