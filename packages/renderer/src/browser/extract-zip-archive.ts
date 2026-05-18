import {execFile} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import * as path from 'node:path';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);

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
			throw new Error(
				"Extraction failed: Required native binary ('tar.exe' or 'unzip') was not found in the system PATH.",
				{cause: error},
			);
		}

		const stderr =
			error &&
			typeof error === 'object' &&
			'stderr' in error &&
			Buffer.isBuffer(error.stderr)
				? error.stderr.toString()
				: null;

		const message = error instanceof Error ? error.message : String(error);

		throw new Error(`Extraction failed: ${stderr ?? message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
};
