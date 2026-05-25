import {expect, test} from 'bun:test';
import {updateEffectPropsAst} from '../codemods/update-effect-props/update-effect-props';
import {lineColumnToNodePath} from './test-utils';

const tintSchema = {
	color: {
		type: 'color',
		default: 'black',
	},
	opacity: {
		type: 'number',
		default: 1,
	},
	amount: {
		type: 'number',
		default: 1,
	},
} as const;

const buildInput = (
	effects: string,
) => `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {tint} from '@remotion/effects/tint';

export const Comp = () => {
\treturn (
\t\t<HtmlInCanvas effects={${effects}}>
\t\t\thi
\t\t</HtmlInCanvas>
\t);
};
`;

test('updateEffectProps updates an existing prop on the right effect', () => {
	const input = buildInput('[tint({color: "red", opacity: 0.5})]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'opacity', value: 0.8, defaultValue: null},
		schema: tintSchema,
	});

	expect(serialized).toContain('opacity: 0.8');
	expect(serialized).not.toContain('opacity: 0.5');
});

test('updateEffectProps adds a missing prop', () => {
	const input = buildInput('[tint({color: "red"})]');
	const {serialized, effectCallee} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'opacity', value: 0.25, defaultValue: null},
		schema: tintSchema,
	});

	expect(effectCallee).toBe('tint');
	expect(serialized).toContain('opacity: 0.25');
	expect(serialized).toContain('color: "red"');
});

test('updateEffectProps removes a prop equal to default', () => {
	const input = buildInput('[tint({color: "red", opacity: 0.5})]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'opacity', value: 1, defaultValue: 1},
		schema: tintSchema,
	});

	expect(serialized).not.toContain('opacity:');
	expect(serialized).toContain('color: "red"');
});

test('updateEffectProps targets the correct effect by index when there are multiple', () => {
	const input = buildInput(
		'[tint({color: "red"}), tint({color: "green", opacity: 0.4})]',
	);
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 1,
		update: {key: 'opacity', value: 0.9, defaultValue: null},
		schema: tintSchema,
	});

	expect(serialized).toContain('opacity: 0.9');
	expect(serialized).toContain('color: "red"');
	expect(serialized).toContain('color: "green"');
});

test('updateEffectProps throws when effect index is out of range', () => {
	const input = buildInput('[tint({color: "red"})]');
	expect(() => {
		updateEffectPropsAst({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 6),
			effectIndex: 5,
			update: {key: 'opacity', value: 0.5, defaultValue: null},
			schema: tintSchema,
		});
	}).toThrow(/not-found/);
});

test('updateEffectProps inserts object literal when effect has no arguments', () => {
	const input = buildInput('[tint()]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'amount', value: 0.5, defaultValue: null},
		schema: tintSchema,
	});

	expect(serialized).toContain('amount: 0.5');
	expect(serialized).toMatch(/tint\s*\(\s*\{/);
});

test('updateEffectProps throws when first arg is not an object literal', () => {
	const input = buildInput('[tint(getParams())]');
	expect(() => {
		updateEffectPropsAst({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 6),
			effectIndex: 0,
			update: {key: 'opacity', value: 0.5, defaultValue: null},
			schema: tintSchema,
		});
	}).toThrow(/computed/);
});

test('updateEffectProps removes props from inactive enum variants', () => {
	const input = buildInput(
		'[tint({colorMode: "solid", dotColor: "red", opacity: 0.5})]',
	);
	const {serialized, removedProps} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'colorMode', value: 'source', defaultValue: 'solid'},
		schema: {
			colorMode: {
				type: 'enum',
				default: 'solid',
				variants: {
					solid: {
						dotColor: {
							type: 'color',
							default: 'red',
						},
					},
					source: {},
				},
			},
			opacity: {
				type: 'number',
				default: 1,
			},
		},
	});

	expect(serialized).toContain('colorMode: "source"');
	expect(serialized).not.toContain('dotColor');
	expect(serialized).toContain('opacity: 0.5');
	expect(removedProps).toEqual([{key: 'dotColor', valueString: '"red"'}]);
});
