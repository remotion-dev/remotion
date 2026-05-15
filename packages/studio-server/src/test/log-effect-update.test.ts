import {afterAll, beforeAll, expect, spyOn, test} from 'bun:test';

const originalForceColor = process.env.FORCE_COLOR;
process.env.FORCE_COLOR = '1';

import {RenderInternals} from '@remotion/renderer';
import {formatEffectPropChange} from '../preview-server/routes/log-updates/format-effect-prop-change';
import {
	attrName,
	colorEnabled,
	numberValue,
	punctuation,
	strikeThroughOrRemovedPrefix,
} from '../preview-server/routes/log-updates/formatting';
import {logEffectUpdate} from '../preview-server/routes/log-updates/log-effect-update';

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

const halftoneCall = (propKey: string, value: string) => {
	return `${attrName('halftone')}${punctuation('(')}${punctuation('{')}${punctuation(propKey)}${punctuation(': ')}${numberValue(value)}${punctuation('}')}${punctuation(')')}`;
};

test('logEffectUpdate prints halftone({dotSize}) → halftone({dotSize}) when dotSize changes', () => {
	const consoleSpy = spyOn(console, 'log').mockImplementation(() => undefined);

	try {
		logEffectUpdate({
			fileRelativeToRoot: 'src/HtmlInCanvas/react-svg.tsx',
			line: 21,
			effectName: 'halftone',
			propKey: 'dotSize',
			oldValueString: '30',
			newValueString: '52',
			defaultValueString: null,
			formatted: true,
			logLevel: 'info',
			removedProps: [],
			addedProps: [],
		});

		expect(consoleSpy).toHaveBeenCalledTimes(1);
		const logged = consoleSpy.mock.calls[0].join(' ');

		const expectedPropChange = `${halftoneCall('dotSize', '30')} \u2192 ${halftoneCall('dotSize', '52')}`;
		const expectedLine = `${chalk.blueBright('src/HtmlInCanvas/react-svg.tsx:21')} ${expectedPropChange}`;

		expect(logged).toBe(expectedLine);
	} finally {
		consoleSpy.mockRestore();
	}
});

test('logEffectUpdate prints halftone({dotSpacing}) when dotSpacing is added explicitly', () => {
	const consoleSpy = spyOn(console, 'log').mockImplementation(() => undefined);

	try {
		logEffectUpdate({
			fileRelativeToRoot: 'src/HtmlInCanvas/react-svg.tsx',
			line: 21,
			effectName: 'halftone',
			propKey: 'dotSpacing',
			oldValueString: '20',
			newValueString: '2',
			defaultValueString: '20',
			formatted: true,
			logLevel: 'info',
			removedProps: [],
			addedProps: [],
		});

		expect(consoleSpy).toHaveBeenCalledTimes(1);
		const logged = consoleSpy.mock.calls[0].join(' ');

		const addedCall = halftoneCall('dotSpacing', '2');
		const expectedPropChange = colorEnabled()
			? addedCall
			: `added: ${addedCall}`;
		const expectedLine = `${chalk.blueBright('src/HtmlInCanvas/react-svg.tsx:21')} ${expectedPropChange}`;

		expect(logged).toBe(expectedLine);
	} finally {
		consoleSpy.mockRestore();
	}
});

test('logEffectUpdate strikes only the prop body when removing offsetX to default', () => {
	const consoleSpy = spyOn(console, 'log').mockImplementation(() => undefined);

	try {
		logEffectUpdate({
			fileRelativeToRoot: 'src/HtmlInCanvas/react-svg.tsx',
			line: 21,
			effectName: 'halftone',
			propKey: 'offsetX',
			oldValueString: '58',
			newValueString: '0',
			defaultValueString: '0',
			formatted: true,
			logLevel: 'info',
			removedProps: [],
			addedProps: [],
		});

		expect(consoleSpy).toHaveBeenCalledTimes(1);
		const logged = consoleSpy.mock.calls[0].join(' ');

		const struck = strikeThroughOrRemovedPrefix(
			`${punctuation('offsetX')}${punctuation(': ')}${numberValue('58')}`,
		);
		const expectedPropChange = `${attrName('halftone')}${punctuation('(')}${punctuation('{')}${struck}${punctuation('}')}${punctuation(')')}`;
		const expectedLine = `${chalk.blueBright('src/HtmlInCanvas/react-svg.tsx:21')} ${expectedPropChange}`;

		expect(logged).toBe(expectedLine);
	} finally {
		consoleSpy.mockRestore();
	}
});

test('undo of an added effect prop strikes only offsetX inside halftone({…})', () => {
	const undoPropChange = formatEffectPropChange({
		effectName: 'halftone',
		key: 'offsetX',
		oldValueString: '37',
		newValueString: '0',
		defaultValueString: '0',
		removedProps: [],
		addedProps: [],
	});

	const struck = strikeThroughOrRemovedPrefix(
		`${punctuation('offsetX')}${punctuation(': ')}${numberValue('37')}`,
	);
	const expectedUndo = `${attrName('halftone')}${punctuation('(')}${punctuation('{')}${struck}${punctuation('}')}${punctuation(')')}`;

	expect(undoPropChange).toBe(expectedUndo);
});
