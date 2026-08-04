import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	classifyConfigFileChange,
	makeConfigFileFingerprints,
} from '../config-file-change';
import {prepareConfigFile} from '../load-config';

const prepare = (body: string) => `
"use strict";
var import_config = require("@remotion/cli/config");
${body}
`;

const classify = (startupCode: string, currentCode: string) => {
	return classifyConfigFileChange({
		currentCode,
		startupFingerprints: makeConfigFileFingerprints(startupCode),
	});
};

test('classifies runtime config changes', () => {
	expect(
		classify(
			prepare('import_config.Config.setCodec("h264");'),
			prepare('import_config.Config.setCodec("h265");'),
		),
	).toBe('runtime');
	expect(
		classify(
			'"use strict";',
			prepare('import_config.Config.setPublicLicenseKey("license-key");'),
		),
	).toBe('runtime');
	expect(
		classify(
			prepare('Config.setInteractivityEnabled(true);'),
			prepare('Config.setInteractivityEnabled(false);'),
		),
	).toBe('runtime');
});

test('classifies changes that require a page reload', () => {
	expect(
		classify(
			prepare('import_config.Config.setAudioLatencyHint("playback");'),
			prepare('import_config.Config.setAudioLatencyHint("interactive");'),
		),
	).toBe('reload');
});

test('classifies changes that require a Studio restart', () => {
	expect(
		classify(
			prepare('import_config.Config.setRspack(false);'),
			prepare('import_config.Config.setRspack(true);'),
		),
	).toBe('restart');
	expect(
		classify('"use strict";\nvar value = 1;', '"use strict";\nvar value = 2;'),
	).toBe('restart');
	expect(
		classify(
			prepare('import_config.Config.setNumberOfSharedAudioTags(0);'),
			prepare(
				'import_config.Config.setNumberOfSharedAudioTags(5); import_config.Config.setRspack(true);',
			),
		),
	).toBe('restart');
});

test('compares changes to the original startup config', () => {
	const startup = prepare(
		'import_config.Config.setNumberOfSharedAudioTags(0);',
	);
	const startupFingerprints = makeConfigFileFingerprints(startup);

	expect(
		classifyConfigFileChange({
			currentCode: prepare(
				'import_config.Config.setNumberOfSharedAudioTags(5);',
			),
			startupFingerprints,
		}),
	).toBe('reload');
	expect(
		classifyConfigFileChange({
			currentCode: startup,
			startupFingerprints,
		}),
	).toBe('runtime');
});

test('classifies prepared config code', async () => {
	const directory = mkdtempSync(path.join(tmpdir(), 'remotion-config-change-'));
	const configFile = path.join(directory, 'remotion.config.js');
	try {
		writeFileSync(
			configFile,
			`const {Config} = require('@remotion/cli/config'); Config.setCodec('h264');`,
		);
		const startup = await prepareConfigFile(
			directory,
			'remotion.config.js',
			true,
		);

		writeFileSync(
			configFile,
			`const {Config} = require('@remotion/cli/config'); Config.setCodec('h265');`,
		);
		const current = await prepareConfigFile(
			directory,
			'remotion.config.js',
			true,
		);

		expect(
			classifyConfigFileChange({
				currentCode: current.code,
				startupFingerprints: makeConfigFileFingerprints(startup.code),
			}),
		).toBe('runtime');
	} finally {
		rmSync(directory, {recursive: true});
	}
});
