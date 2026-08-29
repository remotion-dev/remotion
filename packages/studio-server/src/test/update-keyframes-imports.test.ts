import {expect, test} from 'bun:test';
import type {InteractivitySchema} from 'remotion';
import {
	updateEffectKeyframesAst,
	updateSequenceKeyframesAst,
} from '../codemods/update-keyframes/update-keyframes';
import {lineColumnToNodePath} from './test-utils';

const getLine = (input: string, needle: string): number => {
	const lineIndex = input
		.split('\n')
		.findIndex((line) => line.includes(needle));
	if (lineIndex === -1) {
		throw new Error(`Could not find line containing ${needle}`);
	}

	return lineIndex + 1;
};

const translateSchema = {
	'style.translate': {
		type: 'translate',
		default: '0px 0px',
	},
} satisfies InteractivitySchema;

const rotateSchema = {
	'style.rotate': {
		type: 'rotation-css',
		default: '0deg',
	},
} satisfies InteractivitySchema;

// ---------------------------------------------------------------------------
// Sequence: imports
// ---------------------------------------------------------------------------

test('adds missing interpolate and useCurrentFrame imports when converting static prop', () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 0.5}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 30, value: 1}},
		],
	});

	expect(serialized).toMatch(
		/import\s*\{[^}]*\bAbsoluteFill\b[^}]*\binterpolate\b[^}]*\buseCurrentFrame\b[^}]*\}\s*from\s*['"]remotion['"]/,
	);
	expect(serialized).toContain('const frame = useCurrentFrame();');
	expect(serialized).toContain('interpolate(frame, [30], [1], {');
	expect(serialized).toContain('extrapolateLeft: "clamp"');
	expect(serialized).toContain('extrapolateRight: "clamp"');
});

test('adds interpolateColors import (not interpolate) for color conversion', () => {
	const input = `import React from 'react';
import {Solid} from 'remotion';

export const Example: React.FC = () => {
\treturn <Solid color={'red'} width={100} height={100} />;
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, '<Solid')),
		updates: [
			{key: 'color', operation: {type: 'add', frame: 50, value: 'blue'}},
		],
	});

	expect(serialized).toContain('interpolateColors');
	expect(serialized).not.toContain('{interpolate,');
	expect(serialized).toContain('useCurrentFrame');
	expect(serialized).toContain('const frame = useCurrentFrame();');
});

test('adds interpolate import for translate conversion', () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn <AbsoluteFill style={{translate: '0px 59px'}} />;
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, '<AbsoluteFill')),
		schema: translateSchema,
		updates: [
			{
				key: 'style.translate',
				operation: {type: 'add', frame: 44, value: '0px 59px'},
			},
		],
	});

	expect(serialized).toContain('interpolate');
	expect(serialized).not.toContain('interpolateColors');
	expect(serialized).toContain('useCurrentFrame');
	expect(serialized).toContain('const frame = useCurrentFrame();');
});

test('adds interpolate import for rotate conversion', () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn <AbsoluteFill style={{rotate: '0deg'}} />;
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, '<AbsoluteFill')),
		schema: rotateSchema,
		updates: [
			{
				key: 'style.rotate',
				operation: {type: 'add', frame: 44, value: '19deg'},
			},
		],
	});

	expect(serialized).toContain('interpolate');
	expect(serialized).not.toContain('interpolateColors');
	expect(serialized).toContain('extrapolateLeft: "clamp"');
	expect(serialized).toContain('extrapolateRight: "clamp"');
	expect(serialized).toContain('useCurrentFrame');
	expect(serialized).toContain('const frame = useCurrentFrame();');
});

test('creates a new remotion import when one is missing entirely', () => {
	const input = `import React from 'react';

export const Example = () => {
\treturn <div style={{opacity: 0.5}} />;
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, '<div')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 20, value: 1}},
		],
	});

	expect(serialized).toMatch(
		/import\s*\{[^}]*\binterpolate\b[^}]*\buseCurrentFrame\b[^}]*\}\s*from\s*['"]remotion['"]/,
	);
	expect(serialized).toContain('const frame = useCurrentFrame();');
});

test('does not duplicate an existing interpolate import', () => {
	const input = `import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 0.5}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 25, value: 1}},
		],
	});

	const matches = serialized.match(/from 'remotion'/g) ?? [];
	expect(matches.length).toBe(1);
	const interpolateMatches = serialized.match(/\binterpolate\b/g) ?? [];
	// once in import, once in the new expression
	expect(interpolateMatches.length).toBe(2);
});

test('does not add useCurrentFrame import or frame hook when extending an existing interpolation', () => {
	const input = `import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

const f = 10;

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: interpolate(f, [0, 100], [0, 1])}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 50, value: 0.5}},
		],
	});

	expect(serialized).not.toContain('useCurrentFrame');
	expect(serialized).toContain('interpolate(f, [0, 50, 100], [0, 0.5, 1])');
});

test('does not add useCurrentFrame import or frame hook when removing a keyframe', () => {
	const input = `import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

const f = 10;

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: interpolate(f, [0, 50, 100], [0, 0.5, 1])}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{
				key: 'style.opacity',
				operation: {
					type: 'remove',
					frame: 50,
					valueWhenLastKeyframeDeleted: null,
				},
			},
		],
	});

	expect(serialized).not.toContain('useCurrentFrame');
});

test('adds useCurrentFrame to existing remotion import that already has other specifiers', () => {
	const input = `import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<Sequence>
\t\t\t\t<div style={{opacity: 0.5}} />
\t\t\t</Sequence>
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 20, value: 1}},
		],
	});

	expect(serialized).toMatch(
		/import\s*\{[^}]*\bAbsoluteFill\b[^}]*\bSequence\b[^}]*\binterpolate\b[^}]*\buseCurrentFrame\b[^}]*\}\s*from\s*'remotion'/,
	);
});

// ---------------------------------------------------------------------------
// Sequence: frame hook insertion
// ---------------------------------------------------------------------------

test('inserts const frame = useCurrentFrame() at the top of the component', () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\tconst x = 5;
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 0.5}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 30, value: 1}},
		],
	});

	const frameIdx = serialized.indexOf('const frame = useCurrentFrame()');
	const xIdx = serialized.indexOf('const x = 5');
	expect(frameIdx).toBeGreaterThan(-1);
	expect(frameIdx).toBeLessThan(xIdx);
});

test('does not duplicate the frame hook if it already exists', () => {
	const input = `import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 0.5}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 30, value: 1}},
		],
	});

	const matches = serialized.match(/const frame = useCurrentFrame\(\)/g) ?? [];
	expect(matches.length).toBe(1);
});

test('inserts frame hook in function declaration component', () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export function Example() {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 0.5}} />
\t\t</AbsoluteFill>
\t);
}
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 25, value: 1}},
		],
	});

	expect(serialized).toContain('const frame = useCurrentFrame();');
	expect(serialized).toMatch(
		/function Example\(\)\s*\{\s*const frame = useCurrentFrame/,
	);
});

test('inserts frame hook into the innermost enclosing function, not an outer one', () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Outer: React.FC = () => {
\tconst Inner: React.FC = () => {
\t\treturn <div style={{opacity: 0.5}} />;
\t};

\treturn (
\t\t<AbsoluteFill>
\t\t\t<Inner />
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 30, value: 1}},
		],
	});

	expect(serialized).toMatch(
		/Inner:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{\s*const frame = useCurrentFrame\(\);/,
	);
	// Outer function body should not have a hook prepended
	expect(serialized).not.toMatch(
		/Outer:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{\s*const frame = useCurrentFrame/,
	);
});

test('converts an arrow function with expression body to a block when inserting the hook', () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => (
\t<AbsoluteFill>
\t\t<div style={{opacity: 0.5}} />
\t</AbsoluteFill>
);
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 20, value: 1}},
		],
	});

	expect(serialized).toContain('const frame = useCurrentFrame();');
	expect(serialized).toContain('return');
	expect(serialized).toContain('interpolate(frame, [20], [1], {');
	expect(serialized).toContain('extrapolateLeft: "clamp"');
	expect(serialized).toContain('extrapolateRight: "clamp"');
});

test('does not add a duplicate frame hook when user already has one with a different intermediate statement', () => {
	const input = `import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst other = 1;
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 0.5}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 20, value: 1}},
		],
	});

	const matches = serialized.match(/const frame = useCurrentFrame\(\)/g) ?? [];
	expect(matches.length).toBe(1);
});

// ---------------------------------------------------------------------------
// Effect imports & frame hook
// ---------------------------------------------------------------------------

test('effect keyframe add inserts imports and frame hook when needed', () => {
	const input = `import {tint} from '@remotion/effects/tint';
import {HtmlInCanvas} from '@remotion/html-in-canvas';

export const Comp = () => {
\treturn (
\t\t<HtmlInCanvas effects={[tint({amount: 0.5})]}>
\t\t\thi
\t\t</HtmlInCanvas>
\t);
};
`;
	const {serialized} = updateEffectKeyframesAst({
		videoConfigValues: null,
		input,
		sequenceNodePath: lineColumnToNodePath(
			input,
			getLine(input, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [{key: 'amount', operation: {type: 'add', frame: 100, value: 1}}],
	});

	expect(serialized).toMatch(
		/import\s*\{[^}]*\binterpolate\b[^}]*\buseCurrentFrame\b[^}]*\}\s*from\s*['"]remotion['"]/,
	);
	expect(serialized).toContain('const frame = useCurrentFrame();');
	expect(serialized).toContain('interpolate(frame, [100], [1], {');
	expect(serialized).toContain('extrapolateLeft: "clamp"');
	expect(serialized).toContain('extrapolateRight: "clamp"');
});

test('effect keyframe remove does not modify imports or insert a frame hook', () => {
	const input = `import {tint} from '@remotion/effects/tint';
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
	const before = (input.match(/const frame = useCurrentFrame/g) ?? []).length;
	const {serialized} = updateEffectKeyframesAst({
		videoConfigValues: null,
		input,
		sequenceNodePath: lineColumnToNodePath(
			input,
			getLine(input, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [
			{
				key: 'amount',
				operation: {
					type: 'remove',
					frame: 50,
					valueWhenLastKeyframeDeleted: null,
				},
			},
		],
	});
	const after = (serialized.match(/const frame = useCurrentFrame/g) ?? [])
		.length;

	expect(after).toBe(before);
});

test('effect keyframe extension of existing interpolation does not add useCurrentFrame', () => {
	const input = `import {tint} from '@remotion/effects/tint';
import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {interpolate} from 'remotion';

const f = 0;

export const Comp = () => {
\treturn (
\t\t<HtmlInCanvas
\t\t\teffects={[tint({amount: interpolate(f, [0, 100], [0.2, 0.8])})]}
\t\t>
\t\t\thi
\t\t</HtmlInCanvas>
\t);
};
`;
	const {serialized} = updateEffectKeyframesAst({
		videoConfigValues: null,
		input,
		sequenceNodePath: lineColumnToNodePath(
			input,
			getLine(input, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [{key: 'amount', operation: {type: 'add', frame: 50, value: 0.5}}],
	});

	expect(serialized).not.toContain('useCurrentFrame');
	expect(serialized).toContain('interpolate(f, [0, 50, 100], [0.2, 0.5, 0.8])');
});

test('multiple updates only add imports/hook once', () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 0.5, scale: 1}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {serialized} = updateSequenceKeyframesAst({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 20, value: 1}},
			{key: 'style.scale', operation: {type: 'add', frame: 30, value: 2}},
		],
	});

	const matches = serialized.match(/const frame = useCurrentFrame\(\)/g) ?? [];
	expect(matches.length).toBe(1);
	const imports = serialized.match(/from 'remotion'/g) ?? [];
	expect(imports.length).toBe(1);
	const interpolateImport =
		serialized.match(/import\s*\{[^}]*\binterpolate\b[^}]*\}/g) ?? [];
	expect(interpolateImport.length).toBe(1);
});
