import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/slow-css-property';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
});

ruleTester.run('slow-css-property', rule, {
	valid: [
		`const style = {color: "red"}`,
		`const style = {backgroundColor: "blue"}`,
		`const style = {margin: 10}`,
		`const style = {border: "1px solid black"}`,
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
	],
});
