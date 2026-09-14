import {expect, test} from 'bun:test';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {getNodePathForRecastPath} from '../sequence-props';
import {parseAst} from '../sequence-props/parse-ast';
import {
	updateEffectKeyframes,
	updateSequenceKeyframes,
} from '../update-keyframes';

const getNodePathAtLine = (input: string, line: number): SequenceNodePath => {
	const ast = parseAst(input);
	let nodePath: SequenceNodePath | null = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			if (path.node.loc?.start.line === line) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			}

			return this.traverse(path);
		},
	});
	if (!nodePath) {
		throw new Error(`Could not find a JSX element on line ${line}`);
	}

	return nodePath;
};

test('sequence keyframes preserve source style without calling Prettier', async () => {
	const input = `import {AbsoluteFill} from 'remotion'

// Keep this deliberately non-Prettier code untouched.
const unrelated    = {keep:"this spacing"}

export const Example = () => {
	const label = "untouched"
	return (
		<AbsoluteFill>
			<div style = {{opacity: 0.5}} data-label = {label}/>
		</AbsoluteFill>
	)
}
`;
	const {formatted, output} = await updateSequenceKeyframes({
		input,
		nodePath: getNodePathAtLine(input, 10),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 12, value: 0.75},
			},
		],
		videoConfigValues: null,
		formatFile: () => {
			throw new Error('The compatibility formatter must not be called');
		},
	});

	expect(formatted).toBe(true);
	expect(output)
		.toBe(`import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'

// Keep this deliberately non-Prettier code untouched.
const unrelated    = {keep:"this spacing"}

export const Example = () => {
	const frame = useCurrentFrame()
	const label = "untouched"
	return (
		<AbsoluteFill>
			<div
				style={{
					opacity: interpolate(frame, [12], [0.75], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp'
					})
				}}
				data-label={label}
			/>
		</AbsoluteFill>
	)
}
`);
});

test('effect keyframes only format the edited opening element', async () => {
	const input = `import {AbsoluteFill,interpolate,useCurrentFrame} from "remotion";
import {blur} from "@remotion/effects/blur";

const unrelated    = {keep:'this spacing'};

export const Example = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill effects = {[blur({radius:interpolate(frame,[0,20],[1,3])})]}>
      Keep me
    </AbsoluteFill>
  );
};
`;
	const {formatted, output} = await updateEffectKeyframes({
		input,
		sequenceNodePath: getNodePathAtLine(input, 9),
		effectIndex: 0,
		updates: [
			{
				key: 'radius',
				operation: {type: 'add', frame: 10, value: 2},
			},
		],
		videoConfigValues: null,
		formatFile: () => {
			throw new Error('The compatibility formatter must not be called');
		},
	});

	expect(formatted).toBe(true);
	expect(output)
		.toBe(`import {AbsoluteFill,interpolate,useCurrentFrame} from "remotion";
import {blur} from "@remotion/effects/blur";

const unrelated    = {keep:'this spacing'};

export const Example = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill
      effects={[blur({
        radius: interpolate(frame, [0, 10, 20], [1, 2, 3])
      })]}
    >
      Keep me
    </AbsoluteFill>
  );
};
`);
});

test('sequence keyframes preserve blank lines in unrelated objects', async () => {
	const input = `import {interpolate, useCurrentFrame} from 'remotion';

const unrelated = {
  opacity: 0.4,

  nested: true,
};

export const Example = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(frame, [0], [0.5]),

        transform: 'none',
      }} />
  );
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: getNodePathAtLine(input, 12),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 10, value: 0.75},
			},
		],
		videoConfigValues: null,
	});

	expect(output).toContain(`const unrelated = {
  opacity: 0.4,

  nested: true,
};`);
	expect(output).toContain(
		"opacity: interpolate(frame, [0, 10], [0.5, 0.75]),\n        transform: 'none'",
	);
});

test('new keyframe imports stay after directives', async () => {
	const input = `'use client'

const unrelated    = true

export const Example = () => (
  <div style={{opacity:0.5}} />
)
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: getNodePathAtLine(input, 6),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 8, value: 1},
			},
		],
		videoConfigValues: null,
	});

	expect(output).toBe(`'use client'
import { interpolate, useCurrentFrame } from 'remotion'

const unrelated    = true

export const Example = () => {
  const frame = useCurrentFrame()
  return (
    <div
      style={{
        opacity: interpolate(frame, [8], [1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        })
      }} />
  )
}
`);
});

test('frame hooks stay before comments attached to the first statement', async () => {
	const input = `import {AbsoluteFill} from 'remotion';

export const Example = () => {
  'use strict';
  // Keep this comment attached to the return.
  return (
    <AbsoluteFill style={{opacity: 0.5}} />
  );
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: getNodePathAtLine(input, 7),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 8, value: 1},
			},
		],
		videoConfigValues: null,
	});

	expect(output)
		.toBe(`import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Example = () => {
  'use strict';
  const frame = useCurrentFrame();
  // Keep this comment attached to the return.
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [8], [1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        })
      }}
    />
  );
};
`);
});

test('frame hooks separate comments immediately after the opening brace', async () => {
	const input = `import {AbsoluteFill} from 'remotion';

export const Example = () => {/* Explain the return. */
  return (
    <AbsoluteFill style={{opacity: 0.5}} />
  );
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: getNodePathAtLine(input, 5),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 8, value: 1},
			},
		],
		videoConfigValues: null,
	});

	expect(output)
		.toBe(`import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Example = () => {
  const frame = useCurrentFrame();
  /* Explain the return. */
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [8], [1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        })
      }}
    />
  );
};
`);
});

test('frame hooks reformat compact function blocks', async () => {
	const input = `export const C = () => { return <div style={{opacity: 1}} /> }
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: getNodePathAtLine(input, 1),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 8, value: 1},
			},
		],
		videoConfigValues: null,
	});

	expect(output).toBe(`import { interpolate, useCurrentFrame } from "remotion"
export const C = () => {
  const frame = useCurrentFrame()
  return (
    <div
      style={{
        opacity: interpolate(frame, [8], [1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp"
        })
      }} />
  )
}
`);
});

test('existing keyframes get source-aware indentation in compact blocks', async () => {
	const input = `import {interpolate, useCurrentFrame} from 'remotion';
export const C = () => { const frame = useCurrentFrame(); return <div style={{opacity: interpolate(frame, [0], [0.5])}} /> }
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: getNodePathAtLine(input, 2),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 8, value: 1},
			},
		],
		videoConfigValues: null,
	});

	expect(output).toBe(`import {interpolate, useCurrentFrame} from 'remotion';
export const C = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(frame, [0, 8], [0.5, 1])
      }} />
  );
}
`);
});

test('keyframe mutations preserve JSX string attribute values', async () => {
	const input = `import {interpolate, useCurrentFrame} from 'remotion';

export const Example = () => {
	const frame = useCurrentFrame();
	return <div title="&quot;" opacity={interpolate(frame, [0], [0.5])} />;
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: getNodePathAtLine(input, 5),
		updates: [
			{
				key: 'opacity',
				operation: {type: 'add', frame: 10, value: 0.75},
			},
		],
		videoConfigValues: null,
	});

	expect(output).toContain('title="&quot;"');
	expect(output).toContain(
		'opacity={interpolate(frame, [0, 10], [0.5, 0.75])}',
	);
	expect(() => parseAst(output)).not.toThrow();
});
