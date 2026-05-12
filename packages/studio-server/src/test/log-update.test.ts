import {afterAll, beforeAll, expect, spyOn, test} from 'bun:test';

const originalForceColor = process.env.FORCE_COLOR;
process.env.FORCE_COLOR = '1';

import {readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import {Internals} from 'remotion';
import {updateSequenceProps} from '../codemods/update-sequence-props';
import {
	fg,
	formatPropChange,
	logUpdate,
	normalizeQuotes,
	strikeThrough,
} from '../preview-server/routes/log-update';
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
	expect(chalk.enabled()).toBe(true);

	const {output, oldValueStrings, formatted, logLine} =
		await updateSequenceProps({
			input,
			nodePath: lineColumnToNodePath(input, 8),
			updates: [{key: 'hueShift', value: 90, defaultValue: null}],
			schema: Internals.sequenceSchema,
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

		// Mirror the Monokai palette from log-update.ts.
		const attrName = (s: string) => fg(166, 226, 46, s);
		const equals = (s: string) => fg(249, 38, 114, s);
		const punctuation = (s: string) => fg(248, 248, 242, s);
		const numberValue = (s: string) => fg(174, 129, 255, s);

		const simpleProp = (key: string, value: string) =>
			`${attrName(key)}${equals('=')}${punctuation('{')}${numberValue(value)}${punctuation('}')}`;

		const expectedPropChange = `${simpleProp('hueShift', '30')} → ${simpleProp('hueShift', '90')}`;
		const expectedLine = `${chalk.blueBright('src/Example.tsx:8:')} ${expectedPropChange}`;

		expect(logged).toBe(expectedLine);
	} finally {
		consoleSpy.mockRestore();
	}
});

test('logUpdate emits change-from-default output for discriminated union enum change', async () => {
	expect(chalk.enabled()).toBe(true);

	const fixture = readFileSync(
		path.join(__dirname, 'snapshots', 'discriminated-union-with-style.tsx'),
		'utf-8',
	);

	const {oldValueStrings, formatted, logLine, removedProps} =
		await updateSequenceProps({
			input: fixture,
			nodePath: lineColumnToNodePath(fixture, 3),
			updates: [
				{
					key: 'layout',
					value: 'none',
					defaultValue: Internals.sequenceSchema.layout.default,
				},
			],
			schema: Internals.sequenceSchema,
		});

	expect(oldValueStrings[0]).toBe('"absolute-fill"');
	expect(removedProps).toEqual([
		{key: 'style', valueString: 'style={{ scale: 1.74 }}'},
	]);

	const newValueString = JSON.stringify('none');
	const defaultValueString = JSON.stringify(
		Internals.sequenceSchema.layout.default,
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

		const attrName = (s: string) => fg(166, 226, 46, s);
		const equals = (s: string) => fg(249, 38, 114, s);
		const punctuation = (s: string) => fg(248, 248, 242, s);
		const stringValue = (s: string) => fg(230, 219, 116, s);

		const simpleProp = (key: string, value: string) =>
			`${attrName(key)}${equals('=')}${punctuation('{')}${stringValue(value)}${punctuation('}')}`;

		const expectedPropChange = `${simpleProp('layout', "'none'")}, ${strikeThrough('style={{ scale: 1.74 }}')}`;
		const expectedLine = `${chalk.blueBright(`src/Example.tsx:${logLine}:`)} ${expectedPropChange}`;

		expect(logged).toBe(expectedLine);
	} finally {
		consoleSpy.mockRestore();
	}
});
