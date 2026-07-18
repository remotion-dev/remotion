import {expect, test} from 'bun:test';
import {
	escapePowerShellSingleQuoted,
	getExpandArchivePowerShellCommand,
} from '../windows-powershell-path';

test('escapePowerShellSingleQuoted doubles apostrophes', () => {
	expect(escapePowerShellSingleQuoted("C:\\Users\\O'Brien\\whisper.zip")).toBe(
		"C:\\Users\\O''Brien\\whisper.zip",
	);
});

test('getExpandArchivePowerShellCommand uses LiteralPath and safe quoting', () => {
	expect(
		getExpandArchivePowerShellCommand({
			zipPath: "C:\\Users\\O'Brien\\whisper-bin-x64.zip",
			destDir: "C:\\Users\\O'Brien\\whisper.cpp",
		}),
	).toBe(
		"Expand-Archive -Force -LiteralPath 'C:\\Users\\O''Brien\\whisper-bin-x64.zip' -DestinationPath 'C:\\Users\\O''Brien\\whisper.cpp'",
	);
});

test('getExpandArchivePowerShellCommand keeps spaces inside single quotes', () => {
	expect(
		getExpandArchivePowerShellCommand({
			zipPath: 'C:\\Users\\Jane Doe\\whisper-bin-x64.zip',
			destDir: 'C:\\Users\\Jane Doe\\whisper.cpp',
		}),
	).toBe(
		"Expand-Archive -Force -LiteralPath 'C:\\Users\\Jane Doe\\whisper-bin-x64.zip' -DestinationPath 'C:\\Users\\Jane Doe\\whisper.cpp'",
	);
});
