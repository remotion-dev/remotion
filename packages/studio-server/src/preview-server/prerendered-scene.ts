import {createHash} from 'node:crypto';
import {
	existsSync,
	readFileSync,
	renameSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {
	CodemodsInternals,
	createElement,
	staticFileValue,
} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import type {SequenceNodePath} from 'remotion';
import {commitNodeCodemod} from './commit-node-codemod';

// Saved next to each pre-rendered video so that the scene can be restored
// and so that Studio can tell when the video is out of date.
type PrerenderedSceneSidecar = {
	compositionId: string;
	source: string;
	importStatements: string[];
	// Relative to the Remotion root
	sceneFile: string | null;
	sceneFileHash: string | null;
};

export const getPrerenderedSceneSidecarFile = (videoFile: string) =>
	`${videoFile}.json`;

export const readPrerenderedSceneSidecar = ({
	publicDir,
	src,
}: {
	publicDir: string;
	src: string;
}): PrerenderedSceneSidecar | null => {
	const videoFile = path.resolve(publicDir, src);
	const relativeToPublicDir = path.relative(publicDir, videoFile);
	if (
		relativeToPublicDir.startsWith('..') ||
		path.isAbsolute(relativeToPublicDir)
	) {
		return null;
	}

	const sidecarFile = getPrerenderedSceneSidecarFile(videoFile);
	if (!existsSync(sidecarFile)) {
		return null;
	}

	try {
		return JSON.parse(readFileSync(sidecarFile, 'utf-8'));
	} catch {
		return null;
	}
};

export const hashSceneFile = (file: string) =>
	createHash('sha256')
		.update(readFileSync(file, 'utf-8'))
		.digest('hex')
		.slice(0, 16);

// Only follows relative imports. Packages and path aliases are not resolved.
const resolveSceneFile = (importingFile: string, importSource: string) => {
	if (!importSource.startsWith('.')) {
		return null;
	}

	const base = path.resolve(path.dirname(importingFile), importSource);
	const extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs'];
	return (
		[
			base,
			...extensions.map((extension) => base + extension),
			...extensions.map((extension) => path.join(base, `index${extension}`)),
		].find((file) => existsSync(file) && statSync(file).isFile()) ?? null
	);
};

// Called by the render queue once a pre-render job has written its output.
export const replaceWithPrerenderedVideo = async ({
	remotionRoot,
	logLevel,
	fileName,
	nodePath,
	src,
	videoFile,
	compositionId,
}: {
	remotionRoot: string;
	logLevel: LogLevel;
	fileName: string;
	nodePath: SequenceNodePath;
	// Relative to the public folder
	src: string;
	videoFile: string;
	compositionId: string;
}) => {
	const {absolutePath, result} = await commitNodeCodemod({
		remotionRoot,
		logLevel,
		fileName,
		nodePath,
		codemod: ({project, node}) =>
			CodemodsInternals.replaceNodeChild({
				project,
				node,
				element: createElement({
					component: 'Video',
					importPath: '@remotion/media',
					props: {src: staticFileValue(src)},
				}),
			}),
		label: 'Rendered and replaced scene',
		entryType: 'prerender',
	});

	const sceneFile =
		result.sceneImportSource === null
			? null
			: resolveSceneFile(absolutePath, result.sceneImportSource);
	const sidecar: PrerenderedSceneSidecar = {
		compositionId,
		source: result.replacedSource,
		importStatements: result.replacedImports,
		sceneFile:
			sceneFile === null
				? null
				: path.relative(remotionRoot, sceneFile).split(path.sep).join('/'),
		sceneFileHash: sceneFile === null ? null : hashSceneFile(sceneFile),
	};
	// Written atomically so that a partially written sidecar is never read
	const sidecarFile = getPrerenderedSceneSidecarFile(videoFile);
	writeFileSync(`${sidecarFile}.tmp`, JSON.stringify(sidecar, null, 2) + '\n');
	renameSync(`${sidecarFile}.tmp`, sidecarFile);
};
