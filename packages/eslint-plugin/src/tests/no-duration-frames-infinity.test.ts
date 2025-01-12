import rule from '../rules/no-duration-frames-infinity';
import {makeRuleTester} from './rule-tester';

const ruleTester = makeRuleTester();

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
