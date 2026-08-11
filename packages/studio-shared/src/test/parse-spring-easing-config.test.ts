import {expect, test} from 'bun:test';
import {
	DEFAULT_SPRING_EASING,
	parseSpringEasingConfig,
} from '../parse-spring-easing-config';

test('parseSpringEasingConfig returns default config for missing argument', () => {
	expect(parseSpringEasingConfig(undefined)).toEqual(DEFAULT_SPRING_EASING);
});

test('parseSpringEasingConfig parses a static spring config object', () => {
	expect(
		parseSpringEasingConfig({
			type: 'ObjectExpression',
			properties: [
				{
					type: 'ObjectProperty',
					computed: false,
					key: {type: 'Identifier', name: 'damping'},
					value: {type: 'NumericLiteral', value: 12},
				},
				{
					type: 'ObjectProperty',
					computed: false,
					key: {type: 'Identifier', name: 'mass'},
					value: {
						type: 'UnaryExpression',
						operator: '+',
						argument: {type: 'NumericLiteral', value: 1.5},
					},
				},
				{
					type: 'ObjectProperty',
					computed: false,
					key: {type: 'StringLiteral', value: 'stiffness'},
					value: {type: 'NumericLiteral', value: 180},
				},
				{
					type: 'ObjectProperty',
					computed: false,
					key: {type: 'Identifier', name: 'overshootClamping'},
					value: {type: 'BooleanLiteral', value: true},
				},
				{
					type: 'ObjectProperty',
					computed: false,
					key: {type: 'Identifier', name: 'allowTail'},
					value: {type: 'BooleanLiteral', value: true},
				},
				{
					type: 'ObjectProperty',
					computed: false,
					key: {type: 'Identifier', name: 'durationRestThreshold'},
					value: {type: 'NumericLiteral', value: 0.1},
				},
			],
		}),
	).toEqual({
		type: 'spring',
		allowTail: true,
		damping: 12,
		durationRestThreshold: 0.1,
		mass: 1.5,
		stiffness: 180,
		overshootClamping: true,
	});
});

test('parseSpringEasingConfig unwraps TypeScript casts', () => {
	expect(
		parseSpringEasingConfig({
			type: 'TSAsExpression',
			expression: {
				type: 'ObjectExpression',
				properties: [
					{
						type: 'ObjectProperty',
						computed: false,
						key: {type: 'Identifier', name: 'damping'},
						value: {
							type: 'TSAsExpression',
							expression: {type: 'NumericLiteral', value: 12},
						},
					},
					{
						type: 'ObjectProperty',
						computed: false,
						key: {type: 'Identifier', name: 'overshootClamping'},
						value: {
							type: 'TSAsExpression',
							expression: {type: 'BooleanLiteral', value: true},
						},
					},
				],
			},
		}),
	).toEqual({
		...DEFAULT_SPRING_EASING,
		damping: 12,
		overshootClamping: true,
	});
});

test('parseSpringEasingConfig rejects dynamic or invalid spring configs', () => {
	expect(parseSpringEasingConfig({type: 'Identifier', name: 'config'})).toBe(
		null,
	);

	expect(
		parseSpringEasingConfig({
			type: 'ObjectExpression',
			properties: [
				{
					type: 'ObjectProperty',
					computed: false,
					key: {type: 'Identifier', name: 'damping'},
					value: {type: 'NumericLiteral', value: 0},
				},
			],
		}),
	).toBe(null);

	expect(
		parseSpringEasingConfig({
			type: 'ObjectExpression',
			properties: [
				{
					type: 'SpreadElement',
					argument: {type: 'Identifier', name: 'config'},
				},
			],
		}),
	).toBe(null);
});
