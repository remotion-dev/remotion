import {expect, test} from 'bun:test';
import type {SequenceSchema} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	updateEffectKeyframesAst,
	updateSequenceKeyframes,
} from '../codemods/update-keyframes/update-keyframes';
import {computeSequencePropsStatusFromContent} from '../preview-server/routes/can-update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const sequenceInput = `import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 100], [2, 4])}} />
\t\t\t<div style={{opacity: 0.5}} />
\t\t</AbsoluteFill>
\t);
};
`;

const colorInput = `import React from 'react';
import {Solid, interpolateColors, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Solid color={interpolateColors(frame, [0, 100], ['red', 'blue'])} width={100} height={100} />
\t);
};
`;

const translateSchema = {
	'style.translate': {
		type: 'translate',
		default: '0px 0px',
	},
} satisfies SequenceSchema;

const rotateSchema = {
	'style.rotate': {
		type: 'rotation-css',
		default: '0deg',
	},
} satisfies SequenceSchema;

const translateInput = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{translate: '0px 59px'}} />
\t\t</AbsoluteFill>
\t);
};
`;

const rotateInput = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{rotate: '19deg'}} />
\t\t</AbsoluteFill>
\t);
};
`;

const effectInput = `import {tint} from '@remotion/effects/tint';
import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {interpolate, useCurrentFrame} from 'remotion';

export const Comp = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<HtmlInCanvas
\t\t\teffects={[tint({amount: interpolate(frame, [0, 50, 100], [0.2, 0.5, 0.8])})]}
\t\t>
\t\t\thi
\t\t</HtmlInCanvas>
\t);
};
`;

const getLine = (input: string, needle: string): number => {
	const lineIndex = input
		.split('\n')
		.findIndex((line) => line.includes(needle));
	if (lineIndex === -1) {
		throw new Error(`Could not find line containing ${needle}`);
	}

	return lineIndex + 1;
};

test('updateSequenceKeyframes adds a keyframe to an existing interpolation', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: sequenceInput,
		nodePath: lineColumnToNodePath(
			sequenceInput,
			getLine(sequenceInput, 'scale'),
		),
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'add', frame: 50, value: 3},
			},
		],
	});

	expect(oldValueStrings).toEqual(['interpolate(frame, [0, 100], [2, 4])']);
	expect(output).toContain(
		'scale: interpolate(frame, [0, 50, 100], [2, 3, 4])',
	);
});

test('updateSequenceKeyframes updates a keyframe at the same frame', async () => {
	const {output, oldValueStrings, newValueStrings} =
		await updateSequenceKeyframes({
			input: sequenceInput,
			nodePath: lineColumnToNodePath(
				sequenceInput,
				getLine(sequenceInput, 'scale'),
			),
			updates: [
				{
					key: 'style.scale',
					operation: {type: 'add', frame: 100, value: 5},
				},
			],
		});

	expect(oldValueStrings).toEqual(['interpolate(frame, [0, 100], [2, 4])']);
	expect(newValueStrings).toEqual(['interpolate(frame, [0, 100], [2, 5])']);
	expect(output).toContain('scale: interpolate(frame, [0, 100], [2, 5])');
});

test('updateSequenceKeyframes converts a static value to an interpolation', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: sequenceInput,
		nodePath: lineColumnToNodePath(
			sequenceInput,
			getLine(sequenceInput, 'opacity'),
		),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 25, value: 0.75},
			},
		],
	});

	expect(oldValueStrings).toEqual(['0.5']);
	expect(output).toContain('opacity: interpolate(frame, [25], [0.75], {');
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
});

test('updateSequenceKeyframes rejects non-keyframable fields', async () => {
	const schema = {
		'style.opacity': {
			type: 'number',
			default: 1,
			hiddenFromList: false,
			keyframable: false,
		},
	} satisfies SequenceSchema;

	await expect(
		updateSequenceKeyframes({
			input: sequenceInput,
			nodePath: lineColumnToNodePath(
				sequenceInput,
				getLine(sequenceInput, 'opacity'),
			),
			schema,
			updates: [
				{
					key: 'style.opacity',
					operation: {type: 'add', frame: 25, value: 0.75},
				},
			],
		}),
	).rejects.toThrow(/not keyframable/);
});

test('updateSequenceKeyframes converts a static value to a single-keyframe interpolation at frame 0', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: sequenceInput,
		nodePath: lineColumnToNodePath(
			sequenceInput,
			getLine(sequenceInput, 'opacity'),
		),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 0, value: 0.75},
			},
		],
	});

	expect(oldValueStrings).toEqual(['0.5']);
	expect(output).toContain('opacity: interpolate(frame, [0], [0.75], {');
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
});

test('updateSequenceKeyframes adds a missing nested prop before keyframing it', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 0.5}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		schema: NoReactInternals.sequenceSchema,
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'add', frame: 30, value: 2},
			},
		],
	});

	expect(oldValueStrings).toEqual(['1']);
	expect(output).toContain('opacity: 0.5');
	expect(output).toContain('scale: interpolate(frame, [30], [2], {');
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
});

test('updateSequenceKeyframes adds a keyframe to an existing color interpolation', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: colorInput,
		nodePath: lineColumnToNodePath(colorInput, getLine(colorInput, '<Solid')),
		updates: [
			{
				key: 'color',
				operation: {type: 'add', frame: 50, value: '#00ff00'},
			},
		],
	});

	expect(oldValueStrings).toEqual([
		"interpolateColors(frame, [0, 100], ['red', 'blue'])",
	]);
	expect(output).toContain(
		"color={interpolateColors(frame, [0, 50, 100], ['red', '#00ff00', 'blue'])}",
	);
});

test('updateSequenceKeyframes converts a static string value to a color interpolation', async () => {
	const input = colorInput.replace(
		"interpolateColors(frame, [0, 100], ['red', 'blue'])",
		"'red'",
	);
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, '<Solid')),
		updates: [
			{
				key: 'color',
				operation: {type: 'add', frame: 50, value: 'blue'},
			},
		],
	});

	expect(oldValueStrings).toEqual(["'red'"]);
	expect(output).toContain("color={interpolateColors(frame, [50], ['blue'])}");
});

test('updateSequenceKeyframes converts static translate to interpolate', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: translateInput,
		nodePath: lineColumnToNodePath(
			translateInput,
			getLine(translateInput, 'translate'),
		),
		schema: translateSchema,
		updates: [
			{
				key: 'style.translate',
				operation: {type: 'add', frame: 44, value: '0px 59px'},
			},
		],
	});

	expect(oldValueStrings).toEqual(["'0px 59px'"]);
	expect(output).toContain(
		"translate: interpolate(frame, [44], ['0px 59px'], {",
	);
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
	expect(output).toContain('interpolate');
});

test('updateSequenceKeyframes adds a missing nested prop before keyframing it', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 1}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output, oldValueStrings, updatedNodePath} =
		await updateSequenceKeyframes({
			input,
			nodePath: lineColumnToNodePath(input, getLine(input, '<div')),
			schema: translateSchema,
			updates: [
				{
					key: 'style.translate',
					operation: {type: 'add', frame: 44, value: '100px 20px'},
				},
			],
		});

	expect(oldValueStrings).toEqual(['"0px 0px"']);
	expect(output).toContain(
		"translate: interpolate(frame, [44], ['100px 20px'], {",
	);
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
	expect(output).toContain('useCurrentFrame');
	expect(output).toContain('interpolate');
	const status = computeSequencePropsStatusFromContent({
		fileContents: output,
		nodePath: updatedNodePath,
		keys: ['style.translate'],
		effects: [],
	});
	expect(status.props['style.translate']).toEqual({
		status: 'keyframed',
		codeValue: undefined,
		interpolationFunction: 'interpolate',
		keyframes: [{frame: 44, value: '100px 20px'}],
		easing: [],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: undefined,
	});
});

test('updateSequenceKeyframes migrates translate away from interpolateColors', async () => {
	const input = translateInput
		.replace(
			"import {AbsoluteFill} from 'remotion';",
			"import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';",
		)
		.replace('return (', 'const frame = useCurrentFrame();\n\treturn (')
		.replace(
			"translate: '0px 59px'",
			"translate: interpolateColors(frame, [44], ['0px 59px'])",
		);
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'translate')),
		schema: translateSchema,
		updates: [
			{
				key: 'style.translate',
				operation: {type: 'add', frame: 88, value: '100px 20px'},
			},
		],
	});

	expect(oldValueStrings).toEqual([
		"interpolateColors(frame, [44], ['0px 59px'])",
	]);
	expect(output).toContain('translate: interpolate(');
	expect(output).toContain('[44, 88]');
	expect(output).toContain("['0px 59px', '100px 20px']");
});

test('updateSequenceKeyframes converts static rotate to interpolate', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: rotateInput,
		nodePath: lineColumnToNodePath(rotateInput, getLine(rotateInput, 'rotate')),
		schema: rotateSchema,
		updates: [
			{
				key: 'style.rotate',
				operation: {type: 'add', frame: 55, value: '19deg'},
			},
		],
	});

	expect(oldValueStrings).toEqual(["'19deg'"]);
	expect(output).toContain("rotate: interpolate(frame, [55], ['19deg'], {");
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
	expect(output).toContain('interpolate');
});

test('updateSequenceKeyframes migrates rotate away from interpolateColors', async () => {
	const input = rotateInput
		.replace(
			"import {AbsoluteFill} from 'remotion';",
			"import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';",
		)
		.replace('return (', 'const frame = useCurrentFrame();\n\treturn (')
		.replace(
			"rotate: '19deg'",
			"rotate: interpolateColors(frame, [55], ['19deg'])",
		);
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'rotate')),
		schema: rotateSchema,
		updates: [
			{
				key: 'style.rotate',
				operation: {type: 'add', frame: 68, value: '23deg'},
			},
		],
	});

	expect(oldValueStrings).toEqual([
		"interpolateColors(frame, [55], ['19deg'])",
	]);
	expect(output).toContain('rotate: interpolate(');
	expect(output).toContain('[55, 68]');
	expect(output).toContain("['19deg', '23deg']");
});

test('updateSequenceKeyframes returns a node path that still resolves after inserting a frame hook', async () => {
	const input = `import {starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill, Solid} from 'remotion';

const CenteredSolid: React.FC = () => {
\treturn (
\t\t<AbsoluteFill style={{perspective: 300}}>
\t\t\t<Solid
\t\t\t\twidth={240}
\t\t\t\theight={240}
\t\t\t\tcolor={'#d8d8d8'}
\t\t\t\tstyle={{
\t\t\t\t\tposition: 'absolute',
\t\t\t\t\tleft: '50%',
\t\t\t\t\ttop: '50%',
\t\t\t\t\ttransform: 'translate(-50%, -50%) rotateX(40deg)',
\t\t\t\t\trotate: '40deg',
\t\t\t\t\tscale: 2.42,
\t\t\t\t\ttranslate: '0px 191px',
\t\t\t\t}}
\t\t\t\teffects={[starburst({rays: 10, colors: ['#eeeeee', '#bbbbbb']})]}
\t\t\t/>
\t\t</AbsoluteFill>
\t);
};

export default CenteredSolid;
`;
	const nodePath = lineColumnToNodePath(input, getLine(input, '<Solid'));
	const {output, updatedNodePath} = await updateSequenceKeyframes({
		input,
		nodePath,
		updates: [
			{
				key: 'width',
				operation: {type: 'add', frame: 11, value: 240},
			},
		],
	});

	expect(updatedNodePath).toEqual(nodePath);
	expect(output).toContain('width={interpolate(frame, [11], [240], {');
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
	const status = computeSequencePropsStatusFromContent({
		fileContents: output,
		nodePath: updatedNodePath,
		keys: ['width'],
		effects: [],
	});
	expect(status.props.width).toEqual({
		status: 'keyframed',
		codeValue: undefined,
		interpolationFunction: 'interpolate',
		keyframes: [{frame: 11, value: 240}],
		easing: [],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: undefined,
	});
});

test('updateSequenceKeyframes keeps an interpolation when one keyframe remains', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: sequenceInput,
		nodePath: lineColumnToNodePath(
			sequenceInput,
			getLine(sequenceInput, 'scale'),
		),
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'remove', frame: 0},
			},
		],
	});

	expect(oldValueStrings).toEqual(['interpolate(frame, [0, 100], [2, 4])']);
	expect(output).toContain('style={{scale: interpolate(frame, [100], [4])}}');
});

test('updateSequenceKeyframes converts the last keyframe to a static value', async () => {
	const input = sequenceInput.replace(
		'interpolate(frame, [0, 100], [2, 4])',
		'interpolate(frame, [12], [320])',
	);
	const {output, oldValueStrings, newValueStrings, updatedNodePath} =
		await updateSequenceKeyframes({
			input,
			nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
			updates: [
				{
					key: 'style.scale',
					operation: {type: 'remove', frame: 12},
				},
			],
		});

	expect(oldValueStrings).toEqual(['interpolate(frame, [12], [320])']);
	expect(newValueStrings).toEqual(['320']);
	expect(output).toContain('style={{scale: 320}}');
	const status = computeSequencePropsStatusFromContent({
		fileContents: output,
		nodePath: updatedNodePath,
		keys: ['style.scale'],
		effects: [],
	});
	expect(status.props['style.scale']).toEqual({
		status: 'static',
		codeValue: 320,
	});
});

test('updateSequenceKeyframes keeps a color interpolation when one keyframe remains', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: colorInput,
		nodePath: lineColumnToNodePath(colorInput, getLine(colorInput, '<Solid')),
		updates: [
			{
				key: 'color',
				operation: {type: 'remove', frame: 0},
			},
		],
	});

	expect(oldValueStrings).toEqual([
		"interpolateColors(frame, [0, 100], ['red', 'blue'])",
	]);
	expect(output).toContain("color={interpolateColors(frame, [100], ['blue'])}");
});

test('updateEffectKeyframes converts a static value to a clamped interpolation', () => {
	const input = effectInput.replace(
		'interpolate(frame, [0, 50, 100], [0.2, 0.5, 0.8])',
		'0.2',
	);
	const {serialized, oldValueStrings} = updateEffectKeyframesAst({
		input,
		sequenceNodePath: lineColumnToNodePath(
			input,
			getLine(input, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [
			{
				key: 'amount',
				operation: {type: 'add', frame: 40, value: 0.6},
			},
		],
	});

	expect(oldValueStrings).toEqual(['0.2']);
	expect(serialized).toContain('amount: interpolate(frame, [40], [0.6], {');
	expect(serialized).toContain('extrapolateLeft: "clamp"');
	expect(serialized).toContain('extrapolateRight: "clamp"');
});

test('updateSequenceKeyframes converts the last color keyframe to a static value', async () => {
	const input = colorInput.replace(
		"interpolateColors(frame, [0, 100], ['red', 'blue'])",
		"interpolateColors(frame, [15], ['blue'])",
	);
	const {output, oldValueStrings, newValueStrings, updatedNodePath} =
		await updateSequenceKeyframes({
			input,
			nodePath: lineColumnToNodePath(input, getLine(input, '<Solid')),
			updates: [
				{
					key: 'color',
					operation: {type: 'remove', frame: 15},
				},
			],
		});

	expect(oldValueStrings).toEqual(["interpolateColors(frame, [15], ['blue'])"]);
	expect(newValueStrings).toEqual(["'blue'"]);
	expect(output).toContain("color={'blue'}");
	const status = computeSequencePropsStatusFromContent({
		fileContents: output,
		nodePath: updatedNodePath,
		keys: ['color'],
		effects: [],
	});
	expect(status.props.color).toEqual({
		status: 'static',
		codeValue: 'blue',
	});
});

test('updateEffectKeyframes removes a keyframe from an effect prop interpolation', () => {
	const {serialized, oldValueStrings, effectCallee} = updateEffectKeyframesAst({
		input: effectInput,
		sequenceNodePath: lineColumnToNodePath(
			effectInput,
			getLine(effectInput, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [
			{
				key: 'amount',
				operation: {type: 'remove', frame: 50},
			},
		],
	});

	expect(effectCallee).toBe('tint');
	expect(oldValueStrings).toEqual([
		'interpolate(frame, [0, 50, 100], [0.2, 0.5, 0.8])',
	]);
	expect(serialized).toContain(
		'amount: interpolate(frame, [0, 100], [0.2, 0.8])',
	);
});

test('updateEffectKeyframes keeps an effect prop interpolation with one keyframe', () => {
	const input = effectInput.replace(
		'interpolate(frame, [0, 50, 100], [0.2, 0.5, 0.8])',
		'interpolate(frame, [0, 100], [0.2, 0.8])',
	);
	const {serialized} = updateEffectKeyframesAst({
		input,
		sequenceNodePath: lineColumnToNodePath(
			input,
			getLine(input, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [
			{
				key: 'amount',
				operation: {type: 'remove', frame: 100},
			},
		],
	});

	expect(serialized).toContain('amount: interpolate(frame, [0], [0.2])');
});

test('updateEffectKeyframes converts the last effect keyframe to a static value', () => {
	const input = effectInput.replace(
		'interpolate(frame, [0, 50, 100], [0.2, 0.5, 0.8])',
		'interpolate(frame, [40], [0.6])',
	);
	const {serialized, oldValueStrings, newValueStrings, effectCallee} =
		updateEffectKeyframesAst({
			input,
			sequenceNodePath: lineColumnToNodePath(
				input,
				getLine(input, '<HtmlInCanvas'),
			),
			effectIndex: 0,
			updates: [
				{
					key: 'amount',
					operation: {type: 'remove', frame: 40},
				},
			],
		});

	expect(effectCallee).toBe('tint');
	expect(oldValueStrings).toEqual(['interpolate(frame, [40], [0.6])']);
	expect(newValueStrings).toEqual(['0.6']);
	expect(serialized).toContain('amount: 0.6');
});
