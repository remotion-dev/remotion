import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/no-object-fit-on-media-video';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('no-object-fit-on-media-video', rule, {
	valid: [
		// objectFit as a prop is fine
		`<Video src="video.mp4" objectFit="cover" />`,
		// No objectFit in style is fine
		`<Video src="video.mp4" style={{width: '100%', height: '100%'}} />`,
		// Other components with objectFit in style are fine
		`<img style={{objectFit: 'cover'}} />`,
		`<div style={{objectFit: 'cover'}} />`,
		// Other components with object-fit className are fine
		`<img className="object-cover" />`,
		// Video with unrelated className
		`<Video src="video.mp4" className="w-full h-full" />`,
		// Video with unrelated style props
		`<Video src="video.mp4" style={{opacity: 0.5}} />`,
	],
	invalid: [
		// objectFit in style object
		{
			code: `<Video src="video.mp4" style={{objectFit: 'cover'}} />`,
			errors: [{messageId: 'NoObjectFitInStyle'}],
		},
		// objectFit in style alongside other props
		{
			code: `<Video src="video.mp4" style={{width: '100%', objectFit: 'contain'}} />`,
			errors: [{messageId: 'NoObjectFitInStyle'}],
		},
		// kebab-case object-fit in style
		{
			code: `<Video src="video.mp4" style={{"object-fit": 'fill'}} />`,
			errors: [{messageId: 'NoObjectFitInStyle'}],
		},
		// Tailwind object-cover in className string
		{
			code: `<Video src="video.mp4" className="object-cover" />`,
			errors: [{messageId: 'NoObjectFitInClassName'}],
		},
		// Tailwind object-contain in className string
		{
			code: `<Video src="video.mp4" className="object-contain" />`,
			errors: [{messageId: 'NoObjectFitInClassName'}],
		},
		// Tailwind object-fill in className
		{
			code: `<Video src="video.mp4" className="object-fill" />`,
			errors: [{messageId: 'NoObjectFitInClassName'}],
		},
		// Tailwind object-none in className
		{
			code: `<Video src="video.mp4" className="object-none" />`,
			errors: [{messageId: 'NoObjectFitInClassName'}],
		},
		// Tailwind object-scale-down in className
		{
			code: `<Video src="video.mp4" className="object-scale-down" />`,
			errors: [{messageId: 'NoObjectFitInClassName'}],
		},
		// Tailwind class mixed with others
		{
			code: `<Video src="video.mp4" className="w-full h-full object-cover" />`,
			errors: [{messageId: 'NoObjectFitInClassName'}],
		},
		// className as JSX expression
		{
			code: `<Video src="video.mp4" className={"object-cover"} />`,
			errors: [{messageId: 'NoObjectFitInClassName'}],
		},
		// className as template literal
		{
			code: `<Video src="video.mp4" className={\`object-cover \${variant}\`} />`,
			errors: [{messageId: 'NoObjectFitInClassName'}],
		},
		// Both style and className violations
		{
			code: `<Video src="video.mp4" style={{objectFit: 'cover'}} className="object-cover" />`,
			errors: [
				{messageId: 'NoObjectFitInStyle'},
				{messageId: 'NoObjectFitInClassName'},
			],
		},
	],
});
