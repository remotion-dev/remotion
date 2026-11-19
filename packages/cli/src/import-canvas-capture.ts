import {existsSync} from 'node:fs';
import {readFile, realpath} from 'node:fs/promises';
import path from 'node:path';
import {addCanvasCaptureComposition} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import {
	parseCanvasCaptureData,
	type CanvasCaptureData,
} from '@remotion/studio-shared';
import {applyCompositionImport} from './apply-composition-import';

export const importCanvasCapture = async ({
	captureFile,
	rootFile,
	compositionId,
	remotionRoot,
	publicDir,
	fps,
	width,
	height,
	packageManager,
	logLevel,
	dryRun,
}: {
	captureFile: string;
	rootFile: string;
	compositionId: string;
	remotionRoot: string;
	publicDir: string | null;
	fps: number | null;
	width: number | null;
	height: number | null;
	packageManager: string | null;
	logLevel: LogLevel;
	dryRun: boolean;
}) => {
	const rootDir = path.resolve(remotionRoot);
	const resolvedRootFile = await realpath(path.resolve(rootDir, rootFile));
	if (!/\.tsx?$/.test(resolvedRootFile)) {
		throw new Error('The root file must be a TypeScript file (.ts or .tsx)');
	}

	const words = compositionId.match(/[a-zA-Z0-9]+/g) ?? [];
	const name = words
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join('');
	const componentName = `${/^[0-9]/.test(name) ? 'Capture' : ''}${name || 'CanvasCapture'}Composition`;
	const componentFile = path.join(
		path.dirname(resolvedRootFile),
		`${componentName}.tsx`,
	);
	if (existsSync(componentFile)) {
		throw new Error(`Cannot create ${componentFile} because it already exists`);
	}

	const videoSource = await realpath(path.resolve(rootDir, captureFile));
	const videoFileName = path.basename(captureFile);
	const videoFile = path.resolve(rootDir, publicDir ?? 'public', videoFileName);
	const existingVideo = existsSync(videoFile)
		? await realpath(videoFile)
		: null;
	if (existingVideo !== null && existingVideo !== videoSource) {
		throw new Error(
			`Cannot copy the capture because ${videoFile} already exists. Rename the capture or use the file already in the public directory.`,
		);
	}

	const {ALL_FORMATS, FilePathSource, Input} = await import('mediabunny');
	const input = new Input({
		formats: ALL_FORMATS,
		source: new FilePathSource(videoSource),
	});

	let capture: {
		data: CanvasCaptureData;
		videoWidth: number;
		videoHeight: number;
		durationInSeconds: number;
	};
	try {
		const [tags, videoTrack] = await Promise.all([
			input.getMetadataTags(),
			input.getPrimaryVideoTrack(),
		]);
		const data = parseCanvasCaptureData(tags);
		if (data === null) {
			throw new Error(
				'The file does not contain valid REMOTION_CAPTURE_DATA metadata',
			);
		}

		if (videoTrack === null) {
			throw new Error('The Canvas Capture does not contain a video track');
		}

		const [durationFromMetadata, videoWidth, videoHeight] = await Promise.all([
			input.getDurationFromMetadata(),
			videoTrack.getDisplayWidth(),
			videoTrack.getDisplayHeight(),
		]);
		const durationInSeconds =
			durationFromMetadata ?? (await input.computeDuration([videoTrack]));
		if (
			[durationInSeconds, videoWidth, videoHeight].some(
				(value) => !Number.isFinite(value) || value <= 0,
			)
		) {
			throw new Error('The Canvas Capture has invalid duration or dimensions');
		}

		capture = {data, videoWidth, videoHeight, durationInSeconds};
	} finally {
		input.dispose();
	}

	const metadata = {
		width: width ?? 1920,
		height: height ?? 1080,
		fps: fps ?? 60,
		durationInFrames: Math.max(
			1,
			Math.ceil(capture.durationInSeconds * (fps ?? 60)),
		),
	};
	const previousContents = await readFile(resolvedRootFile, 'utf-8');
	const result = addCanvasCaptureComposition({
		project: {rootDir, files: {[resolvedRootFile]: previousContents}},
		compositionFile: resolvedRootFile,
		compositionId,
		component: {
			filePath: componentFile,
			importName: componentName,
			importPath: `./${componentName}`,
		},
		metadata,
		capture: {
			data: capture.data,
			keyframeFps: metadata.fps,
			videoFileName,
			videoWidth: capture.videoWidth,
			videoHeight: capture.videoHeight,
		},
	});
	const rootContents = result.changes.find(
		(change) => change.filePath === resolvedRootFile,
	)?.nextContents;
	const componentContents = result.changes.find(
		(change) => change.filePath === componentFile,
	)?.nextContents;
	if (
		typeof rootContents !== 'string' ||
		typeof componentContents !== 'string'
	) {
		throw new Error(
			'The Canvas Capture codemod did not generate both source files',
		);
	}

	const copies =
		existingVideo === null
			? [{source: videoSource, destination: videoFile}]
			: [];
	const dependencies = ['@remotion/media', '@remotion/mac-cursors'];
	if (!dryRun) {
		await applyCompositionImport({
			remotionRoot: rootDir,
			changes: result.changes,
			copies,
			dependencies,
			packageManager,
			logLevel,
		});
	}

	return {
		compositionId,
		copies,
		dependencies,
		rootFile: resolvedRootFile,
		componentFile,
		videoFile,
		metadata,
		...result,
	};
};
