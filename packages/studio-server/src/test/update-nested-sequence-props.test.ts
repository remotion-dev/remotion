import {expect, test} from 'bun:test';
import {updateSequenceProps} from '../codemods/update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const nestedInput = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
	return (
		<AbsoluteFill>
			<div style={{opacity: 0.5, scale: 2}} />
			<div />
		</AbsoluteFill>
	);
};
`;

test('updateSequenceProps should update a nested style property', async () => {
	const {output, oldValueString} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 7),
		key: 'style.opacity',
		value: 0.8,
		defaultValue: null,
	});

	expect(oldValueString).toBe('0.5');
	expect(output).toContain('opacity: 0.8');
	expect(output).toContain('scale: 2');
});

test('updateSequenceProps should add a nested property to existing object', async () => {
	const {output, oldValueString} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 7),
		key: 'style.rotate',
		value: 45,
		defaultValue: null,
	});

	expect(oldValueString).toBe('');
	expect(output).toContain('rotate: 45');
	// Existing properties should be preserved
	expect(output).toContain('opacity: 0.5');
	expect(output).toContain('scale: 2');
});

test('updateSequenceProps should create style attribute when it does not exist', async () => {
	const {output, oldValueString} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 8),
		key: 'style.opacity',
		value: 0.3,
		defaultValue: null,
	});

	expect(oldValueString).toBe('');
	expect(output).toContain('style={{');
	expect(output).toContain('opacity: 0.3');
});

test('updateSequenceProps should remove nested property when value equals default', async () => {
	const {output, oldValueString} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 7),
		key: 'style.opacity',
		value: 1,
		defaultValue: 1,
	});

	expect(oldValueString).toBe('0.5');
	expect(output).not.toContain('opacity');
	// Other properties should remain
	expect(output).toContain('scale: 2');
});

test('updateSequenceProps should remove entire style attribute when object becomes empty', async () => {
	// First remove scale, leaving only opacity
	const singlePropInput = `import React from 'react';

export const Example: React.FC = () => {
	return <div style={{opacity: 0.5}} />;
};
`;

	const {output, oldValueString} = await updateSequenceProps({
		input: singlePropInput,
		nodePath: lineColumnToNodePath(singlePropInput, 4),
		key: 'style.opacity',
		value: 1,
		defaultValue: 1,
	});

	expect(oldValueString).toBe('0.5');
	expect(output).not.toContain('style');
});

test('updateSequenceProps should report default as oldValueString for missing nested property', async () => {
	const {oldValueString} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 8),
		key: 'style.opacity',
		value: 0.5,
		defaultValue: 1,
	});

	expect(oldValueString).toBe('1');
});
