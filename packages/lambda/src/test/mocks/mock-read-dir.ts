import type {readDirectory as original} from '../../shared/read-dir';
import {getDirFiles} from './upload-dir';

export const mockReadDirectory: typeof original = ({dir}) => {
	const files = getDirFiles(dir);

	const obj: Record<string, () => Promise<string>> = {};
	for (const file of files) {
		obj[file.name] = () => Promise.resolve('etag');
	}

	return obj;
};
