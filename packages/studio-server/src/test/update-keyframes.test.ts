import {expect, test} from 'bun:test';
import {
	updateEffectKeyframesAst,
	updateSequenceKeyframes,
} from '../codemods/update-keyframes/update-keyframes';
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
	expect(output).toContain('opacity: interpolate(frame, [0, 25], [0.5, 0.75])');
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
	expect(output).toContain(
		"color={interpolateColors(frame, [0, 50], ['red', 'blue'])}",
	);
});

test('updateSequenceKeyframes collapses to a static value when one keyframe remains', async () => {
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
	expect(output).toContain('style={{scale: 4}}');
	expect(output).not.toContain('scale: interpolate');
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

test('updateEffectKeyframes collapses an effect prop to a static value', () => {
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

	expect(serialized).toContain('amount: 0.2');
	expect(serialized).not.toContain('amount: interpolate');
});
