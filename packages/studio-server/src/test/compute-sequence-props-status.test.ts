import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';
import {parseAst} from '../codemods/parse-ast';
import {JsxElementIdentityMismatchError} from '../preview-server/jsx-component-identity';
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

const videoConfigValues = {
	durationInFrames: 120,
	fps: 30,
	height: 1080,
	width: 1920,
};

test('computeSequencePropsStatus should treat staticFile() asset props as static', () => {
	const input = `import {Img, staticFile} from 'remotion';

export const Example = () => {
	return <Img src={staticFile('1.jpg')} />;
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 4),
		componentIdentity: null,
		keys: ['src'],
		assetKeys: ['src'],
		effects: [],
		videoConfigValues: null,
	});

	expect(result.props.src).toEqual({
		status: 'static',
		codeValue: `${NoReactInternals.FILE_TOKEN}1.jpg`,
	});
});

test('computeSequencePropsStatus should parse video config numeric expressions', () => {
	const input = `import React from 'react';
import {Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const Example: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	return (
		<Sequence
			premountFor={(2 * fps) as number}
			postmountFor={fps * 2.5}
			offset={-1 * fps}
			from={fps / 2}
			style={{scale: interpolate(frame, [0, 3.33 * fps, durationInFrames], [2, 3, 4])}}
		/>
	);
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 8),
		componentIdentity: null,
		keys: ['premountFor', 'postmountFor', 'offset', 'from', 'style.scale'],
		effects: [],
		videoConfigValues,
	});

	expect(result.props.premountFor).toEqual({
		status: 'static',
		codeValue: 60,
		numericExpression: {
			type: 'video-config-multiplication',
			identifier: 'fps',
			multiplier: 2,
			multiplicand: 30,
			factorPosition: 'left',
			value: 60,
		},
	});
	expect(result.props.postmountFor).toMatchObject({
		status: 'static',
		codeValue: 75,
		numericExpression: {
			type: 'video-config-multiplication',
			factorPosition: 'right',
		},
	});
	expect(result.props.from).toEqual({status: 'computed'});
	expect(result.props.offset).toMatchObject({
		status: 'static',
		codeValue: -30,
		numericExpression: {multiplier: -1},
	});
	expect(result.props['style.scale']).toMatchObject({
		status: 'keyframed',
		keyframes: [
			{frame: 0, value: 2},
			{
				frame: 99.9,
				value: 3,
				frameExpression: {
					type: 'video-config-multiplication',
					identifier: 'fps',
				},
			},
			{
				frame: 120,
				value: 4,
				frameExpression: {
					type: 'video-config-value',
					identifier: 'durationInFrames',
				},
			},
		],
	});
});

test('computeSequencePropsStatus should expand a static border shorthand', () => {
	const input = `import {AbsoluteFill} from 'remotion';

export const Example = () => {
	return <AbsoluteFill style={{border: '12px dashed rgba(1, 2, 3, 0.5)'}} />;
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 4),
		componentIdentity: null,
		keys: ['style.borderWidth', 'style.borderStyle', 'style.borderColor'],
		effects: [],
		videoConfigValues: null,
	});

	expect(result.props['style.borderWidth']).toEqual({
		status: 'static',
		codeValue: 12,
	});
	expect(result.props['style.borderStyle']).toEqual({
		status: 'static',
		codeValue: 'dashed',
	});
	expect(result.props['style.borderColor']).toEqual({
		status: 'static',
		codeValue: 'rgba(1, 2, 3, 0.5)',
	});
});

test('computeSequencePropsStatus should not guess a dynamic border shorthand', () => {
	const input = `import {AbsoluteFill} from 'remotion';

export const Example = ({border}: {border: string}) => {
	return <AbsoluteFill style={{border}} />;
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 4),
		componentIdentity: null,
		keys: ['style.borderWidth', 'style.borderStyle', 'style.borderColor'],
		effects: [],
		videoConfigValues: null,
	});

	expect(result.props['style.borderWidth']).toEqual({status: 'computed'});
	expect(result.props['style.borderStyle']).toEqual({status: 'computed'});
	expect(result.props['style.borderColor']).toEqual({status: 'computed'});
});

test('computeSequencePropsStatus should treat side-specific borders as computed', () => {
	const sideProperties = [
		"borderLeft: '1px solid red'",
		'borderRightWidth: 2',
		"borderTopStyle: 'dashed'",
		"'borderBottomColor': 'blue'",
	];

	for (const sideProperty of sideProperties) {
		const input = `import {AbsoluteFill} from 'remotion';

export const Example = () => {
	return <AbsoluteFill style={{${sideProperty}}} />;
};
`;
		const result = computeSequencePropsStatusFromContent({
			fileContents: input,
			nodePath: getNodePathFromContent(input, 4),
			componentIdentity: null,
			keys: ['style.borderWidth', 'style.borderStyle', 'style.borderColor'],
			effects: [],
			videoConfigValues: null,
		});

		expect(result.props['style.borderWidth']).toEqual({status: 'computed'});
		expect(result.props['style.borderStyle']).toEqual({status: 'computed'});
		expect(result.props['style.borderColor']).toEqual({status: 'computed'});
	}
});

test('computeSequencePropsStatus should respect border property order', () => {
	const input = `import {AbsoluteFill} from 'remotion';

export const Example = () => {
	return (
		<>
			<AbsoluteFill style={{borderWidth: 8, border: '2px solid red'}} />
			<AbsoluteFill style={{border: '2px solid red', borderWidth: 8}} />
		</>
	);
};
`;
	const beforeShorthand = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 6),
		componentIdentity: null,
		keys: ['style.borderWidth'],
		effects: [],
		videoConfigValues: null,
	});
	const afterShorthand = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
		keys: ['style.borderWidth'],
		effects: [],
		videoConfigValues: null,
	});

	expect(beforeShorthand.props['style.borderWidth']).toEqual({
		status: 'static',
		codeValue: 2,
	});
	expect(afterShorthand.props['style.borderWidth']).toEqual({
		status: 'static',
		codeValue: 8,
	});
});

test('computeSequencePropsStatus should apply border shorthand defaults', () => {
	const input = `import {AbsoluteFill} from 'remotion';

export const Example = () => {
	return <AbsoluteFill style={{border: 'solid'}} />;
};
`;
	const result = computeSequencePropsStatusFromContent({
		fileContents: input,
		nodePath: getNodePathFromContent(input, 4),
		componentIdentity: null,
		keys: ['style.borderWidth', 'style.borderStyle', 'style.borderColor'],
		effects: [],
		videoConfigValues: null,
	});

	expect(result.props['style.borderWidth']).toEqual({
		status: 'static',
		codeValue: 3,
	});
	expect(result.props['style.borderStyle']).toEqual({
		status: 'static',
		codeValue: 'solid',
	});
	expect(result.props['style.borderColor']).toEqual({
		status: 'static',
		codeValue: 'currentColor',
	});
});

test('canUpdateSequenceProps should flag computed props', () => {
	const filePath = path.join(__dirname, 'snapshots', 'light-leak-computed.tsx');
	const result = computeSequencePropsStatus({
		videoConfigValues: null,
		fileName: filePath,
		nodePath: getNodePath(filePath, 8),
		componentIdentity: null,
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
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
		easing: [{type: 'linear'}],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: undefined,
		output: undefined,
	});
});

test('computeSequencePropsStatus should reject a node path with the wrong component identity', () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';
import {Star} from '@remotion/shapes';

export const Example: React.FC = () => {
\treturn (
\t\t<Interactive.Div>
\t\t\t<Star points={20} innerRadius={174} outerRadius={207} />
\t\t</Interactive.Div>
\t);
};
`;

	expect(() =>
		computeSequencePropsStatusFromContent({
			videoConfigValues: null,
			fileContents: input,
			nodePath: getNodePathFromContent(input, 7),
			componentIdentity: 'dev.remotion.shapes.Star',
			keys: ['points'],
			effects: [],
		}),
	).toThrow(JsxElementIdentityMismatchError);
});

test('computeSequencePropsStatus should match hyphenated package imports by component identity', () => {
	const input = `import React from 'react';
import {Highlight} from '@remotion/rough-notation';

export const Example: React.FC = () => {
\treturn (
\t\t<Highlight progress={1} color="yellow">
\t\t\tHighlighted
\t\t</Highlight>
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 6),
		componentIdentity: 'dev.remotion.roughNotation.Highlight',
		keys: ['progress', 'color'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props.progress).toEqual({
		status: 'static',
		codeValue: 1,
	});
	expect(result.props.color).toEqual({
		status: 'static',
		codeValue: 'yellow',
	});
});

test('computeSequencePropsStatus should match namespace imports by component identity', () => {
	const input = `import React from 'react';
import * as Remotion from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<Remotion.Sequence from={10} durationInFrames={20} />
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 6),
		componentIdentity: 'dev.remotion.remotion.Sequence',
		keys: ['from'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props.from).toEqual({
		status: 'static',
		codeValue: 10,
	});
});

test('computeSequencePropsStatus should return easing for interpolated color props', () => {
	const input = `import React from 'react';
import {Easing, Solid, interpolateColors, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Solid color={interpolateColors(frame, [0, 100, 200], ['red', 'green', 'blue'], {easing: [Easing.bezier(0.42, 0, 1, 1), Easing.linear], posterize: 2})} width={100} height={100} />
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
			{frame: 100, value: 'green'},
			{frame: 200, value: 'blue'},
		],
		easing: [{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1}, {type: 'linear'}],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: 2,
		output: undefined,
	});
});

test('computeSequencePropsStatus should return spring easing metadata', () => {
	const input = `import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{opacity: interpolate(frame, [0, 100], [0, 1], {easing: Easing.spring({damping: 12, mass: 1.5, stiffness: 180, allowTail: true, durationRestThreshold: 0.1, overshootClamping: true})})}} />
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
		keys: ['style.opacity'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.opacity']).toEqual({
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: 0},
			{frame: 100, value: 1},
		],
		easing: [
			{
				type: 'spring',
				allowTail: true,
				damping: 12,
				durationRestThreshold: 0.1,
				mass: 1.5,
				stiffness: 180,
				overshootClamping: true,
			},
		],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
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
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
		easing: [{type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
	});
});

test('computeSequencePropsStatus should return keyframes for String-wrapped interpolated translate props', () => {
	const input = `import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{translate: String(interpolate(frame, [0, 16, 30], ['0px 59px', '100px 20px', '124px 40px'], {
\t\t\textrapolateLeft: 'clamp',
\t\t\textrapolateRight: 'clamp',
\t\t\teasing: [
\t\t\t\tEasing.bezier(0, 0, 0.58, 1),
\t\t\t\tEasing.bezier(0.42, 0, 0.6308, 1.1405),
\t\t\t],
\t\t}))}} />
\t);
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
			{frame: 16, value: '100px 20px'},
			{frame: 30, value: '124px 40px'},
		],
		easing: [
			{type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1},
			{type: 'bezier', x1: 0.42, y1: 0, x2: 0.6308, y2: 1.1405},
		],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: undefined,
		output: undefined,
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
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 8),
		componentIdentity: null,
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
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
		easing: [{type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
	});
});

test('computeSequencePropsStatus should explain why outside-project file reads were blocked', () => {
	const remotionRoot = path.join(__dirname, 'snapshots');
	const fileName = '../outside.tsx';
	const absolutePath = path.resolve(remotionRoot, fileName);

	expect(() =>
		computeSequencePropsStatus({
			videoConfigValues: null,
			fileName,
			nodePath: [],
			componentIdentity: null,
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
		videoConfigValues: null,
		fileName: filePath,
		nodePath: getNodePath(filePath, 7),
		componentIdentity: null,
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
		videoConfigValues: null,
		fileName: filePath,
		nodePath: getNodePath(filePath, 8),
		componentIdentity: null,
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

test('computeSequencePropsStatus should preserve nested props from object spreads', () => {
	const input = `import {Interactive} from 'remotion';

const sharedStyle = {color: 'white'};

export const Example = () => {
	return (
		<>
			<Interactive.Div style={{...sharedStyle, fontSize: 40}} />
			<Interactive.Div style={{color: 'red', ...sharedStyle}} />
			<Interactive.Div style={{...sharedStyle, color: 'red'}} />
		</>
	);
};
`;
	const getColorStatus = (line: number) => {
		return computeSequencePropsStatusFromContent({
			fileContents: input,
			nodePath: getNodePathFromContent(input, line),
			componentIdentity: null,
			keys: ['style.color'],
			effects: [],
			videoConfigValues: null,
		}).props['style.color'];
	};

	expect(getColorStatus(8)).toEqual({status: 'computed'});
	expect(getColorStatus(9)).toEqual({status: 'computed'});
	expect(getColorStatus(10)).toEqual({status: 'static', codeValue: 'red'});
});

test('computeSequencePropsStatus should flag computed when parent is not an object', () => {
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.tsx');
	const result = computeSequencePropsStatus({
		videoConfigValues: null,
		fileName: filePath,
		nodePath: getNodePath(filePath, 9),
		componentIdentity: null,
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
		videoConfigValues: null,
		fileName: filePath,
		nodePath: getNodePath(filePath, 7),
		componentIdentity: null,
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
		videoConfigValues: null,
		fileName: filePath,
		nodePath: getNodePath(filePath, 10),
		componentIdentity: null,
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
		videoConfigValues: null,
		fileName: filePath,
		nodePath: getNodePath(filePath, 8),
		componentIdentity: null,
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
		easing: [{type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
	});
});

test('computeSequencePropsStatus should return keyframes for String-wrapped interpolated scale props', () => {
	const input = `import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{scale: String(
\t\t\tinterpolate(
\t\t\t\tframe,
\t\t\t\t[0, 16, 30],
\t\t\t\t['1.105 1.105', '1.37 0.77', '1.611 1.611'],
\t\t\t\t{
\t\t\t\t\textrapolateLeft: 'clamp',
\t\t\t\t\textrapolateRight: 'clamp',
\t\t\t\t\teasing: [
\t\t\t\t\t\tEasing.bezier(0, 0, 0.58, 1),
\t\t\t\t\t\tEasing.bezier(0.42, 0, 0.6308, 1.1405),
\t\t\t\t\t],
\t\t\t\t},
\t\t\t),
\t\t)}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
		keys: ['style.scale'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toEqual({
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: '1.105 1.105'},
			{frame: 16, value: '1.37 0.77'},
			{frame: 30, value: '1.611 1.611'},
		],
		easing: [
			{type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1},
			{type: 'bezier', x1: 0.42, y1: 0, x2: 0.6308, y2: 1.1405},
		],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: undefined,
		output: undefined,
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
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
		easing: [
			{type: 'bezier', x1: 0.1, y1: 0.2, x2: 0.3, y2: 0.4},
			{type: 'linear'},
		],
		clamping: {
			left: 'clamp',
			right: 'identity',
		},
		posterize: undefined,
		output: undefined,
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
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
		easing: [{type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
		posterize: 3,
		output: undefined,
	});
});

test('computeSequencePropsStatus should parse output on interpolated props', () => {
	const input = `import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 100], [1, 3], {output: 'perceptual-scale'})}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
		easing: [{type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: 'perceptual-scale',
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
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
		easing: [{type: 'linear'}],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: 3,
		output: undefined,
	});
});

test('computeSequencePropsStatus should bail on output for interpolated color props', () => {
	const input = `import React from 'react';
import {Solid, interpolateColors, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Solid color={interpolateColors(frame, [0, 100], ['red', 'blue'], {output: 'perceptual-scale'})} width={100} height={100} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
		keys: ['color'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props.color).toEqual({
		status: 'computed',
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
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 8),
		componentIdentity: null,
		keys: ['style.scale'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toEqual({
		status: 'computed',
	});
});

test('computeSequencePropsStatus should bail on arithmetic posterize expressions', () => {
	const input = `import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 100], [1, 3], {posterize: 5 + 5})}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
		keys: ['style.scale'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toEqual({
		status: 'computed',
	});
});

test('computeSequencePropsStatus should bail on computed output expressions', () => {
	const input = `import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\tconst output = 'perceptual-scale';
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 100], [1, 3], {output})}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 8),
		componentIdentity: null,
		keys: ['style.scale'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toEqual({
		status: 'computed',
	});
});

test('computeSequencePropsStatus should represent Easing.cubic as bezier easing metadata', () => {
	const input = `import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 100], [1, 3], {
\t\t\teasing: Easing.cubic,
\t\t})}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
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
		easing: [{type: 'bezier', x1: 1 / 3, y1: 0, x2: 2 / 3, y2: 0}],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: undefined,
	});
});

test('computeSequencePropsStatus should represent supported Easing helpers as bezier easing metadata', () => {
	const input = `import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 20, 40, 60, 80, 100, 120, 140, 160], [0, 1, 2, 3, 4, 5, 6, 7, 8], {
\t\t\teasing: [Easing.ease, Easing.quad, Easing.back(), Easing.back(2), Easing.poly(2), Easing.in(Easing.cubic), Easing.out(Easing.quad), Easing.out(Easing.ease)],
\t\t})}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
		keys: ['style.scale'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toMatchObject({
		status: 'keyframed',
		easing: [
			{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
			{type: 'bezier', x1: 1 / 3, y1: 0, x2: 2 / 3, y2: 1 / 3},
			{type: 'bezier', x1: 1 / 3, y1: 0, x2: 2 / 3, y2: -1.70158 / 3},
			{type: 'bezier', x1: 1 / 3, y1: 0, x2: 2 / 3, y2: -2 / 3},
			{type: 'bezier', x1: 1 / 3, y1: 0, x2: 2 / 3, y2: 1 / 3},
			{type: 'bezier', x1: 1 / 3, y1: 0, x2: 2 / 3, y2: 0},
			{
				type: 'bezier',
				x1: 1 - 2 / 3,
				y1: 1 - 1 / 3,
				x2: 1 - 1 / 3,
				y2: 1,
			},
			{type: 'bezier', x1: 0, y1: 0, x2: 1 - 0.42, y2: 1},
		],
	});
});

test('computeSequencePropsStatus should bail on unsupported easing expressions', () => {
	const input = `import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence style={{scale: interpolate(frame, [0, 100], [1, 3], {
\t\t\teasing: Easing.inOut(Easing.quad),
\t\t})}} />
\t);
};
`;

	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 7),
		componentIdentity: null,
		keys: ['style.scale'],
		effects: [],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.scale']).toEqual({
		status: 'computed',
	});
});

test('computeSequencePropsStatus should detect static JSX text children', () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return <Interactive.P>Hello</Interactive.P>;
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 5),
		componentIdentity: null,
		keys: ['children'],
		effects: [],
	});

	expect(result.props.children).toEqual({status: 'static', codeValue: 'Hello'});
});

test('computeSequencePropsStatus should detect static children attribute', () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return <Interactive.P children="Hello" />;
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 5),
		componentIdentity: null,
		keys: ['children'],
		effects: [],
	});

	expect(result.props.children).toEqual({status: 'static', codeValue: 'Hello'});
});

test('computeSequencePropsStatus should prefer static children attribute over JSX children', () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return <Interactive.P children="Hello">Stale</Interactive.P>;
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 5),
		componentIdentity: null,
		keys: ['children'],
		effects: [],
	});

	expect(result.props.children).toEqual({status: 'static', codeValue: 'Hello'});
});

test('computeSequencePropsStatus should detect empty JSX text children', () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return <Interactive.P></Interactive.P>;
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 5),
		componentIdentity: null,
		keys: ['children'],
		effects: [],
	});

	expect(result.props.children).toEqual({status: 'static', codeValue: ''});
});

test('computeSequencePropsStatus should reject non-static text children', () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC<{text: string}> = ({text}) => {
	return <Interactive.P>{text}</Interactive.P>;
};
`;
	const result = computeSequencePropsStatusFromContent({
		videoConfigValues: null,
		fileContents: input,
		nodePath: getNodePathFromContent(input, 5),
		componentIdentity: null,
		keys: ['children'],
		effects: [],
	});

	expect(result.props.children).toEqual({status: 'computed'});
});
