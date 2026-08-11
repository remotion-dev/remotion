import {afterAll, beforeAll, expect, spyOn, test} from 'bun:test';

const originalForceColor = process.env.FORCE_COLOR;
process.env.FORCE_COLOR = '1';

import {readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';
import {updateSequenceProps} from '../codemods/update-sequence-props/update-sequence-props';
import {formatPropChange} from '../preview-server/routes/log-updates/format-prop-change';
import {
	attrName,
	equals,
	inlineAddition,
	numberValue,
	punctuation,
	strikeThrough,
} from '../preview-server/routes/log-updates/formatting';
import {
	logUpdate,
	normalizeQuotes,
} from '../preview-server/routes/log-updates/log-update';
import {lineColumnToNodePath} from './test-utils';

const {chalk} = RenderInternals;

beforeAll(() => {
	process.env.FORCE_COLOR = '1';
});

afterAll(() => {
	if (originalForceColor === undefined) {
		delete process.env.FORCE_COLOR;
	} else {
		process.env.FORCE_COLOR = originalForceColor;
	}
});

const input = `import {LightLeak} from '@remotion/light-leaks';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const LightLeakExample: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<LightLeak durationInFrames={60} seed={1} hueShift={30} />
		</AbsoluteFill>
	);
};
`;

test('logUpdate emits Monokai-colored output after an AST update', async () => {
	const {output, oldValueStrings, formatted, logLine} =
		await updateSequenceProps({
			videoConfigValues: null,
			input,
			nodePath: lineColumnToNodePath(input, 8),
			updates: [{key: 'hueShift', value: 90, defaultValue: null}],
			schema: NoReactInternals.sequenceSchema,
			prettierConfigOverride: null,
		});

	expect(oldValueStrings[0]).toBe('30');
	expect(output).toContain('hueShift={90}');

	const consoleSpy = spyOn(console, 'log').mockImplementation(() => undefined);

	try {
		logUpdate({
			fileRelativeToRoot: 'src/Example.tsx',
			line: logLine,
			key: 'hueShift',
			oldValueString: oldValueStrings[0],
			newValueString: '90',
			defaultValueString: null,
			formatted,
			logLevel: 'info',
			removedProps: [],
			addedProps: [],
		});

		expect(consoleSpy).toHaveBeenCalledTimes(1);
		const logged = consoleSpy.mock.calls[0].join(' ');

		const simpleProp = (key: string, value: string) =>
			`${attrName(key)}${equals('=')}${punctuation('{')}${value}${punctuation('}')}`;

		const expectedPropChange = simpleProp(
			'hueShift',
			`${numberValue('30')} → ${numberValue('90')}`,
		);
		const expectedLine = `${chalk.blueBright('src/Example.tsx:8')} ${expectedPropChange}`;

		expect(logged).toBe(expectedLine);
	} finally {
		consoleSpy.mockRestore();
	}
});

test('formatPropChange condenses unchanged interpolate options', () => {
	const formatted = formatPropChange({
		key: 'width',
		oldValueString: `interpolate(frame, [78], [244], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
})`,
		newValueString: `interpolate(frame, [29, 78], [88, 244], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
})`,
		defaultValueString: null,
		removedProps: [],
		addedProps: [],
	});

	expect(formatted).toBe(
		`${attrName('width')}${equals('=')}${punctuation('{')}interpolate(frame, [78], [244]) → interpolate(frame, [29, 78], [88, 244])${punctuation('}')}`,
	);
	expect(formatted).not.toContain('extrapolateLeft');
	expect(formatted).not.toContain('extrapolateRight');
});

test('formatPropChange omits unchanged interpolate clamping when easing changes', () => {
	const formatted = formatPropChange({
		key: 'scale',
		oldValueString: `interpolate(frame, [68, 78, 88], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: [
        Easing.bezier(0.5526, 3.9109, 0.6487, 4.8024),
        Easing.bezier(0.5526, 3.9109, 0.995, 5),
    ],
})`,
		newValueString: `interpolate(frame, [68, 78, 88], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: [
        Easing.bezier(0.5526, 3.9109, 0.6487, 4.8024),
        Easing.bezier(0.5526, 3.9109, 0.6487, 4.8024),
    ],
})`,
		defaultValueString: null,
		removedProps: [],
		addedProps: [],
	});

	expect(formatted).not.toContain('extrapolateLeft');
	expect(formatted).not.toContain('extrapolateRight');
	expect(formatted).toContain('Easing.bezier(0.5526, 3.9109, 0.995, 5)');
	expect(formatted).toContain('Easing.bezier(0.5526, 3.9109, 0.6487, 4.8024)');
});

test('formatPropChange condenses added interpolateColors options', () => {
	const addedOptions = `, {
    easing: [Easing.bezier(0.4507, 2.3556, 0.6118, 0.0554)]
}`;
	const formatted = formatPropChange({
		key: 'color',
		oldValueString: `interpolateColors(frame, [0, 100], ['#0b84f3', '#f43b00'])`,
		newValueString: `interpolateColors(frame, [0, 100], ['#0b84f3', '#f43b00']${addedOptions})`,
		defaultValueString: null,
		removedProps: [],
		addedProps: [],
	});

	expect(formatted).toBe(
		`${attrName('color')}${equals('=')}${punctuation('{')}interpolateColors(frame, [0, 100], ['#0b84f3', '#f43b00']${inlineAddition(addedOptions)})${punctuation('}')}`,
	);
	expect(formatted).not.toContain(' → ');
});

test('formatPropChange condenses removed interpolateColors options', () => {
	const removedOptions = `, {
    easing: [Easing.bezier(0.4507, 2.3556, 0.6118, 0.0554)]
}`;
	const formatted = formatPropChange({
		key: 'color',
		oldValueString: `interpolateColors(frame, [0, 100], ['#0b84f3', '#f43b00']${removedOptions})`,
		newValueString: `interpolateColors(frame, [0, 100], ['#0b84f3', '#f43b00'])`,
		defaultValueString: null,
		removedProps: [],
		addedProps: [],
	});

	expect(formatted).toBe(
		`${attrName('color')}${equals('=')}${punctuation('{')}interpolateColors(frame, [0, 100], ['#0b84f3', '#f43b00']${strikeThrough(removedOptions)})${punctuation('}')}`,
	);
	expect(formatted).not.toContain(' → ');
});

test('logUpdate emits change-from-default output for discriminated union enum change', async () => {
	const fixture = readFileSync(
		path.join(__dirname, 'snapshots', 'discriminated-union-with-style.tsx'),
		'utf-8',
	);

	const {oldValueStrings, formatted, logLine, removedProps} =
		await updateSequenceProps({
			videoConfigValues: null,
			input: fixture,
			nodePath: lineColumnToNodePath(fixture, 3),
			updates: [
				{
					key: 'layout',
					value: 'none',
					defaultValue: NoReactInternals.sequenceSchema.layout.default,
				},
			],
			schema: NoReactInternals.sequenceSchema,
			prettierConfigOverride: null,
		});

	expect(oldValueStrings[0]).toBe('"absolute-fill"');
	expect(removedProps).toEqual([
		{key: 'style', valueString: '{ scale: 1.74 }'},
	]);

	const newValueString = JSON.stringify('none');
	const defaultValueString = JSON.stringify(
		NoReactInternals.sequenceSchema.layout.default,
	);

	const consoleSpy = spyOn(console, 'log').mockImplementation(() => undefined);

	try {
		logUpdate({
			fileRelativeToRoot: 'src/Example.tsx',
			line: logLine,
			key: 'layout',
			oldValueString: oldValueStrings[0],
			newValueString,
			defaultValueString,
			formatted,
			logLevel: 'info',
			removedProps,
			addedProps: [],
		});

		expect(consoleSpy).toHaveBeenCalledTimes(1);
		const logged = consoleSpy.mock.calls[0].join(' ');

		const expectedPropChange = formatPropChange({
			key: 'layout',
			oldValueString: normalizeQuotes(oldValueStrings[0]),
			newValueString: normalizeQuotes(newValueString),
			defaultValueString:
				defaultValueString !== null
					? normalizeQuotes(defaultValueString)
					: null,
			removedProps,
			addedProps: [],
		});
		const expectedLine = `${chalk.blueBright(`src/Example.tsx:${logLine}`)} ${expectedPropChange}`;

		expect(logged).toBe(expectedLine);
	} finally {
		consoleSpy.mockRestore();
	}
});

test('Undo prop change should not nest key={key={value}} for re-added props', async () => {
	const fixture = readFileSync(
		path.join(__dirname, 'snapshots', 'discriminated-union-with-premount.tsx'),
		'utf-8',
	);

	const {removedProps} = await updateSequenceProps({
		videoConfigValues: null,
		input: fixture,
		nodePath: lineColumnToNodePath(fixture, 3),
		updates: [
			{
				key: 'layout',
				value: 'none',
				defaultValue: NoReactInternals.sequenceSchema.layout.default,
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	const premount = removedProps.find((p) => p.key === 'premountFor');
	if (!premount) {
		throw new Error('premountFor should have been removed');
	}

	const undoPropChange = formatPropChange({
		key: 'layout',
		oldValueString: "'none'",
		newValueString: "'absolute-fill'",
		defaultValueString: "'absolute-fill'",
		removedProps: [],
		addedProps: [premount],
	});

	expect(undoPropChange).not.toContain('premountFor={premountFor=');
	expect(undoPropChange).toContain('premountFor');
	expect(undoPropChange).toContain('25');
});
