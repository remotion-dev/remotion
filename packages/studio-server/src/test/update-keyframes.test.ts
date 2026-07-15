import {expect, test} from 'bun:test';
import type {InteractivitySchema} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	updateEffectKeyframesAst,
	updateSequenceKeyframes,
} from '../codemods/update-keyframes/update-keyframes';
import {computeSequencePropsStatusFromContent} from '../preview-server/routes/can-update-sequence-props';
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

const translateInput = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{translate: '0px 59px'}} />
\t\t</AbsoluteFill>
\t);
};
`;

const rotateInput = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{rotate: '19deg'}} />
\t\t</AbsoluteFill>
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

const waveEffectInput = `import {wave} from '@remotion/effects/wave';
import {Solid} from 'remotion';

export const Comp = () => {
\treturn (
\t\t<Solid
\t\t\twidth={100}
\t\t\theight={100}
\t\t\tcolor="red"
\t\t\teffects={[wave({})]}
\t\t/>
\t);
};
`;

const waveSchema = {
	phase: {
		type: 'number',
		default: 0,
		hiddenFromList: false,
	},
} satisfies InteractivitySchema;

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

test('updateSequenceKeyframes uses linear easing when appending keyframes', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [91, 126], [1080, 833], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: [Easing.bezier(0.42, 0, 1, 1)]})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'add', frame: 134, value: 700},
			},
		],
	});

	expect(output).toContain('interpolate(frame, [91, 126, 134]');
	expect(output).toContain('Easing.linear');
	expect(output.match(/Easing\.bezier\(0\.42, 0, 1, 1\)/g)?.length).toBe(1);
});

test('updateSequenceKeyframes duplicates the split segment easing when adding keyframes', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 31, 60], [0, 1, 2], {easing: [Easing.linear, Easing.bezier(0.42, 0, 1, 1)]})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'add', frame: 38, value: 1.5},
			},
		],
	});

	expect(output).toContain('interpolate(frame, [0, 31, 38, 60]');
	expect(output).toContain('Easing.linear');
	expect(output.match(/Easing\.bezier\(0\.42, 0, 1, 1\)/g)?.length).toBe(2);
});

test('updateSequenceKeyframes represents Easing.cubic as bezier when editing keyframes', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 100], [0, 1], {easing: Easing.cubic})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'add', frame: 50, value: 0.25},
			},
		],
	});

	expect(output).toContain('interpolate(frame, [0, 50, 100]');
	expect(
		output.match(
			/Easing\.bezier\(0\.3333333333333333, 0, 0\.6666666666666666, 0\)/g,
		)?.length,
	).toBe(2);
});

test('updateSequenceKeyframes represents Easing.back as bezier when editing keyframes', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 100], [0, 1], {easing: Easing.back(2)})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'add', frame: 50, value: 0.25},
			},
		],
	});

	expect(output).toContain('interpolate(frame, [0, 50, 100]');
	expect(output.match(/Easing\.bezier\(/g)?.length).toBe(2);
	expect(output.match(/-0\.6666666666666666/g)?.length).toBe(2);
});

test('updateSequenceKeyframes updates a keyframe at the same frame', async () => {
	const {output, oldValueStrings, newValueStrings} =
		await updateSequenceKeyframes({
			input: sequenceInput,
			nodePath: lineColumnToNodePath(
				sequenceInput,
				getLine(sequenceInput, 'scale'),
			),
			updates: [
				{
					key: 'style.scale',
					operation: {type: 'add', frame: 100, value: 5},
				},
			],
		});

	expect(oldValueStrings).toEqual(['interpolate(frame, [0, 100], [2, 4])']);
	expect(newValueStrings).toEqual(['interpolate(frame, [0, 100], [2, 5])']);
	expect(output).toContain('scale: interpolate(frame, [0, 100], [2, 5])');
});

test('updateSequenceKeyframes updates keyframe settings while preserving easing', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 100], [2, 4], {easing: Easing.linear, extrapolateLeft: 'clamp', posterize: 2})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {
					type: 'settings',
					clamping: {left: 'extend', right: 'wrap'},
					posterize: undefined,
					output: undefined,
				},
			},
		],
	});

	expect(output).toContain('easing: Easing.linear');
	expect(output).toContain("extrapolateLeft: 'extend'");
	expect(output).toContain("extrapolateRight: 'wrap'");
	expect(output).not.toContain('posterize');
});

test('updateSequenceKeyframes updates output settings', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 100], [2, 4])}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {
					type: 'settings',
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: 'perceptual-scale',
				},
			},
		],
	});

	expect(output).toContain("output: 'perceptual-scale'");
});

test('updateSequenceKeyframes removes linear output settings', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 100], [2, 4], {output: 'perceptual-scale'})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {
					type: 'settings',
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: 'linear',
				},
			},
		],
	});

	expect(output).not.toContain('output');
});

test('updateSequenceKeyframes sets one easing segment and fills linear segments', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 50, 100], [2, 3, 4])}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {
					type: 'easing',
					segmentIndex: 1,
					easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
				},
			},
		],
	});

	expect(output).toContain('Easing');
	expect(output).toContain(
		'easing: [Easing.linear, Easing.bezier(0.42, 0, 1, 1)]',
	);
});

test('updateSequenceKeyframes sets a spring easing segment', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 100], [2, 4])}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {
					type: 'easing',
					segmentIndex: 0,
					easing: {
						type: 'spring',
						allowTail: true,
						damping: 12,
						durationRestThreshold: 0.1,
						mass: 1.5,
						stiffness: 180,
						overshootClamping: true,
					},
				},
			},
		],
	});

	expect(output).toContain('Easing');
	expect(output).toContain('easing: [');
	expect(output).toContain('Easing.spring({');
	expect(output).toContain('damping: 12');
	expect(output).toContain('mass: 1.5');
	expect(output).toContain('stiffness: 180');
	expect(output).toContain('allowTail: true');
	expect(output).toContain('durationRestThreshold: 0.1');
	expect(output).toContain('overshootClamping: true');
});

test('updateSequenceKeyframes adds an unaliased Easing import for easing edits', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing as RemotionEasing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 50, 100], [2, 3, 4])}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {
					type: 'easing',
					segmentIndex: 1,
					easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
				},
			},
		],
	});

	expect(output).toContain('Easing as RemotionEasing');
	expect(output).toContain('Easing,');
	expect(output).toContain('Easing.bezier(0.42, 0, 1, 1)');
});

test('updateSequenceKeyframes pads existing easing arrays before editing them', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [91, 126, 134], [1080, 1080, 833], {easing: [Easing.bezier(0.42, 0, 1, 1)]})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {
					type: 'easing',
					segmentIndex: 1,
					easing: {type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1},
				},
			},
		],
	});

	expect(output).toContain('easing: [');
	expect(output).toContain('Easing.bezier(0.42, 0, 1, 1)');
	expect(output).toContain('Easing.bezier(0, 0, 0.58, 1)');
});

test('updateSequenceKeyframes removes easing once all segments are linear', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 50, 100], [2, 3, 4], {easing: [Easing.linear, Easing.bezier(0.42, 0, 1, 1)], posterize: 2})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {
					type: 'easing',
					segmentIndex: 1,
					easing: {type: 'linear'},
				},
			},
		],
	});

	expect(output).not.toContain('easing:');
	expect(output).toContain('posterize: 2');
});

test('updateSequenceKeyframes sets easing for color keyframes', async () => {
	const {output} = await updateSequenceKeyframes({
		input: colorInput,
		nodePath: lineColumnToNodePath(colorInput, getLine(colorInput, '<Solid')),
		updates: [
			{
				key: 'color',
				operation: {
					type: 'easing',
					segmentIndex: 0,
					easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
				},
			},
		],
	});

	expect(output).toContain('Easing');
	expect(output).toContain(
		"interpolateColors(frame, [0, 100], ['red', 'blue'], {",
	);
	expect(output).toContain('easing: [Easing.bezier(0.42, 0, 1, 1)]');
});

test('updateSequenceKeyframes only updates posterize for color keyframes', async () => {
	const {output} = await updateSequenceKeyframes({
		input: colorInput,
		nodePath: lineColumnToNodePath(colorInput, getLine(colorInput, '<Solid')),
		updates: [
			{
				key: 'color',
				operation: {
					type: 'settings',
					clamping: {left: 'extend', right: 'wrap'},
					posterize: 3,
					output: undefined,
				},
			},
		],
	});

	expect(output).toContain(
		"color={interpolateColors(frame, [0, 100], ['red', 'blue'], {",
	);
	expect(output).toContain('posterize: 3');
	expect(output).not.toContain('extrapolateLeft');
	expect(output).not.toContain('extrapolateRight');
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
	expect(output).toContain('opacity: interpolate(frame, [25], [0.75], {');
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
});

test('updateSequenceKeyframes does not preserve blank lines around keyframed object properties', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div
\t\t\t\tstyle={{
\t\t\t\t\twidth: 360,
\t\t\t\t\theight: 200,
\t\t\t\t\tborderRadius: 24,
\t\t\t\t\toverflow: 'hidden',

\t\t\t\t\ttranslate: '0px 0px',

\t\t\t\t\tscale: 1,
\t\t\t\t}}
\t\t\t/>
\t\t</AbsoluteFill>
\t);
};
`;
	const schema = {
		'style.translate': {
			type: 'translate',
			default: '0px 0px',
		},
		'style.scale': {
			type: 'number',
			default: 1,
			hiddenFromList: false,
		},
	} satisfies InteractivitySchema;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, '<div')),
		schema,
		updates: [
			{
				key: 'style.translate',
				operation: {type: 'add', frame: 14, value: '0px 0px'},
			},
			{
				key: 'style.scale',
				operation: {type: 'add', frame: 14, value: 1},
			},
		],
	});

	const styleStart = output.indexOf('style={{');
	const styleEnd = output.indexOf('\t\t\t\t}}', styleStart);
	expect(output.slice(styleStart, styleEnd)).not.toContain('\n\n');
	expect(output).toContain(
		"overflow: 'hidden',\n\t\t\t\t\ttranslate: interpolate(frame, [14], ['0px 0px'], {",
	);
	expect(output).toContain(
		'\t\t\t\t\t}),\n\t\t\t\t\tscale: interpolate(frame, [14], [1], {',
	);
});

test('updateSequenceKeyframes rejects non-keyframable fields', async () => {
	const schema = {
		'style.opacity': {
			type: 'number',
			default: 1,
			hiddenFromList: false,
			keyframable: false,
		},
	} satisfies InteractivitySchema;

	await expect(
		updateSequenceKeyframes({
			input: sequenceInput,
			nodePath: lineColumnToNodePath(
				sequenceInput,
				getLine(sequenceInput, 'opacity'),
			),
			schema,
			updates: [
				{
					key: 'style.opacity',
					operation: {type: 'add', frame: 25, value: 0.75},
				},
			],
		}),
	).rejects.toThrow(/not keyframable/);
});

test('updateSequenceKeyframes rejects enum fields', async () => {
	await expect(
		updateSequenceKeyframes({
			input: sequenceInput,
			nodePath: lineColumnToNodePath(
				sequenceInput,
				getLine(sequenceInput, '<AbsoluteFill>'),
			),
			schema: NoReactInternals.sequenceSchema,
			updates: [
				{
					key: 'layout',
					operation: {type: 'add', frame: 25, value: 'none'},
				},
			],
		}),
	).rejects.toThrow(/not keyframable/);
});

test('updateSequenceKeyframes converts a static value to a single-keyframe interpolation at frame 0', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: sequenceInput,
		nodePath: lineColumnToNodePath(
			sequenceInput,
			getLine(sequenceInput, 'opacity'),
		),
		updates: [
			{
				key: 'style.opacity',
				operation: {type: 'add', frame: 0, value: 0.75},
			},
		],
	});

	expect(oldValueStrings).toEqual(['0.5']);
	expect(output).toContain('opacity: interpolate(frame, [0], [0.75], {');
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
});

test('updateSequenceKeyframes adds a missing nested prop before keyframing it', async () => {
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
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'opacity')),
		schema: NoReactInternals.sequenceSchema,
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'add', frame: 30, value: 2},
			},
		],
	});

	expect(oldValueStrings).toEqual(['1']);
	expect(output).toContain('opacity: 0.5');
	expect(output).toContain('scale: interpolate(frame, [30], [2], {');
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
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
	expect(output).toContain("color={interpolateColors(frame, [50], ['blue'])}");
});

test('updateSequenceKeyframes converts static translate to interpolate', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: translateInput,
		nodePath: lineColumnToNodePath(
			translateInput,
			getLine(translateInput, 'translate'),
		),
		schema: translateSchema,
		updates: [
			{
				key: 'style.translate',
				operation: {type: 'add', frame: 44, value: '0px 59px'},
			},
		],
	});

	expect(oldValueStrings).toEqual(["'0px 59px'"]);
	expect(output).toContain(
		"translate: interpolate(frame, [44], ['0px 59px'], {",
	);
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
	expect(output).toContain('interpolate');
});

test('updateSequenceKeyframes adds a missing nested prop before keyframing it', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{opacity: 1}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output, oldValueStrings, updatedNodePath} =
		await updateSequenceKeyframes({
			input,
			nodePath: lineColumnToNodePath(input, getLine(input, '<div')),
			schema: translateSchema,
			updates: [
				{
					key: 'style.translate',
					operation: {type: 'add', frame: 44, value: '100px 20px'},
				},
			],
		});

	expect(oldValueStrings).toEqual(['"0px 0px"']);
	expect(output).toContain(
		"translate: interpolate(frame, [44], ['100px 20px'], {",
	);
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
	expect(output).toContain('useCurrentFrame');
	expect(output).toContain('interpolate');
	const status = computeSequencePropsStatusFromContent({
		fileContents: output,
		nodePath: updatedNodePath,
		componentIdentity: null,
		keys: ['style.translate'],
		effects: [],
	});
	expect(status.props['style.translate']).toEqual({
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [{frame: 44, value: '100px 20px'}],
		easing: [],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: undefined,
		output: undefined,
	});
});

test('updateSequenceKeyframes migrates translate away from interpolateColors', async () => {
	const input = translateInput
		.replace(
			"import {AbsoluteFill} from 'remotion';",
			"import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';",
		)
		.replace('return (', 'const frame = useCurrentFrame();\n\treturn (')
		.replace(
			"translate: '0px 59px'",
			"translate: interpolateColors(frame, [44], ['0px 59px'])",
		);
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'translate')),
		schema: translateSchema,
		updates: [
			{
				key: 'style.translate',
				operation: {type: 'add', frame: 88, value: '100px 20px'},
			},
		],
	});

	expect(oldValueStrings).toEqual([
		"interpolateColors(frame, [44], ['0px 59px'])",
	]);
	expect(output).toContain('translate: interpolate(');
	expect(output).toContain('[44, 88]');
	expect(output).toContain("['0px 59px', '100px 20px']");
});

test('updateSequenceKeyframes converts static rotate to interpolate', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: rotateInput,
		nodePath: lineColumnToNodePath(rotateInput, getLine(rotateInput, 'rotate')),
		schema: rotateSchema,
		updates: [
			{
				key: 'style.rotate',
				operation: {type: 'add', frame: 55, value: '19deg'},
			},
		],
	});

	expect(oldValueStrings).toEqual(["'19deg'"]);
	expect(output).toContain("rotate: interpolate(frame, [55], ['19deg'], {");
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
	expect(output).toContain('interpolate');
});

test('updateSequenceKeyframes migrates rotate away from interpolateColors', async () => {
	const input = rotateInput
		.replace(
			"import {AbsoluteFill} from 'remotion';",
			"import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';",
		)
		.replace('return (', 'const frame = useCurrentFrame();\n\treturn (')
		.replace(
			"rotate: '19deg'",
			"rotate: interpolateColors(frame, [55], ['19deg'])",
		);
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'rotate')),
		schema: rotateSchema,
		updates: [
			{
				key: 'style.rotate',
				operation: {type: 'add', frame: 68, value: '23deg'},
			},
		],
	});

	expect(oldValueStrings).toEqual([
		"interpolateColors(frame, [55], ['19deg'])",
	]);
	expect(output).toContain('rotate: interpolate(');
	expect(output).toContain('[55, 68]');
	expect(output).toContain("['19deg', '23deg']");
});

test('updateSequenceKeyframes returns a node path that still resolves after inserting a frame hook', async () => {
	const input = `import {starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill, Solid} from 'remotion';

const CenteredSolid: React.FC = () => {
\treturn (
\t\t<AbsoluteFill style={{perspective: 300}}>
\t\t\t<Solid
\t\t\t\twidth={240}
\t\t\t\theight={240}
\t\t\t\tcolor={'#d8d8d8'}
\t\t\t\tstyle={{
\t\t\t\t\tposition: 'absolute',
\t\t\t\t\tleft: '50%',
\t\t\t\t\ttop: '50%',
\t\t\t\t\ttransform: 'translate(-50%, -50%) rotateX(40deg)',
\t\t\t\t\trotate: '40deg',
\t\t\t\t\tscale: 2.42,
\t\t\t\t\ttranslate: '0px 191px',
\t\t\t\t}}
\t\t\t\teffects={[starburst({rays: 10, colors: ['#eeeeee', '#bbbbbb']})]}
\t\t\t/>
\t\t</AbsoluteFill>
\t);
};

export default CenteredSolid;
`;
	const nodePath = lineColumnToNodePath(input, getLine(input, '<Solid'));
	const {output, updatedNodePath} = await updateSequenceKeyframes({
		input,
		nodePath,
		updates: [
			{
				key: 'width',
				operation: {type: 'add', frame: 11, value: 240},
			},
		],
	});

	expect(updatedNodePath).toEqual(nodePath);
	expect(output).toContain('width={interpolate(frame, [11], [240], {');
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'clamp'");
	const status = computeSequencePropsStatusFromContent({
		fileContents: output,
		nodePath: updatedNodePath,
		componentIdentity: null,
		keys: ['width'],
		effects: [],
	});
	expect(status.props.width).toEqual({
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [{frame: 11, value: 240}],
		easing: [],
		clamping: {left: 'clamp', right: 'clamp'},
		posterize: undefined,
		output: undefined,
	});
});

test('updateSequenceKeyframes keeps an interpolation when one keyframe remains', async () => {
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
	expect(output).toContain('style={{scale: interpolate(frame, [100], [4])}}');
});

test('updateSequenceKeyframes removes the adjacent easing segment when deleting keyframes', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [91, 126, 134], [1080, 1080, 833], {easing: [Easing.linear, Easing.bezier(0.42, 0, 1, 1)]})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'remove', frame: 91},
			},
		],
	});

	expect(output).toContain('interpolate(frame, [126, 134]');
	expect(output).toContain('easing: [Easing.bezier(0.42, 0, 1, 1)]');
});

test('updateSequenceKeyframes preserves the left segment easing when deleting a middle keyframe', async () => {
	const input = `import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const Example: React.FC = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill>
\t\t\t<div style={{scale: interpolate(frame, [0, 31, 38, 60], [0, 1, 1.5, 2], {easing: [Easing.linear, Easing.bezier(0.42, 0, 1, 1), Easing.bezier(0.42, 0, 1, 1)]})}} />
\t\t</AbsoluteFill>
\t);
};
`;
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {type: 'remove', frame: 38},
			},
		],
	});

	expect(output).toContain('interpolate(frame, [0, 31, 60]');
	expect(output).toContain(
		'easing: [Easing.linear, Easing.bezier(0.42, 0, 1, 1)]',
	);
});

test('updateSequenceKeyframes moves overlapping selected keyframes together', async () => {
	const input = sequenceInput.replace(
		'interpolate(frame, [0, 100], [2, 4])',
		'interpolate(frame, [0, 50, 100], [2, 3, 4])',
	);
	const {output, oldValueStrings, newValueStrings} =
		await updateSequenceKeyframes({
			input,
			nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
			updates: [
				{
					key: 'style.scale',
					operation: {
						type: 'move',
						moves: [
							{fromFrame: 0, toFrame: 50},
							{fromFrame: 50, toFrame: 80},
						],
					},
				},
			],
		});

	expect(oldValueStrings).toEqual([
		'interpolate(frame, [0, 50, 100], [2, 3, 4])',
	]);
	expect(newValueStrings).toEqual([
		'interpolate(frame, [50, 80, 100], [2, 3, 4])',
	]);
	expect(output).toContain(
		'style={{scale: interpolate(frame, [50, 80, 100], [2, 3, 4])}}',
	);
});

test('updateSequenceKeyframes resorts keyframes when moving past an adjacent keyframe', async () => {
	const input = sequenceInput.replace(
		'interpolate(frame, [0, 100], [2, 4])',
		'interpolate(frame, [0, 50, 100], [2, 3, 4])',
	);
	const {output, oldValueStrings, newValueStrings} =
		await updateSequenceKeyframes({
			input,
			nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
			updates: [
				{
					key: 'style.scale',
					operation: {
						type: 'move',
						moves: [{fromFrame: 0, toFrame: 75}],
					},
				},
			],
		});

	expect(oldValueStrings).toEqual([
		'interpolate(frame, [0, 50, 100], [2, 3, 4])',
	]);
	expect(newValueStrings).toEqual([
		'interpolate(frame, [50, 75, 100], [3, 2, 4])',
	]);
	expect(output).toContain(
		'style={{scale: interpolate(frame, [50, 75, 100], [3, 2, 4])}}',
	);
});

test('updateSequenceKeyframes replaces an existing keyframe when moving onto it', async () => {
	const input = sequenceInput
		.replace(
			"import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';",
			"import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';",
		)
		.replace(
			'interpolate(frame, [0, 100], [2, 4])',
			'interpolate(frame, [0, 50, 100], [2, 3, 4], {easing: [Easing.linear, Easing.bezier(0.42, 0, 1, 1)]})',
		);
	const {output, oldValueStrings, newValueStrings} =
		await updateSequenceKeyframes({
			input,
			nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
			updates: [
				{
					key: 'style.scale',
					operation: {
						type: 'move',
						moves: [{fromFrame: 0, toFrame: 50}],
					},
				},
			],
		});

	expect(oldValueStrings).toEqual([
		'interpolate(frame, [0, 50, 100], [2, 3, 4], {easing: [Easing.linear, Easing.bezier(0.42, 0, 1, 1)]})',
	]);
	expect(newValueStrings).toEqual([
		'interpolate(frame, [50, 100], [2, 4], {})',
	]);
	expect(output).toContain('scale: interpolate(frame, [50, 100], [2, 4], {})');
});

test('updateSequenceKeyframes allows moving keyframes outside the sequence range', async () => {
	const input = sequenceInput.replace(
		'interpolate(frame, [0, 100], [2, 4])',
		'interpolate(frame, [0, 50, 100], [2, 3, 4])',
	);
	const {output, newValueStrings} = await updateSequenceKeyframes({
		input,
		nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
		updates: [
			{
				key: 'style.scale',
				operation: {
					type: 'move',
					moves: [
						{fromFrame: 0, toFrame: -15},
						{fromFrame: 100, toFrame: 140},
					],
				},
			},
		],
	});

	expect(newValueStrings).toEqual([
		'interpolate(frame, [-15, 50, 140], [2, 3, 4])',
	]);
	expect(output).toContain(
		'style={{scale: interpolate(frame, [-15, 50, 140], [2, 3, 4])}}',
	);
});

test('updateSequenceKeyframes converts the last keyframe to a static value', async () => {
	const input = sequenceInput.replace(
		'interpolate(frame, [0, 100], [2, 4])',
		'interpolate(frame, [12], [320])',
	);
	const {output, oldValueStrings, newValueStrings, updatedNodePath} =
		await updateSequenceKeyframes({
			input,
			nodePath: lineColumnToNodePath(input, getLine(input, 'scale')),
			updates: [
				{
					key: 'style.scale',
					operation: {type: 'remove', frame: 12},
				},
			],
		});

	expect(oldValueStrings).toEqual(['interpolate(frame, [12], [320])']);
	expect(newValueStrings).toEqual(['320']);
	expect(output).toContain('style={{scale: 320}}');
	const status = computeSequencePropsStatusFromContent({
		fileContents: output,
		nodePath: updatedNodePath,
		componentIdentity: null,
		keys: ['style.scale'],
		effects: [],
	});
	expect(status.props['style.scale']).toEqual({
		status: 'static',
		codeValue: 320,
	});
});

test('updateSequenceKeyframes keeps a color interpolation when one keyframe remains', async () => {
	const {output, oldValueStrings} = await updateSequenceKeyframes({
		input: colorInput,
		nodePath: lineColumnToNodePath(colorInput, getLine(colorInput, '<Solid')),
		updates: [
			{
				key: 'color',
				operation: {type: 'remove', frame: 0},
			},
		],
	});

	expect(oldValueStrings).toEqual([
		"interpolateColors(frame, [0, 100], ['red', 'blue'])",
	]);
	expect(output).toContain("color={interpolateColors(frame, [100], ['blue'])}");
});

test('updateEffectKeyframes converts a static value to a clamped interpolation', () => {
	const input = effectInput.replace(
		'interpolate(frame, [0, 50, 100], [0.2, 0.5, 0.8])',
		'0.2',
	);
	const {serialized, oldValueStrings} = updateEffectKeyframesAst({
		input,
		sequenceNodePath: lineColumnToNodePath(
			input,
			getLine(input, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [
			{
				key: 'amount',
				operation: {type: 'add', frame: 40, value: 0.6},
			},
		],
	});

	expect(oldValueStrings).toEqual(['0.2']);
	expect(serialized).toContain('amount: interpolate(frame, [40], [0.6], {');
	expect(serialized).toContain('extrapolateLeft: "clamp"');
	expect(serialized).toContain('extrapolateRight: "clamp"');
});

test('updateEffectKeyframes adds a missing prop before keyframing it', () => {
	const {serialized, oldValueStrings} = updateEffectKeyframesAst({
		input: waveEffectInput,
		sequenceNodePath: lineColumnToNodePath(
			waveEffectInput,
			getLine(waveEffectInput, '<Solid'),
		),
		effectIndex: 0,
		schema: waveSchema,
		updates: [
			{
				key: 'phase',
				operation: {type: 'add', frame: 30, value: 90},
			},
		],
	});

	expect(oldValueStrings).toEqual(['0']);
	expect(serialized).toContain('useCurrentFrame');
	expect(serialized).toContain('const frame = useCurrentFrame();');
	expect(serialized).toContain('phase: interpolate(frame, [30], [90], {');
	expect(serialized).toContain('extrapolateLeft: "clamp"');
	expect(serialized).toContain('extrapolateRight: "clamp"');
});

test('updateEffectKeyframes adds props to a zero-argument effect', () => {
	const input = waveEffectInput.replace('wave({})', 'wave()');
	const {serialized, oldValueStrings} = updateEffectKeyframesAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, getLine(input, '<Solid')),
		effectIndex: 0,
		schema: waveSchema,
		updates: [
			{
				key: 'phase',
				operation: {type: 'add', frame: 15, value: 45},
			},
		],
	});

	expect(oldValueStrings).toEqual(['0']);
	expect(serialized).toContain('wave({');
	expect(serialized).toContain('phase: interpolate(frame, [15], [45], {');
});

test('updateEffectKeyframes sets one easing segment and fills linear segments', () => {
	const {serialized} = updateEffectKeyframesAst({
		input: effectInput,
		sequenceNodePath: lineColumnToNodePath(
			effectInput,
			getLine(effectInput, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [
			{
				key: 'amount',
				operation: {
					type: 'easing',
					segmentIndex: 1,
					easing: {type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1},
				},
			},
		],
	});

	expect(serialized).toContain('Easing');
	expect(serialized).toContain(
		'easing: [Easing.linear, Easing.bezier(0, 0, 0.58, 1)]',
	);
});

test('updateSequenceKeyframes converts the last color keyframe to a static value', async () => {
	const input = colorInput.replace(
		"interpolateColors(frame, [0, 100], ['red', 'blue'])",
		"interpolateColors(frame, [15], ['blue'])",
	);
	const {output, oldValueStrings, newValueStrings, updatedNodePath} =
		await updateSequenceKeyframes({
			input,
			nodePath: lineColumnToNodePath(input, getLine(input, '<Solid')),
			updates: [
				{
					key: 'color',
					operation: {type: 'remove', frame: 15},
				},
			],
		});

	expect(oldValueStrings).toEqual(["interpolateColors(frame, [15], ['blue'])"]);
	expect(newValueStrings).toEqual(["'blue'"]);
	expect(output).toContain("color={'blue'}");
	const status = computeSequencePropsStatusFromContent({
		fileContents: output,
		nodePath: updatedNodePath,
		componentIdentity: null,
		keys: ['color'],
		effects: [],
	});
	expect(status.props.color).toEqual({
		status: 'static',
		codeValue: 'blue',
	});
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

test('updateEffectKeyframes allows moving keyframes outside the sequence range', () => {
	const {serialized, newValueStrings} = updateEffectKeyframesAst({
		input: effectInput,
		sequenceNodePath: lineColumnToNodePath(
			effectInput,
			getLine(effectInput, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [
			{
				key: 'amount',
				operation: {
					type: 'move',
					moves: [
						{fromFrame: 0, toFrame: -20},
						{fromFrame: 100, toFrame: 150},
					],
				},
			},
		],
	});

	expect(newValueStrings).toEqual([
		'interpolate(frame, [-20, 50, 150], [0.2, 0.5, 0.8])',
	]);
	expect(serialized).toContain(
		'amount: interpolate(frame, [-20, 50, 150], [0.2, 0.5, 0.8])',
	);
});

test('updateEffectKeyframes replaces an existing keyframe when moving onto it', () => {
	const {serialized, newValueStrings} = updateEffectKeyframesAst({
		input: effectInput,
		sequenceNodePath: lineColumnToNodePath(
			effectInput,
			getLine(effectInput, '<HtmlInCanvas'),
		),
		effectIndex: 0,
		updates: [
			{
				key: 'amount',
				operation: {
					type: 'move',
					moves: [{fromFrame: 0, toFrame: 50}],
				},
			},
		],
	});

	expect(newValueStrings).toEqual([
		'interpolate(frame, [50, 100], [0.2, 0.8])',
	]);
	expect(serialized).toContain(
		'amount: interpolate(frame, [50, 100], [0.2, 0.8])',
	);
});

test('updateEffectKeyframes keeps an effect prop interpolation with one keyframe', () => {
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

	expect(serialized).toContain('amount: interpolate(frame, [0], [0.2])');
});

test('updateEffectKeyframes converts the last effect keyframe to a static value', () => {
	const input = effectInput.replace(
		'interpolate(frame, [0, 50, 100], [0.2, 0.5, 0.8])',
		'interpolate(frame, [40], [0.6])',
	);
	const {serialized, oldValueStrings, newValueStrings, effectCallee} =
		updateEffectKeyframesAst({
			input,
			sequenceNodePath: lineColumnToNodePath(
				input,
				getLine(input, '<HtmlInCanvas'),
			),
			effectIndex: 0,
			updates: [
				{
					key: 'amount',
					operation: {type: 'remove', frame: 40},
				},
			],
		});

	expect(effectCallee).toBe('tint');
	expect(oldValueStrings).toEqual(['interpolate(frame, [40], [0.6])']);
	expect(newValueStrings).toEqual(['0.6']);
	expect(serialized).toContain('amount: 0.6');
});
