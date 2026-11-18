import {expect, test} from 'bun:test';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('Publishing checks referenced LICENSE.md files in compiled and uncompiled archives', async () => {
	const root = path.resolve(__dirname, '..', '..', '..', '..');
	const fixture = mkdtempSync(path.join(tmpdir(), 'remotion-publish-test-'));
	const packagePath = path.join(fixture, 'packages', 'license-test');
	const licensePath = path.join(packagePath, 'LICENSE.md');
	const localLicense = '# Package license\n';

	try {
		mkdirSync(path.join(fixture, 'packages', 'core'), {recursive: true});
		mkdirSync(path.join(packagePath, 'dist'), {recursive: true});
		mkdirSync(path.join(packagePath, 'nested'));
		writeFileSync(
			path.join(fixture, 'packages', 'core', 'package.json'),
			JSON.stringify({name: 'remotion', version: '4.0.0', private: true}),
		);
		writeFileSync(path.join(fixture, 'LICENSE.md'), '# Root license\n');
		writeFileSync(path.join(packagePath, 'dist', 'index.js'), 'export {};\n');
		writeFileSync(
			path.join(packagePath, 'record-license.js'),
			[
				"const fs = require('node:fs');",
				"const license = fs.existsSync('LICENSE.md') ? fs.readFileSync('LICENSE.md', 'utf-8') : null;",
				"fs.writeFileSync('../license-before-pack.json', JSON.stringify(license));",
			].join('\n'),
		);
		writeFileSync(
			path.join(packagePath, 'hide-license.js'),
			"require('node:fs').renameSync('LICENSE.md', 'nested/LICENSE.md');\n",
		);
		writeFileSync(
			path.join(packagePath, 'restore-license.js'),
			"require('node:fs').renameSync('nested/LICENSE.md', 'LICENSE.md');\n",
		);

		for (const make of ['tsrs', 'bun build']) {
			for (const {licenseState, contents} of [
				{licenseState: 'copied', contents: '# Root license\n'},
				{licenseState: 'local', contents: localLicense},
				{licenseState: 'missing', contents: '# Root license\n'},
				{licenseState: 'empty', contents: ' \n\t'},
				{licenseState: 'unreferenced', contents: null},
			] as const) {
				if (licenseState === 'local' || licenseState === 'empty') {
					writeFileSync(licensePath, contents);
				}

				writeFileSync(
					path.join(packagePath, 'package.json'),
					JSON.stringify({
						name: '@remotion/license-test',
						version: '4.0.0',
						license:
							licenseState === 'unreferenced'
								? 'MIT'
								: 'SEE LICENSE IN LICENSE.md',
						scripts: {
							make,
							prepack:
								licenseState === 'missing'
									? 'bun record-license.js && bun hide-license.js'
									: 'bun record-license.js',
							...(licenseState === 'missing'
								? {
										postpack: 'bun restore-license.js',
									}
								: {}),
						},
					}),
				);

				const proc = Bun.spawn(
					[
						process.execPath,
						path.join(root, 'publish.ts'),
						'--check',
						'--only=@remotion/license-test',
					],
					{cwd: fixture, stdout: 'pipe', stderr: 'pipe'},
				);
				const [stdout, stderr, exitCode] = await Promise.all([
					new Response(proc.stdout).text(),
					new Response(proc.stderr).text(),
					proc.exited,
				]);
				expect(
					JSON.parse(
						readFileSync(
							path.join(fixture, 'packages', 'license-before-pack.json'),
							'utf-8',
						),
					),
				).toBe(contents);
				if (licenseState === 'missing' || licenseState === 'empty') {
					expect(exitCode).not.toBe(0);
					expect(stderr).toContain(
						'Missing or empty LICENSE.md in @remotion/license-test tarball',
					);
				} else {
					if (exitCode !== 0) {
						throw new Error(stdout + stderr);
					}

					expect(stdout).toContain('Validated 1 packages');
				}

				if (licenseState === 'local') {
					expect(readFileSync(licensePath, 'utf-8')).toBe(localLicense);
				} else if (licenseState !== 'empty') {
					expect(existsSync(licensePath)).toBe(false);
				}

				rmSync(licensePath, {force: true});
			}
		}
	} finally {
		rmSync(fixture, {recursive: true, force: true});
	}
});
