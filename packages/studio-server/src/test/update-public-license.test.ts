import {expect, test} from 'bun:test';
import {updatePublicLicenseInConfig} from '../preview-server/routes/update-public-license';

test('appends the free license to the config on a new line', () => {
	expect(
		updatePublicLicenseInConfig({
			configContents: "import {Config} from '@remotion/cli/config';\n",
			publicLicenseKey: 'free-license',
		}),
	).toBe(
		"import {Config} from '@remotion/cli/config';\nConfig.setPublicLicenseKey('free-license');\n",
	);
});

test('escapes a public license key before adding it to the config', () => {
	expect(
		updatePublicLicenseInConfig({
			configContents: "import {Config} from '@remotion/cli/config';",
			publicLicenseKey: "rm_pub_'quoted",
		}),
	).toBe(
		"import {Config} from '@remotion/cli/config';\nConfig.setPublicLicenseKey('rm_pub_\\'quoted');\n",
	);
});

test('replaces all existing public license key calls', () => {
	expect(
		updatePublicLicenseInConfig({
			configContents: [
				"import {Config} from '@remotion/cli/config';",
				"Config.setPublicLicenseKey('free-license');",
				'Config.setPublicLicenseKey(',
				"\t'rm_pub_old',",
				');',
				'Config.setOverwriteOutput(true);',
				'',
			].join('\n'),
			publicLicenseKey: 'rm_pub_new',
		}),
	).toBe(
		[
			"import {Config} from '@remotion/cli/config';",
			'Config.setOverwriteOutput(true);',
			"Config.setPublicLicenseKey('rm_pub_new');",
			'',
		].join('\n'),
	);
});

test('preserves commented and string references to the setter', () => {
	expect(
		updatePublicLicenseInConfig({
			configContents: [
				"import {Config} from '@remotion/cli/config';",
				"// Config.setPublicLicenseKey('commented');",
				'const example = "Config.setPublicLicenseKey(\'example\');";',
				'',
			].join('\n'),
			publicLicenseKey: 'free-license',
		}),
	).toBe(
		[
			"import {Config} from '@remotion/cli/config';",
			"// Config.setPublicLicenseKey('commented');",
			'const example = "Config.setPublicLicenseKey(\'example\');";',
			"Config.setPublicLicenseKey('free-license');",
			'',
		].join('\n'),
	);
});
