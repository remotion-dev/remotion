import {existsSync} from 'node:fs';
import path from 'node:path';
import type {ProjectInfo} from '@remotion/studio-shared';

const getRootFileFromEntryPoint = (entryPoint: string): string | null => {
	const entryBase = path.basename(entryPoint, path.extname(entryPoint));
	if (!entryBase.endsWith('-entry')) {
		return null;
	}

	const stem = entryBase.slice(0, -'-entry'.length);
	const pascalCase = stem
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
	const rootName = `${pascalCase}Root`;
	const entryDir = path.dirname(entryPoint);

	for (const ext of ['.tsx', '.ts', '.jsx', '.js']) {
		const candidate = path.join(entryDir, rootName + ext);
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return null;
};

export const getProjectInfo = (
	remotionRoot: string,
	entryPoint: string,
): Promise<ProjectInfo> => {
	const rootFileFromEntryPoint = getRootFileFromEntryPoint(entryPoint);
	if (rootFileFromEntryPoint) {
		return Promise.resolve({
			rootFile: rootFileFromEntryPoint,
			relativeRootFile: path.relative(remotionRoot, rootFileFromEntryPoint),
		});
	}

	const knownPaths = [
		'src/Root.tsx',
		'src/Root.jsx',
		'remotion/Root.tsx',
		'remotion/Root.jsx',
		'app/remotion/Root.tsx',
		'src/Video.tsx',
		'src/Video.jsx',
		'src/remotion/Root.tsx',
		'src/remotion/Root.jsx',
	];

	const pathsToLookFor = [
		...knownPaths.map((p) => {
			return path.join(remotionRoot, p);
		}),
		path.join(entryPoint, 'Root.tsx'),
		path.join(entryPoint, 'Root.jsx'),
		path.join(entryPoint, 'remotion/Root.tsx'),
		path.join(entryPoint, 'remotion/Root.jsx'),
	];

	const rootFile = pathsToLookFor.find((p) => existsSync(p)) ?? null;

	return Promise.resolve({
		rootFile,
		relativeRootFile: rootFile ? path.relative(remotionRoot, rootFile) : null,
	});
};
