import {expect, test} from 'bun:test';
import {Internals} from 'remotion';
import {updateSequenceProps} from '../codemods/update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const lightLeakInput = `import {LightLeak} from '@remotion/light-leaks';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const LightLeakExample: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<LightLeak durationInFrames={60} seed={1 + 2} hueShift={30} />
			<LightLeak durationInFrames={60} seed={3} hueShift={30} />
		</AbsoluteFill>
	);
};
`;

test('updateSequenceProps should update a number value', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 8),
		updates: [{key: 'hueShift', value: 90, defaultValue: null}],
		schema: Internals.sequenceSchema,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('30');
	expect(output).toContain('hueShift={90}');
	// Second LightLeak on line 9 should be unchanged
	expect(output.split('\n')[8]).toContain('hueShift={30}');
});

test('updateSequenceProps should update durationInFrames', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 9),
		updates: [{key: 'durationInFrames', value: 120, defaultValue: null}],
		schema: Internals.sequenceSchema,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('60');
	expect(output.split('\n')[8]).toContain('durationInFrames={120}');
	// First LightLeak on line 8 should be unchanged
	expect(output.split('\n')[7]).toContain('durationInFrames={60}');
});

test('updateSequenceProps should add a new attribute', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 9),
		updates: [{key: 'speed', value: 2, defaultValue: null}],
		schema: Internals.sequenceSchema,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('');
	expect(output.split('\n')[8]).toContain('speed={2}');
});

test('updateSequenceProps should remove attribute when value equals default', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 9),
		updates: [{key: 'hueShift', value: 0, defaultValue: 0}],
		schema: Internals.sequenceSchema,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('30');
	expect(output.split('\n')[8]).not.toContain('hueShift');
	// First LightLeak should still have hueShift
	expect(output.split('\n')[7]).toContain('hueShift={30}');
});

test('updateSequenceProps should set boolean true as shorthand', async () => {
	const {output} = await updateSequenceProps({
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 8),
		updates: [{key: 'loop', value: true, defaultValue: false}],
		schema: Internals.sequenceSchema,
	});

	// true booleans become shorthand: `loop` not `loop={true}`
	expect(output.split('\n')[7]).toContain('loop');
	expect(output.split('\n')[7]).not.toContain('loop={true}');
});

test('updateSequenceProps should report oldValueString for computed expressions', async () => {
	const {oldValueStrings} = await updateSequenceProps({
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 8),
		updates: [{key: 'seed', value: 5, defaultValue: null}],
		schema: Internals.sequenceSchema,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('1 + 2');
});

test('updateSequenceProps should report default as oldValueString for missing attribute', async () => {
	const {oldValueStrings} = await updateSequenceProps({
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 8),
		updates: [{key: 'speed', value: 2, defaultValue: 1}],
		schema: Internals.sequenceSchema,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('1');
});

test('updateSequenceProps should throw for non-existent nodePath', async () => {
	await expect(
		updateSequenceProps({
			input: lightLeakInput,
			nodePath: ['program', 'body', 999],
			updates: [{key: 'hueShift', value: 90, defaultValue: null}],
			schema: Internals.sequenceSchema,
		}),
	).rejects.toThrow(
		'Could not find a JSX element at the specified line to update',
	);
});
