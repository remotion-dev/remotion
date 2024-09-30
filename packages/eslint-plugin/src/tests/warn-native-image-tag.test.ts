import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/warn-native-media-tag';
const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('warn-native-media-tag', rule, {
	valid: [
		'const hi = <div></div>',
		'const hi = <Img></Img>',
		'const hi = <IFrame/>',
		'const hi = <Audio/>',
		'const hi = styled(Audio)``',
	],
	invalid: [
		{
			code: 'const hi = <img/>',
			errors: [
				{
					messageId: 'NoNativeImgTag',
				},
			],
		},
		{
			code: 'const hi = <img></img>',
			errors: [
				{
					messageId: 'NoNativeImgTag',
				},
			],
		},
		{
			code: 'const hi = <iframe></iframe>',
			errors: [
				{
					messageId: 'NoNativeIFrameTag',
				},
			],
		},
		{
			code: 'const hi = styled.img`color: blue;`',
			errors: [
				{
					messageId: 'NoNativeImgTag',
				},
			],
		},
		{
			code: 'const hi = styled.iframe`color: blue;`',
			errors: [
				{
					messageId: 'NoNativeIFrameTag',
				},
			],
		},
		{
			code: 'const hi = styled.video<{type: string}>`color: blue;`',
			errors: [
				{
					messageId: 'NoNativeVideoTag',
				},
			],
		},
	],
});
