import {getDirFiles} from '../../api/__mocks__/upload-dir';
import type {readDirectory as original} from '../../shared/read-dir';

export const readDirectory: typeof original = ({dir}) => {
	const files = getDirFiles(dir);

	const obj: Record<string, string> = {};
	for (const file of files) {
		obj[file.name] = 'etag';
	}

	return Promise.resolve(obj);
};
