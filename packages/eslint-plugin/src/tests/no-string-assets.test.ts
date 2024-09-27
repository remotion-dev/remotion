import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/no-string-assets';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('no-string-assets', rule, {
	valid: [
		// Network image should be allowed
		`
import {Img} from 'remotion';

export const Re = () => {
  return (
    <Img src="https://google.com/favicon.ico" />
  );
}
          `,
		`
import {Img} from 'remotion';

export const Re = () => {
  return (
    <Img src="data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGP
    C/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IA
    AAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1J
    REFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jq
    ch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0
    vr4MkhoXe0rZigAAAABJRU5ErkJggg==" />
  );
}
          `,
		`
import {Img} from 'remotion';
import img from './img.png';

export const Re = () => {
  return (
    <Img src={img} />
  );
}
                `,
	],
	invalid: [
		{
			code: `
import {Img} from 'remotion';

export const Re = () => {
  return (
    <Img src="hithere" />
  );
}
      `,
			errors: [
				{
					messageId: 'NoStringAssets',
				},
			],
		},
		{
			code: `
import {Img} from 'remotion';

export const Re = () => {
  return (
    <Img src={"curly"} />
  );
}
      `,
			errors: [
				{
					messageId: 'NoStringAssets',
				},
			],
		},
		{
			code: `
import {Audio} from 'remotion';

export const Re = () => {
  return (
    <Audio src="hithere" />
  );
}
      `,
			errors: [
				{
					messageId: 'NoStringAssets',
				},
			],
		},
	],
});
