import {existsSync} from 'node:fs';
import {cp, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

export const createTimestamp = () =>
	new Date().toISOString().replace(/[:.]/g, '-');

export const sanitizePathPart = (value: string) => {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
};

export const copyDirectory = async (from: string, to: string) => {
	await rm(to, {force: true, recursive: true});
	await cp(from, to, {
		recursive: true,
		filter: (source) => {
			const pathParts = source.split(/[\\/]/);

			return (
				!pathParts.includes('node_modules') && !pathParts.includes('.DS_Store')
			);
		},
	});
};

export const readJson = async <T>(file: string): Promise<T> => {
	return JSON.parse(await readFile(file, 'utf-8')) as T;
};

export const writeJson = async (file: string, value: unknown) => {
	await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
};

export const listFilesRecursively = async (dir: string): Promise<string[]> => {
	if (!existsSync(dir)) {
		return [];
	}

	const entries = await readdir(dir, {withFileTypes: true});
	const files = await Promise.all(
		entries.map((entry) => {
			const absolutePath = join(dir, entry.name);

			if (entry.isDirectory()) {
				if (entry.name === 'node_modules') {
					return [];
				}

				return listFilesRecursively(absolutePath);
			}

			return [absolutePath];
		}),
	);

	return files.flat().sort();
};
