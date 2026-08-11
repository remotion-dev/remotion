import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/no-from-0';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('no-duration-frames-infinity', rule, {
	valid: [
		`
      import {Sequence} from 'remotion';

      export const Re = () => {
        return (
          <Sequence durationInFrames={1} from={1}>
            Hi
          </Sequence>
        );
      }
    `,
	],
	invalid: [
		{
			code: `
        import {Composition, Sequence} from 'remotion';

        export const Re = () => {
          return (
            <Sequence from={0}>
              Hi
            </Sequence>
          );
        }
      `,
			output: `
        import {Composition, Sequence} from 'remotion';

        export const Re = () => {
          return (
            <Sequence >
              Hi
            </Sequence>
          );
        }
      `,
			errors: [
				{
					messageId: 'From0',
				},
			],
		},
	],
});
