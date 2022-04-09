import path from 'path';
import {sanitizeFilename} from './sanitize-filename';

const pathSeparators = /[/\\]/;

export const sanitizeFilePath = (pathToSanitize: string) => {
	return pathToSanitize
		.split(pathSeparators)
		.map((s) => sanitizeFilename(s))
		.join(path.sep);
};
