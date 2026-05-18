import {execFile} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import * as path from 'node:path';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);

const getMissingArchiveUtilityMessage = (): string => {
	const base =
		'Failed to extract the downloaded Chrome archive. A zip extraction utility must be installed and available on your PATH.';

	switch (process.platform) {
		case 'win32':
			return `${base} On Windows, Remotion uses the built-in tar utility in System32. Ensure you are on Windows 10 version 1803 or later.`;
		case 'darwin':
			return `${base} On macOS, install unzip, for example with Homebrew: brew install unzip`;
		case 'linux':
			return `${base} On Linux, install unzip, for example: apt install unzip, yum install unzip, or apk add unzip`;
		default:
			return `${base} Install a zip extraction utility for your operating system.`;
	}
};

export const extractZipArchive = async (
	archivePath: string,
	folderPath: string,
): Promise<void> => {
	const resolvedFolderPath = path.isAbsolute(folderPath)
		? folderPath
		: path.resolve(process.cwd(), folderPath);

	await mkdir(resolvedFolderPath, {recursive: true});

	try {
		if (process.platform === 'win32') {
			const systemRoot =
				process.env.SystemRoot ?? process.env.SYSTEMROOT ?? 'C:\\Windows';
			const systemTar = path.join(systemRoot, 'System32', 'tar.exe');
			await execFileAsync(systemTar, [
				'-xf',
				archivePath,
				'-C',
				resolvedFolderPath,
			]);
		} else {
			await execFileAsync('unzip', [
				'-o',
				archivePath,
				'-d',
				resolvedFolderPath,
			]);
		}
	} catch (error: unknown) {
		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			error.code === 'ENOENT'
		) {
			throw new Error(getMissingArchiveUtilityMessage(), {cause: error});
		}

		const stderr =
			error &&
			typeof error === 'object' &&
			'stderr' in error &&
			Buffer.isBuffer(error.stderr)
				? error.stderr.toString()
				: null;

		const message = error instanceof Error ? error.message : String(error);

		throw new Error(
			`Failed to extract the downloaded Chrome archive: ${stderr ?? message}`,
			{
				cause: error instanceof Error ? error : undefined,
			},
		);
	}
};
