import {randomUUID} from 'node:crypto';
import {constants} from 'node:fs';
import {
	copyFile,
	mkdir,
	open,
	readFile,
	rename,
	rm,
	stat,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import type {CodemodFileChange} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import {addCommand} from './add';

export const applyCompositionImport = async ({
	remotionRoot,
	changes,
	copies,
	dependencies,
	packageManager,
	logLevel,
}: {
	remotionRoot: string;
	changes: CodemodFileChange[];
	copies: {source: string; destination: string}[];
	dependencies: string[];
	packageManager: string | null;
	logLevel: LogLevel;
}) => {
	const registration = changes.filter(
		(change) => change.previousContents !== null,
	);
	const update = registration[0];
	if (
		!update ||
		registration.length !== 1 ||
		changes.some((change) => change.nextContents === null)
	) {
		throw new Error(
			'An import must update one registration file and create its component.',
		);
	}

	if ((await readFile(update.filePath, 'utf-8')) !== update.previousContents) {
		throw new Error(`Source changed before importing: ${update.filePath}`);
	}

	if (dependencies.length > 0) {
		await addCommand({
			remotionRoot,
			packageManager: packageManager ?? undefined,
			packageNames: dependencies,
			logLevel,
			args: [],
		});
	}

	const createdFiles: string[] = [];
	const temporaryFile = path.join(
		path.dirname(update.filePath),
		`.remotion-import-${randomUUID()}.tmp`,
	);
	try {
		if (
			(await readFile(update.filePath, 'utf-8')) !== update.previousContents
		) {
			throw new Error(`Source changed before importing: ${update.filePath}`);
		}

		for (const copy of copies) {
			await mkdir(path.dirname(copy.destination), {recursive: true});
			await copyFile(copy.source, copy.destination, constants.COPYFILE_EXCL);
			createdFiles.push(copy.destination);
		}

		for (const change of changes) {
			if (change.previousContents !== null) {
				continue;
			}

			const handle = await open(change.filePath, 'wx');
			createdFiles.push(change.filePath);
			try {
				await handle.writeFile(change.nextContents!, 'utf-8');
			} finally {
				await handle.close();
			}
		}

		const {mode} = await stat(update.filePath);
		await writeFile(temporaryFile, update.nextContents!, {
			encoding: 'utf-8',
			flag: 'wx',
			mode,
		});
		if (
			(await readFile(update.filePath, 'utf-8')) !== update.previousContents
		) {
			throw new Error(`Source changed before importing: ${update.filePath}`);
		}

		await rename(temporaryFile, update.filePath);
	} catch (error) {
		await rm(temporaryFile, {force: true});
		for (const file of createdFiles.reverse()) {
			await rm(file, {force: true});
		}

		throw error;
	}
};
