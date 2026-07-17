import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {setPublicLicenseKeyInConfig} from '../set-public-license-key-in-config';

const VALID_COMPANY_KEY =
	'rm_pub_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV';

const withTempDir = (fn: (dir: string) => void) => {
	const dir = mkdtempSync(path.join(tmpdir(), 'remotion-license-config-'));
	try {
		fn(dir);
	} finally {
		rmSync(dir, {recursive: true, force: true});
	}
};

test('creates remotion.config.ts when missing', () => {
	withTempDir((dir) => {
		const {configFile} = setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: 'free-license',
		});

		expect(configFile).toBe(path.join(dir, 'remotion.config.ts'));
		expect(readFileSync(configFile, 'utf-8')).toBe(
			`import {Config} from '@remotion/cli/config';\n\nConfig.setPublicLicenseKey("free-license");\n`,
		);
	});
});

test('appends setter when config has no setPublicLicenseKey', () => {
	withTempDir((dir) => {
		const configFile = path.join(dir, 'remotion.config.ts');
		writeFileSync(
			configFile,
			`import {Config} from '@remotion/cli/config';\n\nConfig.setVideoImageFormat('jpeg');\n`,
		);

		setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: 'free-license',
		});

		expect(readFileSync(configFile, 'utf-8')).toBe(
			`import {Config} from '@remotion/cli/config';\n\nConfig.setVideoImageFormat('jpeg');\nConfig.setPublicLicenseKey("free-license");\n`,
		);
	});
});

test('adds Config import when appending setter', () => {
	withTempDir((dir) => {
		const configFile = path.join(dir, 'remotion.config.ts');
		writeFileSync(configFile, `Config.setVideoImageFormat('jpeg');\n`);

		setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: 'free-license',
		});

		expect(readFileSync(configFile, 'utf-8')).toBe(
			`import {Config} from '@remotion/cli/config';\n\nConfig.setVideoImageFormat('jpeg');\nConfig.setPublicLicenseKey("free-license");\n`,
		);
	});
});

test('replaces existing setter with single quotes', () => {
	withTempDir((dir) => {
		const configFile = path.join(dir, 'remotion.config.ts');
		writeFileSync(
			configFile,
			`import {Config} from '@remotion/cli/config';\n\nConfig.setPublicLicenseKey('old-key');\n`,
		);

		setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: 'free-license',
		});

		expect(readFileSync(configFile, 'utf-8')).toBe(
			`import {Config} from '@remotion/cli/config';\n\nConfig.setPublicLicenseKey("free-license");\n`,
		);
	});
});

test('replaces existing setter with double quotes', () => {
	withTempDir((dir) => {
		const configFile = path.join(dir, 'remotion.config.ts');
		writeFileSync(
			configFile,
			`import {Config} from '@remotion/cli/config';\n\nConfig.setPublicLicenseKey("old-key");\n`,
		);

		setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: VALID_COMPANY_KEY,
		});

		expect(readFileSync(configFile, 'utf-8')).toBe(
			`import {Config} from '@remotion/cli/config';\n\nConfig.setPublicLicenseKey(${JSON.stringify(VALID_COMPANY_KEY)});\n`,
		);
	});
});

test('replaces multiline existing setter without duplicating', () => {
	withTempDir((dir) => {
		const configFile = path.join(dir, 'remotion.config.ts');
		writeFileSync(
			configFile,
			`import {Config} from '@remotion/cli/config';\n\nConfig.setPublicLicenseKey(\n\t'old-key'\n);\n`,
		);

		setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: 'free-license',
		});

		const next = readFileSync(configFile, 'utf-8');
		expect(next).toBe(
			`import {Config} from '@remotion/cli/config';\n\nConfig.setPublicLicenseKey("free-license");\n`,
		);
		expect(next.match(/setPublicLicenseKey/g)?.length).toBe(1);
	});
});

test('replaces existing backtick setter', () => {
	withTempDir((dir) => {
		const configFile = path.join(dir, 'remotion.config.ts');
		writeFileSync(
			configFile,
			"import {Config} from '@remotion/cli/config';\n\nConfig.setPublicLicenseKey(`old-key`);\n",
		);

		setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: 'free-license',
		});

		expect(readFileSync(configFile, 'utf-8')).toBe(
			`import {Config} from '@remotion/cli/config';\n\nConfig.setPublicLicenseKey("free-license");\n`,
		);
	});
});

test('prefers remotion.config.ts over remotion.config.js', () => {
	withTempDir((dir) => {
		const tsFile = path.join(dir, 'remotion.config.ts');
		const jsFile = path.join(dir, 'remotion.config.js');
		writeFileSync(
			tsFile,
			`import {Config} from '@remotion/cli/config';\n\nConfig.setVideoImageFormat('jpeg');\n`,
		);
		writeFileSync(
			jsFile,
			`import {Config} from '@remotion/cli/config';\n\nConfig.setVideoImageFormat('png');\n`,
		);

		const {configFile} = setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: 'free-license',
		});

		expect(configFile).toBe(tsFile);
		expect(readFileSync(tsFile, 'utf-8')).toContain(
			'Config.setPublicLicenseKey("free-license");',
		);
		expect(readFileSync(jsFile, 'utf-8')).not.toContain('setPublicLicenseKey');
	});
});

test('uses remotion.config.js when ts is missing', () => {
	withTempDir((dir) => {
		const jsFile = path.join(dir, 'remotion.config.js');
		writeFileSync(
			jsFile,
			`import {Config} from '@remotion/cli/config';\n\nConfig.setVideoImageFormat('jpeg');\n`,
		);

		const {configFile} = setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: 'free-license',
		});

		expect(configFile).toBe(jsFile);
		expect(readFileSync(jsFile, 'utf-8')).toContain(
			'Config.setPublicLicenseKey("free-license");',
		);
	});
});

test('accepts a realistic 55-character company license key', () => {
	withTempDir((dir) => {
		expect(VALID_COMPANY_KEY.length).toBe(55);

		const {configFile} = setPublicLicenseKeyInConfig({
			remotionRoot: dir,
			licenseKey: VALID_COMPANY_KEY,
		});

		expect(readFileSync(configFile, 'utf-8')).toContain(
			`Config.setPublicLicenseKey(${JSON.stringify(VALID_COMPANY_KEY)});`,
		);
	});
});

test('rejects invalid license keys', () => {
	withTempDir((dir) => {
		expect(() =>
			setPublicLicenseKeyInConfig({
				remotionRoot: dir,
				licenseKey: 'not-a-valid-key',
			}),
		).toThrow(/Invalid public license key/);
	});
});

test('rejects string breakout payload', () => {
	withTempDir((dir) => {
		expect(() =>
			setPublicLicenseKeyInConfig({
				remotionRoot: dir,
				licenseKey: "rm_pub_'); console.log('PWNED'); //",
			}),
		).toThrow(/alphanumeric|Invalid public license key/);
	});
});

test('rejects short rm_pub_ keys', () => {
	withTempDir((dir) => {
		expect(() =>
			setPublicLicenseKeyInConfig({
				remotionRoot: dir,
				licenseKey: 'rm_pub_short',
			}),
		).toThrow(/55 characters/);
	});
});

test('rejects non-alphanumeric characters after rm_pub_ prefix', () => {
	withTempDir((dir) => {
		expect(() =>
			setPublicLicenseKeyInConfig({
				remotionRoot: dir,
				licenseKey: 'rm_pub_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST-V',
			}),
		).toThrow(/alphanumeric/);
	});
});
