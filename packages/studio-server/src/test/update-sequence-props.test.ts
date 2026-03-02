import {expect, test} from 'bun:test';
import path from 'node:path';
import type {Expression} from '@babel/types';
import {parseAst} from '../codemods/parse-ast';
import {updateSequenceProps} from '../codemods/update-sequence-props';
import {
	extractStaticValue,
	isStaticValue,
} from '../preview-server/routes/can-update-sequence-props';
import {computeSequencePropsStatus} from '../preview-server/routes/can-update-sequence-props';

const parseExpression = (code: string): Expression => {
	const ast = parseAst(`a = ${code}`);
	const stmt = ast.program.body[0];
	if (
		stmt.type !== 'ExpressionStatement' ||
		stmt.expression.type !== 'AssignmentExpression'
	) {
		throw new Error('Unexpected AST');
	}

	return stmt.expression.right;
};

test('Static values should be detected as static', () => {
	expect(isStaticValue(parseExpression('42'))).toBe(true);
	expect(isStaticValue(parseExpression('"hello"'))).toBe(true);
	expect(isStaticValue(parseExpression('true'))).toBe(true);
	expect(isStaticValue(parseExpression('false'))).toBe(true);
	expect(isStaticValue(parseExpression('null'))).toBe(true);
	expect(isStaticValue(parseExpression('-1'))).toBe(true);
	expect(isStaticValue(parseExpression('[1, 2, 3]'))).toBe(true);
	expect(isStaticValue(parseExpression('{a: 1, b: "c"}'))).toBe(true);
	expect(isStaticValue(parseExpression('[]'))).toBe(true);
	expect(isStaticValue(parseExpression('{}'))).toBe(true);
});

test('Computed values should be detected as computed', () => {
	expect(isStaticValue(parseExpression('1 + 2'))).toBe(false);
	expect(isStaticValue(parseExpression('Math.random()'))).toBe(false);
	expect(isStaticValue(parseExpression('someVar'))).toBe(false);
	expect(isStaticValue(parseExpression('foo()'))).toBe(false);
	expect(isStaticValue(parseExpression('a ? b : c'))).toBe(false);
	// eslint-disable-next-line no-template-curly-in-string
	expect(isStaticValue(parseExpression('`template ${"x"}`'))).toBe(false);
});

test('extractStaticValue should extract values from AST nodes', () => {
	expect(extractStaticValue(parseExpression('42'))).toBe(42);
	expect(extractStaticValue(parseExpression('"hello"'))).toBe('hello');
	expect(extractStaticValue(parseExpression('true'))).toBe(true);
	expect(extractStaticValue(parseExpression('false'))).toBe(false);
	expect(extractStaticValue(parseExpression('null'))).toBe(null);
	expect(extractStaticValue(parseExpression('-1'))).toBe(-1);
	expect(extractStaticValue(parseExpression('[1, 2, 3]'))).toEqual([1, 2, 3]);
	expect(extractStaticValue(parseExpression('{a: 1, b: "c"}'))).toEqual({
		a: 1,
		b: 'c',
	});
	expect(extractStaticValue(parseExpression('[]'))).toEqual([]);
	expect(extractStaticValue(parseExpression('{}'))).toEqual({});
});

test('canUpdateSequenceProps should flag computed props', () => {
	const result = computeSequencePropsStatus({
		fileName: path.join(__dirname, 'snapshots', 'light-leak-computed.txt'),
		line: 8,
		keys: ['durationInFrames', 'seed', 'hueShift', 'nonExistentProp'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('Expected canUpdate to be true');
	}

	expect(result.props.durationInFrames).toEqual({
		canUpdate: true,
		codeValue: 60,
	});
	expect(result.props.hueShift).toEqual({canUpdate: true, codeValue: 30});
	expect(result.props.seed).toEqual({canUpdate: false, reason: 'computed'});
	expect(result.props.nonExistentProp).toEqual({
		canUpdate: true,
		codeValue: undefined,
	});
});

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
	const {output, oldValueString} = await updateSequenceProps({
		input: lightLeakInput,
		targetLine: 8,
		key: 'hueShift',
		value: 90,
		enumPaths: [],
		defaultValue: null,
	});

	expect(oldValueString).toBe('30');
	expect(output).toContain('hueShift={90}');
	// Second LightLeak on line 9 should be unchanged
	expect(output.split('\n')[8]).toContain('hueShift={30}');
});

test('updateSequenceProps should update durationInFrames', async () => {
	const {output, oldValueString} = await updateSequenceProps({
		input: lightLeakInput,
		targetLine: 9,
		key: 'durationInFrames',
		value: 120,
		enumPaths: [],
		defaultValue: null,
	});

	expect(oldValueString).toBe('60');
	expect(output.split('\n')[8]).toContain('durationInFrames={120}');
	// First LightLeak on line 8 should be unchanged
	expect(output.split('\n')[7]).toContain('durationInFrames={60}');
});

test('updateSequenceProps should add a new attribute', async () => {
	const {output, oldValueString} = await updateSequenceProps({
		input: lightLeakInput,
		targetLine: 9,
		key: 'speed',
		value: 2,
		enumPaths: [],
		defaultValue: null,
	});

	expect(oldValueString).toBe('');
	expect(output.split('\n')[8]).toContain('speed={2}');
});

test('updateSequenceProps should remove attribute when value equals default', async () => {
	const {output, oldValueString} = await updateSequenceProps({
		input: lightLeakInput,
		targetLine: 9,
		key: 'hueShift',
		value: 0,
		enumPaths: [],
		defaultValue: 0,
	});

	expect(oldValueString).toBe('30');
	expect(output.split('\n')[8]).not.toContain('hueShift');
	// First LightLeak should still have hueShift
	expect(output.split('\n')[7]).toContain('hueShift={30}');
});

test('updateSequenceProps should set boolean true as shorthand', async () => {
	const {output} = await updateSequenceProps({
		input: lightLeakInput,
		targetLine: 8,
		key: 'loop',
		value: true,
		enumPaths: [],
		defaultValue: false,
	});

	// true booleans become shorthand: `loop` not `loop={true}`
	expect(output.split('\n')[7]).toContain('loop');
	expect(output.split('\n')[7]).not.toContain('loop={true}');
});

test('updateSequenceProps should report oldValueString for computed expressions', async () => {
	const {oldValueString} = await updateSequenceProps({
		input: lightLeakInput,
		targetLine: 8,
		key: 'seed',
		value: 5,
		enumPaths: [],
		defaultValue: null,
	});

	expect(oldValueString).toBe('1 + 2');
});

test('updateSequenceProps should report default as oldValueString for missing attribute', async () => {
	const {oldValueString} = await updateSequenceProps({
		input: lightLeakInput,
		targetLine: 8,
		key: 'speed',
		value: 2,
		enumPaths: [],
		defaultValue: 1,
	});

	expect(oldValueString).toBe('1');
});

test('updateSequenceProps should throw for non-existent line', async () => {
	await expect(
		updateSequenceProps({
			input: lightLeakInput,
			targetLine: 999,
			key: 'hueShift',
			value: 90,
			enumPaths: [],
			defaultValue: null,
		}),
	).rejects.toThrow(
		'Could not find a JSX element at the specified line to update',
	);
});

// --- Nested prop (dotted key) tests ---

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
		targetLine: 7,
		key: 'style.opacity',
		value: 0.8,
		enumPaths: [],
		defaultValue: null,
	});

	expect(oldValueString).toBe('0.5');
	expect(output).toContain('opacity: 0.8');
	expect(output).toContain('scale: 2');
});

test('updateSequenceProps should add a nested property to existing object', async () => {
	const {output, oldValueString} = await updateSequenceProps({
		input: nestedInput,
		targetLine: 7,
		key: 'style.rotate',
		value: 45,
		enumPaths: [],
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
		targetLine: 8,
		key: 'style.opacity',
		value: 0.3,
		enumPaths: [],
		defaultValue: null,
	});

	expect(oldValueString).toBe('');
	expect(output).toContain('style={{');
	expect(output).toContain('opacity: 0.3');
});

test('updateSequenceProps should remove nested property when value equals default', async () => {
	const {output, oldValueString} = await updateSequenceProps({
		input: nestedInput,
		targetLine: 7,
		key: 'style.opacity',
		value: 1,
		enumPaths: [],
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
		targetLine: 4,
		key: 'style.opacity',
		value: 1,
		enumPaths: [],
		defaultValue: 1,
	});

	expect(oldValueString).toBe('0.5');
	expect(output).not.toContain('style');
});

test('updateSequenceProps should report default as oldValueString for missing nested property', async () => {
	const {oldValueString} = await updateSequenceProps({
		input: nestedInput,
		targetLine: 8,
		key: 'style.opacity',
		value: 0.5,
		enumPaths: [],
		defaultValue: 1,
	});

	expect(oldValueString).toBe('1');
});

// --- computeSequencePropsStatus nested prop tests ---

test('computeSequencePropsStatus should detect static nested props', () => {
	const result = computeSequencePropsStatus({
		fileName: path.join(__dirname, 'snapshots', 'nested-props.txt'),
		line: 7,
		keys: ['style.opacity', 'style.scale'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.opacity']).toEqual({
		canUpdate: true,
		codeValue: 0.5,
	});
	expect(result.props['style.scale']).toEqual({
		canUpdate: true,
		codeValue: 2,
	});
});

test('computeSequencePropsStatus should flag computed nested props', () => {
	const result = computeSequencePropsStatus({
		fileName: path.join(__dirname, 'snapshots', 'nested-props.txt'),
		line: 8,
		keys: ['style.opacity', 'style.scale'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	// opacity uses getOpacity() — computed
	expect(result.props['style.opacity']).toEqual({
		canUpdate: false,
		reason: 'computed',
	});
	// scale is static
	expect(result.props['style.scale']).toEqual({
		canUpdate: true,
		codeValue: 2,
	});
});

test('computeSequencePropsStatus should flag computed when parent is not an object', () => {
	const result = computeSequencePropsStatus({
		fileName: path.join(__dirname, 'snapshots', 'nested-props.txt'),
		line: 9,
		keys: ['style.opacity'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	// style={dynamicStyles} — entire parent is computed
	expect(result.props['style.opacity']).toEqual({
		canUpdate: false,
		reason: 'computed',
	});
});

test('computeSequencePropsStatus should report unset nested props as undefined', () => {
	const result = computeSequencePropsStatus({
		fileName: path.join(__dirname, 'snapshots', 'nested-props.txt'),
		line: 7,
		keys: ['style.rotate'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.rotate']).toEqual({
		canUpdate: true,
		codeValue: undefined,
	});
});

test('computeSequencePropsStatus should report unset when parent attribute missing', () => {
	const result = computeSequencePropsStatus({
		fileName: path.join(__dirname, 'snapshots', 'nested-props.txt'),
		line: 10,
		keys: ['style.opacity'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.opacity']).toEqual({
		canUpdate: true,
		codeValue: undefined,
	});
});
