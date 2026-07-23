import {existsSync, mkdirSync, renameSync, statSync} from 'fs';
import path from 'path';
import type {
	RenameStaticFileRequest,
	RenameStaticFileResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

const resolvePublicPath = ({
	publicDir,
	relativePath,
}: {
	publicDir: string;
	relativePath: string;
}) => {
	if (relativePath.length === 0) {
		throw new Error('Path cannot be empty');
	}

	const resolved = path.join(publicDir, relativePath);
	const relativeToPublicDir = path.relative(publicDir, resolved);

	if (
		relativeToPublicDir.startsWith('..') ||
		path.isAbsolute(relativeToPublicDir)
	) {
		throw new Error(`Not allowed to write to ${relativeToPublicDir}`);
	}

	return resolved;
};

export const renameStaticFileHandler: ApiHandler<
	RenameStaticFileRequest,
	RenameStaticFileResponse
> = ({input: {oldRelativePath, newRelativePath}, publicDir}) => {
	const oldResolved = resolvePublicPath({
		publicDir,
		relativePath: oldRelativePath,
	});
	const newResolved = resolvePublicPath({
		publicDir,
		relativePath: newRelativePath,
	});

	if (oldResolved === newResolved) {
		return Promise.resolve({success: true});
	}

	if (!existsSync(oldResolved)) {
		throw new Error(`${oldRelativePath} does not exist`);
	}

	const oldStat = statSync(oldResolved);
	if (!oldStat.isFile()) {
		throw new Error(`${oldRelativePath} is not a file`);
	}

	if (existsSync(newResolved)) {
		const newStat = statSync(newResolved);
		const pointsToSameFile =
			oldStat.dev === newStat.dev && oldStat.ino === newStat.ino;

		if (!pointsToSameFile) {
			throw new Error(`${newRelativePath} already exists`);
		}
	}

	mkdirSync(path.dirname(newResolved), {recursive: true});
	renameSync(oldResolved, newResolved);

	return Promise.resolve({
		success: true,
	});
};
