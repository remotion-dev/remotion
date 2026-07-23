import {expect, test} from 'bun:test';
import {NoReactInternals} from 'remotion/no-react';
import {
	updateMultipleSequenceProps,
	updateSequenceProps,
} from '../codemods/update-sequence-props/update-sequence-props';
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

const videoConfigValues = {
	durationInFrames: 120,
	fps: 30,
	height: 1080,
	width: 1920,
};

test('updateSequenceProps preserves video config multiplication expressions', async () => {
	const input = `import {Sequence, useVideoConfig} from 'remotion';

export const Example: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<Sequence
			premountFor={(2 * fps) as number}
			postmountFor={fps * 2}
			durationInFrames={(2 * fps) as number}
			from={2 * fps}
			style={{opacity: 2 * fps}}
		/>
	);
};
`;
	const {output} = await updateSequenceProps({
		input,
		nodePath: lineColumnToNodePath(input, 6),
		updates: [
			{key: 'premountFor', value: 75, defaultValue: null},
			{key: 'postmountFor', value: 90, defaultValue: null},
			{key: 'durationInFrames', value: 60, defaultValue: null},
			{key: 'from', value: 0, defaultValue: null},
			{key: 'style.opacity', value: 120, defaultValue: null},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
		videoConfigValues,
	});

	expect(output).toContain('premountFor={2.5 * fps}');
	expect(output).toContain('postmountFor={fps * 3}');
	expect(output).toContain('durationInFrames={(2 * fps) as number}');
	expect(output).toContain('from={0}');
	expect(output).not.toContain('0 * fps');
	expect(output).toContain('opacity: 4 * fps');
});

test('updateSequenceProps should update a number value', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 8),
		updates: [{key: 'hueShift', value: 90, defaultValue: null}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('30');
	expect(output).toContain('hueShift={90}');
	// Second LightLeak on line 9 should be unchanged
	expect(output.split('\n')[8]).toContain('hueShift={30}');
});

test('updateSequenceProps should migrate border shorthand to longhands', async () => {
	const input = `import {AbsoluteFill} from 'remotion';

export const Example = () => {
	return (
		<AbsoluteFill
			style={{border: '2px solid rgba(10, 20, 30, 0.5)', opacity: 0.5}}
		/>
	);
};
`;
	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 5),
		updates: [{key: 'style.borderWidth', value: 8, defaultValue: undefined}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(output).not.toContain("border: '2px solid");
	expect(output).toContain('borderWidth: 8');
	expect(output).toContain("borderStyle: 'solid'");
	expect(output).toContain("borderColor: 'rgba(10, 20, 30, 0.5)'");
	expect(output).toContain('opacity: 0.5');
	expect(oldValueStrings).toEqual(['2']);
});

test('updateSequenceProps should migrate a color-only background shorthand', async () => {
	const input = `import {AbsoluteFill} from 'remotion';

export const Example = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundImage: 'url(image.png)',
				background: 'rgba(10, 20, 30, 0.5)',
				opacity: 0.5,
			}}
		/>
	);
};
`;
	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 5),
		updates: [
			{
				key: 'style.backgroundColor',
				value: '#00ff00',
				defaultValue: 'transparent',
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(output).not.toContain("background: 'rgba");
	expect(output).toContain("backgroundColor: '#00ff00'");
	expect(output).toContain("backgroundImage: 'url(image.png)'");
	expect(output).toContain("backgroundImage: 'none'");
	expect(output).toContain("backgroundPosition: '0% 0%'");
	expect(output).toContain("backgroundSize: 'auto auto'");
	expect(output).toContain("backgroundRepeat: 'repeat'");
	expect(output).toContain("backgroundOrigin: 'padding-box'");
	expect(output).toContain("backgroundClip: 'border-box'");
	expect(output).toContain("backgroundAttachment: 'scroll'");
	expect(output).toContain('opacity: 0.5');
	expect(oldValueStrings).toEqual(['"rgba(10, 20, 30, 0.5)"']);
});

test('updateSequenceProps should update durationInFrames', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 9),
		updates: [{key: 'durationInFrames', value: 120, defaultValue: null}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('60');
	expect(output.split('\n')[8]).toContain('durationInFrames={120}');
	// First LightLeak on line 8 should be unchanged
	expect(output.split('\n')[7]).toContain('durationInFrames={60}');
});

test('updateSequenceProps should add a new attribute', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 9),
		updates: [{key: 'speed', value: 2, defaultValue: null}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('');
	expect(output.split('\n')[8]).toContain('speed={2}');
});

test('updateSequenceProps should preserve staticFile() for asset fields', async () => {
	const input = `import {Img, staticFile} from 'remotion';

export const Example = () => {
	return <Img src={staticFile('old.png')} />;
};
`;
	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 4),
		updates: [
			{
				key: 'src',
				value: 'remotion-file:folder/new%20image.png',
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
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe("staticFile('old.png')");
	expect(output).toContain(`src={staticFile('folder/new image.png')}`);
});

test('updateSequenceProps should remove attribute when value equals default', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 9),
		updates: [{key: 'hueShift', value: 0, defaultValue: 0}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('30');
	expect(output.split('\n')[8]).not.toContain('hueShift');
	// First LightLeak should still have hueShift
	expect(output.split('\n')[7]).toContain('hueShift={30}');
});

test('updateSequenceProps should remove name when value is empty string default', async () => {
	const input = `import {Sequence} from 'remotion';

export const Example: React.FC = () => {
	return (
		<Sequence name="Intro">
			<div />
		</Sequence>
	);
};
`;

	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 5),
		updates: [{key: 'name', value: '', defaultValue: ''}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe('"Intro"');
	expect(output).not.toContain('name=');
});

test('updateSequenceProps should set optional attribute to null', async () => {
	const input = `import {Sequence} from 'remotion';

export const Example: React.FC = () => {
	return (
		<Sequence from={0} freeze={12}>
			<div />
		</Sequence>
	);
};
`;

	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 5),
		updates: [{key: 'freeze', value: null, defaultValue: null}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe('12');
	expect(output).toContain('freeze={null}');
});

test('updateSequenceProps should set boolean true as shorthand', async () => {
	const {output} = await updateSequenceProps({
		videoConfigValues: null,
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 8),
		updates: [{key: 'loop', value: true, defaultValue: false}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	// true booleans become shorthand: `loop` not `loop={true}`
	expect(output.split('\n')[7]).toContain('loop');
	expect(output.split('\n')[7]).not.toContain('loop={true}');
});

test('updateSequenceProps should add showInTimeline false', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 8),
		updates: [{key: 'showInTimeline', value: false, defaultValue: true}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe('true');
	expect(output).toContain('showInTimeline={false}');
});

test('updateSequenceProps should report oldValueString for computed expressions', async () => {
	const {oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 8),
		updates: [{key: 'seed', value: 5, defaultValue: null}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('1 + 2');
});

test('updateSequenceProps should report default as oldValueString for missing attribute', async () => {
	const {oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input: lightLeakInput,
		nodePath: lineColumnToNodePath(lightLeakInput, 8),
		updates: [{key: 'speed', value: 2, defaultValue: 1}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('1');
});

test('updateSequenceProps should throw for non-existent nodePath', async () => {
	await expect(
		updateSequenceProps({
			videoConfigValues: null,
			input: lightLeakInput,
			nodePath: ['program', 'body', 999],
			updates: [{key: 'hueShift', value: 90, defaultValue: null}],
			schema: NoReactInternals.sequenceSchema,
			prettierConfigOverride: null,
		}),
	).rejects.toThrow(
		'Could not find a JSX element at the specified line to update',
	);
});

test('updateMultipleSequenceProps should update multiple nodes in one format pass', async () => {
	const {output, results} = await updateMultipleSequenceProps({
		input: lightLeakInput,
		changes: [
			{
				nodePath: lineColumnToNodePath(lightLeakInput, 8),
				updates: [{key: 'hueShift', value: 90, defaultValue: null}],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
			{
				nodePath: lineColumnToNodePath(lightLeakInput, 9),
				updates: [{key: 'durationInFrames', value: 120, defaultValue: null}],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
		prettierConfigOverride: null,
	});

	expect(results[0].oldValueStrings[0]).toBe('30');
	expect(results[1].oldValueStrings[0]).toBe('60');
	expect(output.split('\n')[7]).toContain('hueShift={90}');
	expect(output.split('\n')[8]).toContain('durationInFrames={120}');
});

test('updateSequenceProps should update JSX text children', async () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return <Interactive.P>Hello</Interactive.P>;
};
`;

	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 5),
		updates: [{key: 'children', value: 'Goodbye', defaultValue: ''}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe('Hello');
	expect(output).toContain('<Interactive.P>Goodbye</Interactive.P>');
});

test('updateSequenceProps should preserve trailing spaces in JSX text children', async () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return <Interactive.P>Hello</Interactive.P>;
};
`;

	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 5),
		updates: [{key: 'children', value: 'Cool! I ', defaultValue: ''}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe('Hello');
	expect(output).toContain("<Interactive.P>{'Cool! I '}</Interactive.P>");
});

test('updateSequenceProps should update children attribute', async () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return <Interactive.P children="Hello" />;
};
`;

	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 5),
		updates: [{key: 'children', value: 'Goodbye', defaultValue: ''}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe('Hello');
	expect(output).toContain('<Interactive.P children="Goodbye" />');
	expect(output).not.toContain('>Goodbye</Interactive.P>');
});

test('updateSequenceProps should update children attribute instead of JSX children', async () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return <Interactive.P children="Hello">Stale</Interactive.P>;
};
`;

	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 5),
		updates: [{key: 'children', value: 'Goodbye', defaultValue: ''}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe('Hello');
	expect(output).toContain(
		'<Interactive.P children="Goodbye">Stale</Interactive.P>',
	);
});

test('updateSequenceProps should update empty JSX text children', async () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return <Interactive.P></Interactive.P>;
};
`;

	const {output, oldValueStrings} = await updateSequenceProps({
		videoConfigValues: null,
		input,
		nodePath: lineColumnToNodePath(input, 5),
		updates: [{key: 'children', value: 'Hello again', defaultValue: ''}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe('');
	expect(output).toContain('<Interactive.P>Hello again</Interactive.P>');
});

test('updateSequenceProps should refuse complex children', async () => {
	const input = `import React from 'react';
import {Interactive} from 'remotion';

export const Example: React.FC = () => {
	return (
		<Interactive.P>
			Hello <Interactive.Strong>world</Interactive.Strong>
		</Interactive.P>
	);
};
`;

	await expect(
		updateSequenceProps({
			videoConfigValues: null,
			input,
			nodePath: lineColumnToNodePath(input, 6),
			updates: [{key: 'children', value: 'Goodbye', defaultValue: ''}],
			schema: NoReactInternals.sequenceSchema,
			prettierConfigOverride: null,
		}),
	).rejects.toThrow(
		'Cannot update text content because JSX children are not static text',
	);
});
