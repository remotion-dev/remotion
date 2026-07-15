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
		hiddenFromList: false,
	},
	amount: {
		type: 'number',
		default: 1,
		hiddenFromList: false,
	},
	position: {
		type: 'uv-coordinate',
		default: [0, 0.5],
	},
	colors: {
		type: 'array',
		item: {
			type: 'color',
		},
		default: undefined,
		minLength: 2,
		newItemDefault: '#ff0000',
		keyframable: false,
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

test('updateEffectProps writes uv-coordinate tuples', () => {
	const input = buildInput('[tint({color: "red"})]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'position', value: [0.25, 0.75], defaultValue: null},
		schema: tintSchema,
	});

	expect(serialized).toContain('position: [0.25,0.75]');
});

test('updateEffectProps writes array values', () => {
	const input = buildInput('[tint({color: "red"})]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {
			key: 'colors',
			value: ['#ff0000', '#00ff00'],
			defaultValue: null,
		},
		schema: tintSchema,
	});

	expect(serialized).toContain('colors: ["#ff0000","#00ff00"]');
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
		'[tint({colorMode: "solid", dotColor: "red  blue", opacity: 0.5})]',
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
				hiddenFromList: false,
			},
		},
	});

	expect(serialized).toContain('colorMode: "source"');
	expect(serialized).not.toContain('dotColor');
	expect(serialized).toContain('opacity: 0.5');
	expect(removedProps).toEqual([{key: 'dotColor', valueString: '"red  blue"'}]);
});

test('updateEffectProps writes keyframed effect params from clipboard data', () => {
	const input = buildInput('[tint({color: "red"})]');
	const {serialized, newValueString} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {
			key: 'opacity',
			effectParam: {
				type: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 0},
					{frame: 30, value: 1},
				],
				easing: [{type: 'bezier', x1: 0.1, y1: 0.2, x2: 0.3, y2: 0.4}],
				clamping: {left: 'clamp', right: 'extend'},
				output: 'perceptual-scale',
				posterize: 2,
			},
			defaultValue: null,
		},
		schema: tintSchema,
	});

	expect(serialized).toContain('Easing');
	expect(serialized).toContain('interpolate');
	expect(serialized).toContain('useCurrentFrame');
	expect(serialized).toContain('from "remotion"');
	expect(serialized).toContain('const frame = useCurrentFrame();');
	expect(serialized).toContain(
		'opacity: interpolate(frame, [0, 30], [0, 1], {',
	);
	expect(serialized).toContain('extrapolateLeft: "clamp"');
	expect(serialized).toContain('output: "perceptual-scale"');
	expect(serialized).toContain('easing: [Easing.bezier(0.1, 0.2, 0.3, 0.4)]');
	expect(serialized).toContain('posterize: 2');
	expect(newValueString).toContain('interpolate(frame, [0, 30], [0, 1]');
});
