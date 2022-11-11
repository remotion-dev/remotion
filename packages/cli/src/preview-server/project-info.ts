import {existsSync} from 'fs';
import path from 'path';

export type ProjectInfo = {
	videoFile: string | null;
	relativeVideoFile: string | null;
};

export const getProjectInfo = (remotionRoot: string): Promise<ProjectInfo> => {
	const pathsToLookFor = [
		'src/Root.tsx',
		'src/Root.jsx',
		'src/Video.tsx',
		'src/Video.jsx',
	].map((p) => {
		return path.join(remotionRoot, p);
	});

	const videoFile = pathsToLookFor.find((p) => existsSync(p)) ?? null;

	return Promise.resolve({
		videoFile,
		relativeVideoFile: videoFile
			? path.relative(remotionRoot, videoFile)
			: null,
	});
};
