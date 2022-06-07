import {ExecaChildProcess} from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals} from 'remotion';
import {canUseParallelEncoding} from './can-use-parallel-encoding';
import {ensureFramesInOrder} from './ensure-frames-in-order';
import {ensureOutputDirectory} from './ensure-output-directory';
import {getDurationFromFrameRange} from './get-duration-from-frame-range';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {getRealFrameRange} from './get-frame-to-render';
import {getServeUrlWithFallback} from './legacy-webpack-config';
import {makeCancelSignal} from './make-cancel-signal';
import {prespawnFfmpeg} from './prespawn-ffmpeg';
import {renderFrames} from './render-frames';
import {RenderMediaOptions, StitchingState} from './render-media';
import {stitchFramesToGif} from './stitch-frames-to-gif';
import {tmpDir} from './tmp-dir';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateOutputFilename} from './validate-output-filename';
import {validateScale} from './validate-scale';

type Await<T> = T extends PromiseLike<infer U> ? U : T;

export const renderGif = ({
	parallelism,
	proResProfile,
	crf,
	composition,
	imageFormat,
	ffmpegExecutable,
	inputProps,
	pixelFormat,
	codec,
	envVariables,
	quality,
	frameRange,
	puppeteerInstance,
	outputLocation,
	onProgress,
	overwrite,
	onDownload,
	loop,
	skipNFrames,
	dumpBrowserLogs,
	onBrowserLog,
	onStart,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	browserExecutable,
	port,
	cancelSignal,
	...options
}: RenderMediaOptions): Promise<void> => {
	Internals.validateQuality(quality);
	if (typeof crf !== 'undefined' && crf !== null) {
		Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	}

	validateOutputFilename(codec, getExtensionOfFilename(outputLocation));

	validateScale(scale);

	const serveUrl = getServeUrlWithFallback(options);

	let stitchStage: StitchingState = 'encoding';
	let stitcherFfmpeg: ExecaChildProcess<string> | undefined;
	let preStitcher: Await<ReturnType<typeof prespawnFfmpeg>> | null = null;
	let encodedFrames = 0;
	let renderedFrames = 0;
	let renderedDoneIn: number | null = null;
	let encodedDoneIn: number | null = null;
	let cancelled = false;

	const renderStart = Date.now();
	const tmpdir = tmpDir('pre-encode');
	const parallelEncoding = canUseParallelEncoding(codec);
	const actualImageFormat = imageFormat ?? 'jpeg';

	const preEncodedFileLocation = parallelEncoding
		? path.join(
				tmpdir,
				'pre-encode.' + getFileExtensionFromCodec(codec, 'chunk')
		  )
		: null;

	const outputDir = parallelEncoding
		? null
		: fs.mkdtempSync(path.join(os.tmpdir(), 'react-motion-render'));

	validateEvenDimensionsWithCodec({
		codec,
		height: composition.height,
		scale: scale ?? 1,
		width: composition.width,
	});

	const callUpdate = () => {
		onProgress?.({
			encodedDoneIn,
			encodedFrames,
			renderedDoneIn,
			renderedFrames,
			stitchStage,
		});
	};

	const realFrameRange = getRealFrameRange(
		composition.durationInFrames,
		frameRange ?? null
	);

	const cancelRenderFrames = makeCancelSignal();
	const cancelPrestitcher = makeCancelSignal();
	const cancelStitcher = makeCancelSignal();

	cancelSignal?.(() => {
		cancelRenderFrames.cancel();
	});

	const {waitForRightTimeOfFrameToBeInserted, setFrameToStitch, waitForFinish} =
		ensureFramesInOrder(realFrameRange);
	const actualGifFps = Math.floor(composition.fps / (skipNFrames + 1));
	const createPrestitcherIfNecessary = async () => {
		if (preEncodedFileLocation) {
			preStitcher = await prespawnFfmpeg({
				width: composition.width * (scale ?? 1),
				height: composition.height * (scale ?? 1),
				fps: actualGifFps,
				outputLocation: preEncodedFileLocation,
				pixelFormat,
				codec,
				proResProfile,
				crf,
				onProgress: (frame: number) => {
					encodedFrames = frame;
					callUpdate();
				},
				verbose: Internals.Logging.isEqualOrBelowLogLevel(
					Internals.Logging.getLogLevel(),
					'verbose'
				),
				ffmpegExecutable,
				imageFormat: actualImageFormat,
				signal: cancelPrestitcher.cancelSignal,
			});
			stitcherFfmpeg = preStitcher.task;
		}
	};

	const waitForPrestitcherIfNecessary = async () => {
		if (stitcherFfmpeg) {
			await waitForFinish();
			stitcherFfmpeg?.stdin?.end();
			try {
				await stitcherFfmpeg;
			} catch (err) {
				throw new Error(preStitcher?.getLogs());
			}
		}
	};

	const happyPath = createPrestitcherIfNecessary()
		.then(() => {
			const renderFramesProc = renderFrames({
				config: composition,
				onFrameUpdate: (frame: number) => {
					stitchStage = 'gif';
					renderedFrames = frame;
					callUpdate();
				},
				parallelism,
				outputDir,
				skipNFrames,
				onStart: (data) => {
					renderedFrames = 0;
					callUpdate();
					onStart?.(data);
				},
				inputProps,
				envVariables,
				imageFormat: actualImageFormat,
				quality,
				frameRange: frameRange ?? null,
				puppeteerInstance,
				onFrameBuffer: parallelEncoding
					? async (buffer, frame) => {
							await waitForRightTimeOfFrameToBeInserted(frame);
							if (cancelled) {
								return;
							}

							stitcherFfmpeg?.stdin?.write(buffer);

							setFrameToStitch(frame + 1);
					  }
					: undefined,
				serveUrl,
				dumpBrowserLogs,
				onBrowserLog,
				onDownload,
				timeoutInMilliseconds,
				chromiumOptions,
				scale,
				ffmpegExecutable,
				browserExecutable,
				port,
				cancelSignal: cancelRenderFrames.cancelSignal,
			});

			return renderFramesProc;
		})
		.then((renderFramesReturn) => {
			return Promise.all([renderFramesReturn, waitForPrestitcherIfNecessary()]);
		})
		.then(([{assetsInfo}]) => {
			renderedDoneIn = Date.now() - renderStart;
			callUpdate();

			ensureOutputDirectory(outputLocation);

			const stitchStart = Date.now();
			return Promise.all([
				stitchFramesToGif({
					width: composition.width * (scale ?? 1),
					height: composition.height * (scale ?? 1),
					fps: actualGifFps,
					outputLocation,
					internalOptions: {
						preEncodedFileLocation,
						imageFormat: actualImageFormat,
					},
					force: overwrite ?? Internals.DEFAULT_OVERWRITE,
					pixelFormat,
					codec,
					proResProfile,
					crf,
					loop,
					assetsInfo,
					ffmpegExecutable,
					onProgress: (frame: number) => {
						stitchStage = 'gif';
						encodedFrames = frame;
						callUpdate();
					},
					verbose: Internals.Logging.isEqualOrBelowLogLevel(
						Internals.Logging.getLogLevel(),
						'verbose'
					),
					dir: outputDir ?? undefined,
					cancelSignal: cancelStitcher.cancelSignal,
				}),
				stitchStart,
			]);
		})
		.then(([, stitchStart]) => {
			encodedFrames = getDurationFromFrameRange(
				frameRange ?? null,
				composition.durationInFrames,
				skipNFrames
			);
			encodedDoneIn = Date.now() - stitchStart;
			callUpdate();
		})
		.catch((err) => {
			/**
			 * When an error is thrown in renderFrames(...) (e.g., when delayRender() is used incorrectly), fs.unlinkSync(...) throws an error that the file is locked because ffmpeg is still running, and renderMedia returns it.
			 * Therefore we first kill the FFMPEG process before deleting the file
			 */
			cancelled = true;
			cancelRenderFrames.cancel();
			cancelStitcher.cancel();
			cancelPrestitcher.cancel();
			if (stitcherFfmpeg !== undefined && stitcherFfmpeg.exitCode === null) {
				const promise = new Promise<void>((resolve) => {
					setTimeout(() => {
						resolve();
					}, 2000);
					(stitcherFfmpeg as ExecaChildProcess<string>).on('close', resolve);
				});
				stitcherFfmpeg.kill();
				return promise.then(() => {
					throw err;
				});
			}

			throw err;
		})
		.finally(() => {
			if (
				preEncodedFileLocation !== null &&
				fs.existsSync(preEncodedFileLocation)
			) {
				fs.unlinkSync(preEncodedFileLocation);
			}
		});

	return Promise.race([
		happyPath,
		new Promise<void>((_resolve, reject) => {
			cancelSignal?.(() => {
				reject(new Error('renderMedia() got cancelled'));
			});
		}),
	]);
};
