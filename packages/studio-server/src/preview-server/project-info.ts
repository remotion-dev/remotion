import type {ProjectInfo} from '@remotion/studio-shared';
import {existsSync} from 'node:fs';
import path from 'node:path';

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

	const rootFile = pathsToLookFor.find((p) => existsSync(p)) ?? null;

	return Promise.resolve({
		rootFile,
		relativeRootFile: rootFile ? path.relative(remotionRoot, rootFile) : null,
	});
};
