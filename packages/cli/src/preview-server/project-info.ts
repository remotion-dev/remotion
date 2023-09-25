import {existsSync} from 'node:fs';
import path from 'node:path';

export type ProjectInfo = {
	videoFile: string | null;
	relativeVideoFile: string | null;
};

export const getProjectInfo = (remotionRoot: string): Promise<ProjectInfo> => {
	const pathsToLookFor = [
		'src/Root.tsx',
		'src/Root.jsx',
		'remotion/Root.tsx',
		'remotion/Root.jsx',
		'app/remotion/Root.tsx',
		'src/Video.tsx',
		'src/Video.jsx',
		'src/remotion/Root.tsx',
		'src/remotion/Root.jsx',
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
