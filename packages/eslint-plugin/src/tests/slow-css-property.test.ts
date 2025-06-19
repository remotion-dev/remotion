import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/slow-css-property';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('slow-css-property', rule, {
	valid: [
		`const style = {color: "red"}`,
		`const style = {backgroundColor: "blue"}`,
		`const style = {margin: 10}`,
		`const style = {border: "1px solid black"}`,
		// Valid Tailwind classes (no slow properties)
		`<div className="text-red-500 bg-blue-500 p-4" />`,
		`<div className="font-bold text-lg" />`,
		`<div className="border border-gray-300" />`,
		`<div className={"text-blue-500"} />`,
	],
	invalid: [
		{
			code: `const style = {boxShadow: "0 0 5px red"}`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `const style = {textShadow: "1px 1px 1px black"}`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `const style = {filter: "blur(5px)"}`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `const style = {
				color: "red",
				boxShadow: "0 0 5px red",
				textShadow: "1px 1px 1px black"
			}`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `const style = {"box-shadow": "0 0 5px red"}`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `const style = {"text-shadow": "1px 1px 1px black"}`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `const style = {"filter": "blur(5px)"}`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `const style = {
				color: "red",
				"box-shadow": "0 0 5px red",
				"text-shadow": "1px 1px 1px black"
			}`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		// Tailwind shadow classes
		{
			code: `<div className="shadow-lg" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="shadow-xl text-red-500" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="text-blue-500 shadow-md p-4" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		// Tailwind filter classes
		{
			code: `<div className="blur-sm" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="brightness-75" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="contrast-125" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="drop-shadow-lg" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="grayscale" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="hue-rotate-90" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="invert" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="saturate-150" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		{
			code: `<div className="sepia" />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		// JSX Expression Container
		{
			code: `<div className={"shadow-lg"} />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
		// Template literal
		{
			code: `<div className={\`shadow-lg \${variant}\`} />`,
			errors: [
				{
					messageId: 'SlowCssProperty',
				},
			],
		},
	],
});
