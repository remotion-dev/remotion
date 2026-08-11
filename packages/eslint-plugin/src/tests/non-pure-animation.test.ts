import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/non-pure-animation';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('non-pure-animation', rule, {
	valid: [
		`const style = {color: "red"}`,
		`const style = {backgroundColor: "blue"}`,
		`const style = {transform: "translateX(10px)"}`,
		`const style = {opacity: 0.5}`,
		// Valid Tailwind classes (no transition properties)
		`<div className="text-red-500 bg-blue-500 p-4" />`,
		`<div className="font-bold text-lg" />`,
		`<div className="transform translate-x-4" />`,
		`<div className="opacity-50" />`,
		`<div className={"text-blue-500"} />`,
		// These should NOT match because they don't have transition
		`<div className="translate-x-4 rotate-45" />`,
		`<div className="duration-300" />`, // duration without transition is fine
		`<div className="ease-in-out" />`, // easing without transition is fine,
	],
	invalid: [
		{
			code: `const style = {transition: "all 0.3s ease"}`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `const style = {"transition": "opacity 0.5s"}`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `const style = {
				color: "red",
				transition: "all 0.3s ease"
			}`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		// Tailwind transition classes
		{
			code: `<div className="transition" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `<div className="transition-all" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `<div className="transition-opacity" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `<div className="transition-colors" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `<div className="transition-transform" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `<div className="transition-shadow" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `<div className="transition-spacing" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `<div className="text-red-500 transition-all p-4" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		{
			code: `<div className="transition-opacity bg-blue-500" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		// JSX Expression Container
		{
			code: `<div className={"transition-all"} />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		// Template literal
		{
			code: `<div className={\`transition-colors \${variant}\`} />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		// Multiple transition classes
		{
			code: `<div className="transition-opacity transition-transform" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
		// Edge case: transition-none should still be flagged
		{
			code: `<div className="transition-none" />`,
			errors: [
				{
					messageId: 'NonPureAnimation',
				},
			],
		},
	],
});
