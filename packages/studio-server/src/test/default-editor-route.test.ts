import {expect, test} from 'bun:test';
import {updateDefaultEditorInConfig} from '../preview-server/routes/default-editor';

test('appends the default editor to the config on a new line', () => {
	expect(
		updateDefaultEditorInConfig({
			configContents: "import {Config} from '@remotion/cli/config';\n",
			defaultEditor: 'cursor',
		}),
	).toBe(
		"import {Config} from '@remotion/cli/config';\nConfig.setDefaultEditor('cursor');\n",
	);
});

test('replaces all existing default editor calls', () => {
	expect(
		updateDefaultEditorInConfig({
			configContents: [
				"import {Config} from '@remotion/cli/config';",
				"Config.setDefaultEditor('vscode');",
				'Config.setDefaultEditor(',
				"\t'zed',",
				');',
				'Config.setOverwriteOutput(true);',
				'',
			].join('\n'),
			defaultEditor: 'cursor',
		}),
	).toBe(
		[
			"import {Config} from '@remotion/cli/config';",
			'Config.setOverwriteOutput(true);',
			"Config.setDefaultEditor('cursor');",
			'',
		].join('\n'),
	);
});

test('preserves commented and string references to the setter', () => {
	expect(
		updateDefaultEditorInConfig({
			configContents: [
				"import {Config} from '@remotion/cli/config';",
				"// Config.setDefaultEditor('vscode');",
				'const example = "Config.setDefaultEditor(\'zed\');";',
				'',
			].join('\n'),
			defaultEditor: 'cursor',
		}),
	).toBe(
		[
			"import {Config} from '@remotion/cli/config';",
			"// Config.setDefaultEditor('vscode');",
			'const example = "Config.setDefaultEditor(\'zed\');";',
			"Config.setDefaultEditor('cursor');",
			'',
		].join('\n'),
	);
});
