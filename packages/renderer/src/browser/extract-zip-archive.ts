import {createWriteStream} from 'node:fs';
import {mkdir, realpath, symlink} from 'node:fs/promises';
import * as path from 'node:path';
import {buffer} from 'node:stream/consumers';
import {pipeline} from 'node:stream/promises';
import {promisify} from 'node:util';
import yauzl, {type Entry, type ZipFile} from 'yauzl';

const openZip = promisify(yauzl.open) as (
	zipPath: string,
	options: {lazyEntries: true},
) => Promise<ZipFile>;

const openReadStream = (
	zipfile: ZipFile,
	entry: Entry,
): Promise<NodeJS.ReadableStream> => {
	return new Promise((resolve, reject) => {
		zipfile.openReadStream(entry, (err, readStream) => {
			if (err) {
				reject(err);
				return;
			}

			if (!readStream) {
				reject(new Error('Failed to open zip read stream'));
				return;
			}

			resolve(readStream);
		});
	});
};

const getExtractedMode = (entryMode: number, isDir: boolean): number => {
	if (entryMode !== 0) {
		return entryMode;
	}

	return isDir ? 0o755 : 0o644;
};

const extractEntry = async ({
	entry,
	zipfile,
	dir,
}: {
	entry: Entry;
	zipfile: ZipFile;
	dir: string;
}): Promise<void> => {
	if (entry.fileName.startsWith('__MACOSX/')) {
		return;
	}

	const dest = path.join(dir, entry.fileName);
	const destDir = path.dirname(dest);

	await mkdir(destDir, {recursive: true});

	const canonicalDestDir = await realpath(destDir);
	const relativeDestDir = path.relative(dir, canonicalDestDir);

	if (relativeDestDir.split(path.sep).includes('..')) {
		throw new Error(
			`Out of bound path "${canonicalDestDir}" found while processing file ${entry.fileName}`,
		);
	}

	const mode = (entry.externalFileAttributes >> 16) & 0xffff;
	const IFMT = 61440;
	const IFDIR = 16384;
	const IFLNK = 40960;
	const symlinkEntry = (mode & IFMT) === IFLNK;
	let isDir = (mode & IFMT) === IFDIR;

	if (!isDir && entry.fileName.endsWith('/')) {
		isDir = true;
	}

	const madeBy = entry.versionMadeBy >> 8;
	if (!isDir && madeBy === 0 && entry.externalFileAttributes === 16) {
		isDir = true;
	}

	const procMode = getExtractedMode(mode, isDir) & 0o777;
	const destDirectory = isDir ? dest : path.dirname(dest);

	await mkdir(destDirectory, {
		recursive: true,
		mode: isDir ? procMode : undefined,
	});

	if (isDir) {
		return;
	}

	const readStream = await openReadStream(zipfile, entry);

	if (symlinkEntry) {
		const link = (await buffer(readStream)).toString();
		await symlink(link, dest);
		return;
	}

	await pipeline(readStream, createWriteStream(dest, {mode: procMode}));
};

export const extractZipArchive = async (
	archivePath: string,
	dir: string,
): Promise<void> => {
	if (!path.isAbsolute(dir)) {
		throw new Error('Target directory is expected to be absolute');
	}

	await mkdir(dir, {recursive: true});
	const resolvedDir = await realpath(dir);

	const zipfile = await openZip(archivePath, {lazyEntries: true});

	return new Promise<void>((resolve, reject) => {
		let canceled = false;

		const cancel = (err: unknown) => {
			if (canceled) {
				return;
			}

			canceled = true;
			zipfile.close();
			reject(err);
		};

		zipfile.on('error', cancel);

		zipfile.on('close', () => {
			if (!canceled) {
				resolve();
			}
		});

		zipfile.on('entry', (entry) => {
			if (canceled) {
				return;
			}

			extractEntry({entry, zipfile, dir: resolvedDir})
				.then(() => {
					zipfile.readEntry();
				})
				.catch(cancel);
		});

		zipfile.readEntry();
	});
};
