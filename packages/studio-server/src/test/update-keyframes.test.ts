import {expect, test} from 'bun:test';
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
	expect(output).toContain('opacity: interpolate(frame, [25], [0.75])');
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
	expect(output).toContain('opacity: interpolate(frame, [0], [0.75])');
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

	expect(output).toContain('width={interpolate(frame, [11], [240])}');
	const status = computeSequencePropsStatusFromContent({
		fileContents: output,
		nodePath: updatedNodePath,
		keys: ['width'],
		effects: [],
	});
	expect(status.props.width).toEqual({
		canUpdate: true,
		codeValue: undefined,
		keyframed: true,
		interpolationFunction: 'interpolate',
		keyframes: [{frame: 11, value: 240}],
		easing: [],
		clamping: {left: 'extend', right: 'extend'},
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
		canUpdate: true,
		codeValue: 320,
		keyframed: false,
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
		canUpdate: true,
		codeValue: 'blue',
		keyframed: false,
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
