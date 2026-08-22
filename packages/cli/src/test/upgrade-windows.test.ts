import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

test.skipIf(process.platform !== 'win32')(
	'upgrade runs the npm command shim on Windows',
	() => {
		const temporaryDirectory = mkdtempSync(
			path.join(tmpdir(), 'remotion-upgrade-windows-'),
		);
		const npmInvocation = path.join(temporaryDirectory, 'npm-invocation.txt');

		try {
			writeFileSync(
				path.join(temporaryDirectory, 'package.json'),
				JSON.stringify({dependencies: {remotion: '4.0.512'}}),
			);
			writeFileSync(path.join(temporaryDirectory, 'package-lock.json'), '{}');
			writeFileSync(
				path.join(temporaryDirectory, 'npm.cmd'),
				[
					'@echo off',
					'if "%1"=="view" (',
					'  echo {}',
					'  exit /b 0',
					')',
					`echo %* > "${npmInvocation}"`,
					'exit /b 0',
				].join('\r\n'),
			);
			const runner = path.join(temporaryDirectory, 'run-upgrade.cjs');
			writeFileSync(
				runner,
				`const {upgradeCommand} = require(${JSON.stringify(
					path.join(__dirname, '..', '..', 'dist', 'upgrade.js'),
				)});

(async () => {
	await upgradeCommand(${JSON.stringify({
		remotionRoot: temporaryDirectory,
		version: '4.0.513',
		skipSkills: true,
		logLevel: 'error',
		args: [],
	})});
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
`,
			);

			const result = spawnSync('node', [runner], {
				cwd: temporaryDirectory,
				env: {
					...process.env,
					PATH: `${temporaryDirectory}${path.delimiter}${process.env.PATH ?? ''}`,
				},
				encoding: 'utf-8',
			});

			expect(result.status, result.stderr).toBe(0);

			expect(readFileSync(npmInvocation, 'utf-8').trim()).toBe(
				'i --save-exact --no-fund --no-audit remotion@4.0.513',
			);
		} finally {
			rmSync(temporaryDirectory, {recursive: true, force: true});
		}
	},
);
