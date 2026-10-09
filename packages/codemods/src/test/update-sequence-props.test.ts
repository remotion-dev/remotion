import {expect, test} from 'bun:test';
import * as recast from 'recast';
import {NoReactInternals} from 'remotion/no-react';
import {getNodePathForRecastPath} from '../sequence-props';
import {parseAst} from '../sequence-props/parse-ast';
import {updateMultipleSequenceProps} from '../update-sequence-props';

test('patches an opening element without reprinting its siblings', () => {
	const input = `export const Example = () => {
	return (
		<div>
			<Interactive.Div name="First" />
			<Interactive.Div name="Second" />
			<Interactive.Div name="Third" />
		</div>
	);
};
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			if (path.node.loc?.start.line === 5) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			}

			return this.traverse(path);
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the second Interactive.Div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [{key: 'hidden', value: true, defaultValue: false}],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toBe(`export const Example = () => {
	return (
		<div>
			<Interactive.Div name="First" />
			<Interactive.Div name="Second" hidden />
			<Interactive.Div name="Third" />
		</div>
	);
};
`);
});

test('formats the patched opening element and preserves unrelated formatting', () => {
	const input = `const unrelated    = {keep:"this spacing"};

export const Example = () => {
    return (
        <Interactive.Div
            name = "Example"
        >
            Text
        </Interactive.Div>
    );
};
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			if (path.node.loc?.start.line === 5) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			}

			return this.traverse(path);
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the Interactive.Div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [{key: 'hidden', value: true, defaultValue: false}],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toBe(`const unrelated    = {keep:"this spacing"};

export const Example = () => {
    return (
        <Interactive.Div name="Example" hidden>
            Text
        </Interactive.Div>
    );
};
`);
});

test('preserves JSX string attribute values while patching another prop', () => {
	const input = `export const Example = () => (
	<div title="&quot;&#10;&amp;" />
);
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [{key: 'hidden', value: true, defaultValue: false}],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toBe(`export const Example = () => (
	<div title="&quot;&#10;&amp;" hidden />
);
`);
	expect(() => parseAst(output)).not.toThrow();
});

test('inserts a source-styled import for a local asset without formatting the file', () => {
	const input = `"use client";

import {Video} from "@remotion/media"

const unrelated    = {keep:"spacing"}

export const Example = () => {
    return <Video src="https://example.com/old.mp4" />
}
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the Video');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [
					{
						key: 'src',
						value: 'remotion-file:folder/new%20video.mp4',
						defaultValue: null,
					},
				],
				schema: {
					src: {
						type: 'asset',
						default: undefined,
						keyframable: false,
					},
				},
				videoConfigValues: null,
			},
		],
	});

	expect(output).toBe(`"use client";

import {staticFile} from "remotion"
import {Video} from "@remotion/media"

const unrelated    = {keep:"spacing"}

export const Example = () => {
    return <Video src={staticFile("folder/new video.mp4")} />
}
`);
	parseAst(output);
});

test('inserts keyframe dependencies without formatting unrelated source', () => {
	const input = `"use client"

import {Interactive} from "remotion"

const unrelated    = {keep:"spacing"}

export const Example = () => <Interactive.Div opacity={1} />
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the Interactive.Div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [
					{
						key: 'opacity',
						value: 1,
						defaultValue: null,
						clipboardParam: {
							type: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: 0},
								{frame: 30, value: 1},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'extend', right: 'extend'},
						},
					},
				],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toBe(`"use client"

import {Interactive, useCurrentFrame, interpolate} from "remotion"

const unrelated    = {keep:"spacing"}

export const Example = () => {
  const frame = useCurrentFrame()
  return <Interactive.Div opacity={interpolate(frame, [0, 30], [0, 1])} />
}
`);
	parseAst(output);
});

test('preserves inline directive comments before compact frame hooks', () => {
	const input = `import {Interactive} from "remotion"
export const C = () => { "use strict"; /* keep */ return <Interactive.Div opacity={1} /> }
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the Interactive.Div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [
					{
						key: 'opacity',
						value: 1,
						defaultValue: null,
						clipboardParam: {
							type: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: 0},
								{frame: 30, value: 1},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'extend', right: 'extend'},
						},
					},
				],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output)
		.toBe(`import {Interactive, useCurrentFrame, interpolate} from "remotion"
export const C = () => { "use strict"; /* keep */
  const frame = useCurrentFrame()
  return <Interactive.Div opacity={interpolate(frame, [0, 30], [0, 1])} /> }
`);
	parseAst(output);
});

test('indents a multiline opening element inside a compact function body', () => {
	const input = `import {Interactive} from "remotion"
export const C = () => { return <Interactive.Div opacity={1} /> }
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the Interactive.Div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [
					{
						key: 'name',
						value:
							'A deliberately long sequence name that makes this opening element wrap onto multiple lines',
						defaultValue: null,
					},
				],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toBe(`import {Interactive} from "remotion"
export const C = () => { return <Interactive.Div
    opacity={1}
    name={"A deliberately long sequence name that makes this opening element wrap onto multiple lines"}
  /> }
`);
	parseAst(output);
});

test('indents a multiline opening element inside a compact object method', () => {
	const input = `import {Interactive} from "remotion"
const object = {render() { return <Interactive.Div opacity={1} /> }}
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the Interactive.Div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [
					{
						key: 'name',
						value:
							'A deliberately long sequence name that makes this opening element wrap onto multiple lines',
						defaultValue: null,
					},
				],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toBe(`import {Interactive} from "remotion"
const object = {render() { return <Interactive.Div
    opacity={1}
    name={"A deliberately long sequence name that makes this opening element wrap onto multiple lines"}
  /> }}
`);
	parseAst(output);
});

test('infers single quotes for a new import', () => {
	const input = `const unrelated = 'single quote'

export const Example = () => <div opacity={1} />
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [
					{
						key: 'opacity',
						value: 1,
						defaultValue: null,
						clipboardParam: {
							type: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: 0},
								{frame: 30, value: 1},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'extend', right: 'extend'},
						},
					},
				],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toStartWith(
		"import { useCurrentFrame, interpolate } from 'remotion'\n",
	);
	parseAst(output);
});

test('does not overlap nested function edits for CRLF batched keyframed props', () => {
	const input = `import {Interactive} from "remotion"

export const Example = () => (
  <Interactive.Div opacity={1}>
    {[1].map(() => <Interactive.Div opacity={1} />)}
  </Interactive.Div>
)
`.replaceAll(/\r?\n/g, '\r\n');
	const ast = parseAst(input);
	const nodePaths: ReturnType<typeof getNodePathForRecastPath>[] = [];
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePaths.push(getNodePathForRecastPath(path, ast));
			return this.traverse(path);
		},
	});
	if (nodePaths.length !== 2) {
		throw new Error(
			`Expected 2 Interactive.Div nodes, got ${nodePaths.length}`,
		);
	}

	const clipboardParam = {
		type: 'keyframed' as const,
		interpolationFunction: 'interpolate' as const,
		keyframes: [
			{frame: 0, value: 0},
			{frame: 30, value: 1},
		],
		easing: [{type: 'linear' as const}],
		clamping: {left: 'extend' as const, right: 'extend' as const},
	};
	const {output} = updateMultipleSequenceProps({
		input,
		changes: nodePaths.map((nodePath) => ({
			nodePath,
			updates: [
				{
					key: 'opacity',
					value: 1,
					defaultValue: null,
					clipboardParam,
				},
			],
			schema: NoReactInternals.sequenceSchema,
			videoConfigValues: null,
		})),
	});

	expect(output).toBe(
		`import {Interactive, useCurrentFrame, interpolate} from "remotion"

export const Example = () => {
  const frame = useCurrentFrame()

  return (
    <Interactive.Div opacity={interpolate(frame, [0, 30], [0, 1])}>
      {[1].map(() => {
        const frame = useCurrentFrame()
        return <Interactive.Div opacity={interpolate(frame, [0, 30], [0, 1])} />
      })}
    </Interactive.Div>
  )
}
`.replaceAll(/\r?\n/g, '\r\n'),
	);
	parseAst(output);
});

test('preserves multiplication by a numeric constant', () => {
	const input = `import {Sequence} from 'remotion';

const fps = 30;

export const ShortAudioLoop = () => {
	return <Sequence from={-8 * fps} layout="none" />;
};
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			if (path.node.loc?.start.line === 6) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			}

			return this.traverse(path);
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the Sequence');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [{key: 'from', value: -300, defaultValue: null}],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toContain('from={-10 * fps}');
});

test('saves exact values when preserving config arithmetic would change them', () => {
	for (const [expression, value] of [
		['4 * fps', 123],
		['fps * 4', 123],
		['durationInFrames - 1', 0.1],
	] as const) {
		const input = `import {Sequence} from "remotion"; const fps = 30; const durationInFrames = 10; export const Comp = () => <Sequence from={${expression}} />;`;
		const ast = parseAst(input);
		let nodePath = null;
		recast.types.visit(ast, {
			visitJSXOpeningElement(path) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			},
		});
		if (!nodePath) throw new Error('Could not find Sequence');
		const {output} = updateMultipleSequenceProps({
			input,
			changes: [
				{
					nodePath,
					updates: [{key: 'from', value, defaultValue: null}],
					schema: NoReactInternals.sequenceSchema,
					videoConfigValues: null,
				},
			],
		});
		expect(output).toContain(`from={${value}}`);
	}
});
