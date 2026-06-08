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
		status: 'static',
		codeValue: 60,
	});
	expect(result.props.hueShift).toEqual({
		status: 'static',
		codeValue: 30,
	});
	expect(result.props.seed).toEqual({status: 'computed'});
	expect(result.props.nonExistentProp).toEqual({
		status: 'static',
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
		status: 'keyframed',
		interpolationFunction: 'interpolateColors',
		keyframes: [
			{frame: 0, value: 'red'},
			{frame: 100, value: 'blue'},
		],
		easing: ['linear'],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: undefined,
	});
});

test('computeSequencePropsStatus should return keyframes for interpolated translate props', () => {
	const input = `import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{translate: interpolate(frame, [0, 100], ['0px 59px', '100px 20px'])}} />
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		keys: ['style.translate'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.translate']).toEqual({
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: '0px 59px'},
			{frame: 100, value: '100px 20px'},
		],
		easing: ['linear'],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
	});
});

test('computeSequencePropsStatus should return keyframes for interpolated transformOrigin props', () => {
	const input = `import React from 'react';
import {Sequence, interpolateTransformOrigin, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{transformOrigin: interpolateTransformOrigin(frame, [0, 100], ['left top', 'right bottom'])}} />
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		keys: ['style.transformOrigin'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.transformOrigin']).toEqual({
		status: 'keyframed',
		interpolationFunction: 'interpolateTransformOrigin',
		keyframes: [
			{frame: 0, value: 'left top'},
			{frame: 100, value: 'right bottom'},
		],
		easing: ['linear'],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
	});
});

test('computeSequencePropsStatus should flag interpolations over computed values as computed', () => {
	const input = `import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\tconst progress = interpolate(frame, [0, 100], [0, 1], {posterize: 3});
\treturn (
\t\t<Sequence style={{translate: interpolate(progress, [0, 1], ['0px 59px', '100px 20px'])}} />
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 8),
		keys: ['style.translate'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.translate']).toEqual({
		status: 'computed',
	});
});

test('computeSequencePropsStatus should return keyframes for interpolated rotate props', () => {
	const input = `import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{rotate: interpolate(frame, [55, 68], ['19deg', '23deg'])}} />
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		keys: ['style.rotate'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.rotate']).toEqual({
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 55, value: '19deg'},
			{frame: 68, value: '23deg'},
		],
		easing: ['linear'],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
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
		status: 'static',
		codeValue: 0.5,
	});
	expect(result.props['style.scale']).toEqual({
		status: 'static',
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
		status: 'computed',
	});
	// scale is static
	expect(result.props['style.scale']).toEqual({
		status: 'static',
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
		status: 'computed',
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
		status: 'static',
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
		status: 'static',
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
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: 2},
			{frame: 100, value: 4},
		],
		easing: ['linear'],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
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
		status: 'keyframed',
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
		posterize: undefined,
	});
});

test('computeSequencePropsStatus should parse posterize on interpolated props', () => {
	const input = `import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 100], [1, 3], {posterize: 3})}} />
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
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: 1},
			{frame: 100, value: 3},
		],
		easing: ['linear'],
		clamping: {left: 'extend', right: 'extend'},
		posterize: 3,
	});
});

test('computeSequencePropsStatus should parse posterize on interpolated color props', () => {
	const input = `import React from 'react';
import {Solid, interpolateColors, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Solid color={interpolateColors(frame, [0, 100], ['red', 'blue'], {posterize: 3})} width={100} height={100} />
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
		status: 'keyframed',
		interpolationFunction: 'interpolateColors',
		keyframes: [
			{frame: 0, value: 'red'},
			{frame: 100, value: 'blue'},
		],
		easing: ['linear'],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: 3,
	});
});

test('computeSequencePropsStatus should bail on computed posterize expressions', () => {
	const input = `import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\tconst posterize = 3;
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 100], [1, 3], {posterize})}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 8),
		keys: ['style.scale'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toEqual({
		status: 'computed',
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
		status: 'computed',
	});
});
