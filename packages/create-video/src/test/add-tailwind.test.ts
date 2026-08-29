import {expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {addTailwindToConfig} from '../add-tailwind';

for (const extension of ['ts', 'js']) {
	test(`Adds a bundler-compatible Tailwind override to a ${extension} config`, () => {
		const projectRoot = fs.mkdtempSync(
			path.join(os.tmpdir(), 'create-video-tailwind-'),
		);
		const configFile = path.join(projectRoot, `remotion.config.${extension}`);

		try {
			fs.writeFileSync(
				configFile,
				`import { Config } from '@remotion/cli/config';\n\nConfig.setRspack(true);\n`,
			);

			addTailwindToConfig(projectRoot);

			const config = fs.readFileSync(configFile, 'utf-8');
			expect(config).toContain(
				`import { enableTailwind } from '@remotion/tailwind-v4';`,
			);
			expect(config).toContain('Config.overrideBundlerConfig(enableTailwind);');
			expect(config).not.toContain('Config.overrideWebpackConfig');
		} finally {
			fs.rmSync(projectRoot, {recursive: true, force: true});
		}
	});
}
