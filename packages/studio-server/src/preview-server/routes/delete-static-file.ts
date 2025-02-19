import type {
	DeleteStaticFileRequest,
	DeleteStaticFileResponse,
} from '@remotion/studio-shared';
import {existsSync, unlinkSync} from 'fs';
import path from 'path';
import type {ApiHandler} from '../api-types';

export const deleteStaticFileHandler: ApiHandler<
	DeleteStaticFileRequest,
	DeleteStaticFileResponse
> = ({input: {relativePath}, publicDir}) => {
	const resolved = path.join(publicDir, relativePath);

	const relativeToPublicDir = path.relative(publicDir, resolved);
	if (relativeToPublicDir.startsWith('..')) {
		throw new Error(`Not allowed to write to ${relativeToPublicDir}`);
	}

	const exists = existsSync(resolved);
	if (exists) {
		unlinkSync(resolved);
	}

	return Promise.resolve({
		success: true,
		existed: exists,
	});
};
