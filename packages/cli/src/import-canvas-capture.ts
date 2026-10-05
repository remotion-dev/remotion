import {randomUUID} from 'node:crypto';
import {constants, existsSync} from 'node:fs';
import {
	copyFile,
	mkdir,
	open,
	readFile,
	realpath,
	rename,
	rm,
	stat,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import {addCanvasCaptureComposition} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import {
	parseCanvasCaptureData,
	type CanvasCaptureData,
} from '@remotion/studio-shared';
import {ALL_FORMATS, FilePathSource, Input} from 'mediabunny';
import {addCommand} from './add';

// Internal and unstable. Keep the file import separate from the pure codemod.
export const importCanvasCapture = async ({
	captureFile,
	compositionFile,
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
	compositionFile: string;
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
	const registrationFile = await realpath(
		path.resolve(rootDir, compositionFile),
	);
	if (!/\.tsx?$/.test(registrationFile)) {
		throw new Error(
			'The composition file must be a TypeScript file (.ts or .tsx)',
		);
	}

	const words = compositionId.match(/[a-zA-Z0-9]+/g) ?? [];
	const name = words
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join('');
	const componentName = `${/^[0-9]/.test(name) ? 'Capture' : ''}${name || 'CanvasCapture'}Composition`;
	const componentFile = path.join(
		path.dirname(registrationFile),
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
	const previousContents = await readFile(registrationFile, 'utf-8');
	const result = addCanvasCaptureComposition({
		project: {rootDir, files: {[registrationFile]: previousContents}},
		compositionFile: registrationFile,
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
	const registrationContents = result.changes.find(
		(change) => change.filePath === registrationFile,
	)?.nextContents;
	const componentContents = result.changes.find(
		(change) => change.filePath === componentFile,
	)?.nextContents;
	if (
		typeof registrationContents !== 'string' ||
		typeof componentContents !== 'string'
	) {
		throw new Error(
			'The Canvas Capture codemod did not generate both source files',
		);
	}

	if (!dryRun) {
		await addCommand({
			remotionRoot: rootDir,
			packageManager: packageManager ?? undefined,
			packageNames: ['@remotion/media', '@remotion/mac-cursors'],
			logLevel,
			args: [],
		});

		const temporaryFile = path.join(
			path.dirname(registrationFile),
			`.remotion-capture-${randomUUID()}.tmp`,
		);
		let createdVideo = false;
		let createdComponent = false;
		try {
			if ((await readFile(registrationFile, 'utf-8')) !== previousContents) {
				throw new Error(
					`Source changed before importing the capture: ${registrationFile}`,
				);
			}

			if (existingVideo === null) {
				await mkdir(path.dirname(videoFile), {recursive: true});
				await copyFile(videoSource, videoFile, constants.COPYFILE_EXCL);
				createdVideo = true;
			}

			const componentHandle = await open(componentFile, 'wx');
			createdComponent = true;

			try {
				await componentHandle.writeFile(componentContents, 'utf-8');
			} finally {
				await componentHandle.close();
			}

			const {mode} = await stat(registrationFile);
			await writeFile(temporaryFile, registrationContents, {
				encoding: 'utf-8',
				flag: 'wx',
				mode,
			});
			if ((await readFile(registrationFile, 'utf-8')) !== previousContents) {
				throw new Error(
					`Source changed before importing the capture: ${registrationFile}`,
				);
			}

			await rename(temporaryFile, registrationFile);
		} catch (error) {
			await rm(temporaryFile, {force: true});
			if (createdComponent) {
				await rm(componentFile, {force: true});
			}

			if (createdVideo) {
				await rm(videoFile, {force: true});
			}

			throw error;
		}
	}

	return {
		compositionId,
		compositionFile: registrationFile,
		componentFile,
		videoFile,
		metadata,
		...result,
	};
};
