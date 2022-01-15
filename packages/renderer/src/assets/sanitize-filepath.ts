import path from 'path';
import {sanitizeFilename} from './sanitize-filename';

export const sanitizeFilePath = (pathToSanitize: string) => {
	return pathToSanitize
		.split(path.sep)
		.map((s) => sanitizeFilename(s))
		.join(path.sep);
};
