import {existsSync} from 'fs';
import path from 'path';

export type ProjectInfo = {
	videoFile: string | null;
	relativeVideoFile: string | null;
};

export const getProjectInfo = (): Promise<ProjectInfo> => {
	const pathsToLookFor = ['src/Video.tsx', 'src/Video.jsx'].map((p) => {
		return path.join(process.cwd(), p);
	});

	const videoFile = pathsToLookFor.find((p) => existsSync(p)) ?? null;

	return Promise.resolve({
		videoFile,
		relativeVideoFile: videoFile
			? path.relative(process.cwd(), videoFile)
			: null,
	});
};
