import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/no-duration-frames-infinity';

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
          <Sequence durationInFrames={1}>
            Hi
          </Sequence>
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
            <Sequence durationInFrames={Infinity}>
              Hi
            </Sequence>
          );
        }
      `,
			output: `
        import {Composition} from 'remotion';

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
					messageId: 'DurationInFrames',
				},
			],
		},
	],
});
