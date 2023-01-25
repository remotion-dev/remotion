import path from 'path';

export const makeS3Key = (folder: string, dir: string, filePath: string) => {
	return `${folder}/${path.relative(dir, filePath).split(path.sep).join('/')}`;
};
