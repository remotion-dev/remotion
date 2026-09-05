import {expect, spyOn, test} from 'bun:test';
import {execFileSync} from 'child_process';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'fs';
import os from 'os';
import path from 'path';
import {installWhisperCpp} from '../install-whisper-cpp';

test.skipIf(process.platform !== 'win32')(
	'installs Whisper in Windows paths containing spaces and PowerShell characters',
	async () => {
		const root = mkdtempSync(path.join(os.tmpdir(), 'remotion-whisper-'));
		const previousCwd = process.cwd();
		const project = path.join(
			root,
			"NodeJs Projects [1] $value & 'quote' `tick`",
		);
		const to = path.join(
			project,
			"data [2] $value & 'quote' `tick`",
			'whisper.cpp',
		);
		const source = path.join(root, 'main.exe');
		const archive = path.join(root, 'fixture.zip');
		const executableContents = 'Whisper executable fixture';
		const fetchSpy = spyOn(globalThis, 'fetch');

		try {
			mkdirSync(project);
			writeFileSync(source, executableContents);
			execFileSync(
				'powershell.exe',
				[
					'-NoProfile',
					'-NonInteractive',
					'-Command',
					'Compress-Archive -LiteralPath $env:WHISPER_TEST_SOURCE -DestinationPath $env:WHISPER_TEST_ARCHIVE -ErrorAction Stop',
				],
				{
					env: {
						...process.env,
						WHISPER_TEST_SOURCE: source,
						WHISPER_TEST_ARCHIVE: archive,
					},
				},
			);
			const zip = readFileSync(archive);
			fetchSpy.mockResolvedValue(
				new Response(new Uint8Array(zip).buffer, {
					headers: {'content-length': String(zip.length)},
				}),
			);
			process.chdir(project);

			expect(
				await installWhisperCpp({to, version: '1.5.5', printOutput: false}),
			).toEqual({alreadyExisted: false});
			expect(readFileSync(path.join(to, 'main.exe'), 'utf8')).toBe(
				executableContents,
			);
			expect(existsSync(path.join(project, 'whisper-bin-x64.zip'))).toBe(false);
			expect(
				await installWhisperCpp({to, version: '1.5.5', printOutput: false}),
			).toEqual({alreadyExisted: true});
		} finally {
			fetchSpy.mockRestore();
			process.chdir(previousCwd);
			rmSync(root, {recursive: true, force: true});
		}
	},
	30_000,
);
