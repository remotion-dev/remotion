import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {parseAst} from '../codemods/parse-ast';
import {
	computeSequencePropsStatus,
	computeSequencePropsStatusFromContent,
	lineColumnToNodePath,
} from '../preview-server/routes/can-update-sequence-props';

const getNodePath = (filePath: string, line: number) => {
	const content = readFileSync(filePath, 'utf-8');
	const ast = parseAst(content);
	const result = lineColumnToNodePath(ast, line);
	if (!result) {
		throw new Error(`No JSX element found at line ${line} in ${filePath}`);
	}

	return result;
};

const getNodePathFromContent = (content: string, line: number) => {
	const ast = parseAst(content);
	const result = lineColumnToNodePath(ast, line);
	if (!result) {
		throw new Error(`No JSX element found at line ${line}`);
	}

	return result;
};

test('canUpdateSequenceProps should flag computed props', () => {
	const filePath = path.join(__dirname, 'snapshots', 'light-leak-computed.tsx');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 8),
		keys: ['durationInFrames', 'seed', 'hueShift', 'nonExistentProp'],
		effects: [],
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

test('computeSequencePropsStatus should return keyframes for interpolated color props', () => {
	const input = `import React from 'react';
import {Solid, interpolateColors, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Solid color={interpolateColors(frame, [0, 100], ['red', 'blue'])} width={100} height={100} />
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		keys: ['color'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props.color).toEqual({
		canUpdate: false,
		reason: 'keyframed',
		interpolationFunction: 'interpolateColors',
		keyframes: [
			{frame: 0, value: 'red'},
			{frame: 100, value: 'blue'},
		],
		easing: ['linear'],
		clamping: {left: 'clamp', right: 'clamp'},
	});
});

test('computeSequencePropsStatus should explain why outside-project file reads were blocked', () => {
	const remotionRoot = path.join(__dirname, 'snapshots');
	const fileName = '../outside.tsx';
	const absolutePath = path.resolve(remotionRoot, fileName);

	expect(() =>
		computeSequencePropsStatus({
			fileName,
			nodePath: [],
			keys: [],
			effects: [],
			remotionRoot,
		}),
	).toThrow(
		`Cannot read a file outside the project: "${fileName}" resolves to "${absolutePath}", but the project root is "${remotionRoot}".`,
	);
});

test('computeSequencePropsStatus should detect static nested props', () => {
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.tsx');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 7),
		keys: ['style.opacity', 'style.scale'],
		effects: [],
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
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.tsx');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 8),
		keys: ['style.opacity', 'style.scale'],
		effects: [],
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
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.tsx');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 9),
		keys: ['style.opacity'],
		effects: [],
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
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.tsx');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 7),
		keys: ['style.rotate'],
		effects: [],
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
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.tsx');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 10),
		keys: ['style.opacity'],
		effects: [],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.opacity']).toEqual({
		canUpdate: true,
		codeValue: undefined,
	});
});

test('computeSequencePropsStatus should return keyframes for interpolated style props', () => {
	const filePath = path.join(__dirname, 'snapshots', 'keyframed-props.tsx');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 8),
		keys: ['style.scale'],
		effects: [],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toEqual({
		canUpdate: false,
		reason: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: 2},
			{frame: 100, value: 4},
		],
		easing: ['linear'],
		clamping: {left: 'extend', right: 'extend'},
	});
});

test('computeSequencePropsStatus should parse easing arrays and clamping', () => {
	const input = `import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 50, 100], [1, 2, 3], {
\t\t\teasing: [Easing.bezier(0.1, 0.2, 0.3, 0.4), Easing.linear],
\t\t\textrapolateLeft: 'clamp',
\t\t\textrapolateRight: 'identity',
\t\t})}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		keys: ['style.scale'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toEqual({
		canUpdate: false,
		reason: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: 1},
			{frame: 50, value: 2},
			{frame: 100, value: 3},
		],
		easing: [[0.1, 0.2, 0.3, 0.4], 'linear'],
		clamping: {
			left: 'clamp',
			right: 'identity',
		},
	});
});

test('computeSequencePropsStatus should bail on unsupported easing expressions', () => {
	const input = `import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 100], [1, 3], {
\t\t\teasing: Easing.inOut(Easing.linear),
\t\t})}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		keys: ['style.scale'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toEqual({
		canUpdate: false,
		reason: 'computed',
	});
});
