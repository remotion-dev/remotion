import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/volume-callback';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('volume-callback', rule, {
	valid: [
		`
import {Video} from 'remotion';

export const Re = () => {
  return (
    <Video volume={1} />
  );
}
          `,
		`
import {Video} from 'remotion';

export const Re = () => {
  return (
    <Video volume={f => f / 29} />
  );
}
          `,
		`
import {Html5Audio} from 'remotion';

export const Re = () => {
  return (
    <Html5Audio volume={1} />
  );
}
          `,
		`
const RandomComp = () => null;

export const Re = () => {
  return (
    <RandomComp volume={1} />
  );
}
          `,
		`
import {Video} from 'remotion';

const getVolume = (f) => f / 30;

export const Re = () => {
  return (
    <Video volume={getVolume} />
  );
}
          `,
		`
import {Html5Audio} from 'remotion';

export const Re = () => {
  return (
    <Html5Audio volume={function(f) { return f / 30; }} />
  );
}
          `,
	],
	invalid: [
		{
			code: `
import {Video, useCurrentFrame} from 'remotion';

export const Re = () => {
  const frame = useCurrentFrame();

  return (
    <Video volume={frame / 20} />
  );
}
      `,
			errors: [
				{
					messageId: 'VolumeCallback',
				},
			],
		},
		{
			code: `
import {Html5Video, useCurrentFrame} from 'remotion';

export const Re = () => {
  const frame = useCurrentFrame();

  return (
    <Html5Video volume={frame / 20} />
  );
}
      `,
			errors: [
				{
					messageId: 'VolumeCallback',
				},
			],
		},
		{
			code: `
import {Video, useCurrentFrame} from 'remotion';

export const Re = () => {
  const frame = useCurrentFrame();

  return (
    <Video volume={frame + 5} />
  );
}
      `,
			errors: [
				{
					messageId: 'VolumeCallback',
				},
			],
		},
	],
});
