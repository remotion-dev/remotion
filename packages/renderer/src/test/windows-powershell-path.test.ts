import {expect, test} from 'bun:test';
import {
	escapePowerShellSingleQuoted,
	getCompressArchivePowerShellCommand,
} from '../windows-powershell-path';

test('escapePowerShellSingleQuoted doubles apostrophes', () => {
	expect(escapePowerShellSingleQuoted("C:\\Users\\O'Brien\\bundle")).toBe(
		"C:\\Users\\O''Brien\\bundle",
	);
});

test('getCompressArchivePowerShellCommand uses LiteralPath and safe quoting', () => {
	expect(
		getCompressArchivePowerShellCommand({
			sourceFolder: "C:\\Users\\O'Brien\\project\\.remotionrepro",
			targetZip: "C:\\Users\\O'Brien\\out.zip",
		}),
	).toBe(
		"Compress-Archive -Force -LiteralPath 'C:\\Users\\O''Brien\\project\\.remotionrepro' -DestinationPath 'C:\\Users\\O''Brien\\out.zip'",
	);
});
