import {expect, test} from 'bun:test';
import {execFileSync} from 'child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync} from 'fs';
import os from 'os';
import path from 'path';

test.skipIf(process.platform !== 'win32')(
	'installs Whisper in Windows paths containing spaces and PowerShell characters',
	() => {
		const root = mkdtempSync(path.join(os.tmpdir(), 'remotion-whisper-'));
		const project = path.join(
			root,
			"NodeJs Projects [1] $value & 'quote' `tick`",
		);
		const to = path.join(
			project,
			"data [2] $value & 'quote' `tick`",
			'whisper.cpp',
		);
		const executableContents = 'Whisper executable fixture';

		try {
			mkdirSync(project);
			execFileSync(
				'node',
				[
					path.join(__dirname, 'fixtures', 'install-whisper.mjs'),
					path.resolve(__dirname, '../../dist/install-whisper-cpp.js'),
					path.join(__dirname, 'fixtures', 'whisper.zip'),
					to,
				],
				{cwd: project, stdio: 'inherit', timeout: 30_000},
			);
			expect(readFileSync(path.join(to, 'main.exe'), 'utf8')).toBe(
				executableContents,
			);
			expect(existsSync(path.join(project, 'whisper-bin-x64.zip'))).toBe(false);
		} finally {
			rmSync(root, {recursive: true, force: true});
		}
	},
	30_000,
);
