import {BufferTarget, StreamTarget} from 'mediabunny';
import type {CalculateMetadataFunction} from 'remotion';
import {Internals, type LogLevel} from 'remotion';
import type {AnyZodObject, z} from 'zod';
import {addAudioSample, addVideoSampleAndCloseFrame} from './add-sample';
import {handleArtifacts, type WebRendererOnArtifact} from './artifact';
import {onlyInlineAudio} from './audio';
import {createBackgroundKeepalive} from './background-keepalive';
import {canUseWebFsWriter} from './can-use-webfs-target';
import {createAudioSampleSource} from './create-audio-sample-source';
import {checkForError, createScaffold} from './create-scaffold';
import {getRealFrameRange, type FrameRange} from './frame-range';
import type {InternalState} from './internal-state';
import {makeInternalState} from './internal-state';
import {
	makeOutputWithCleanup,
	makeVideoSampleSourceCleanup,
} from './mediabunny-cleanups';
import type {
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
} from './mediabunny-mappings';
import {
	audioCodecToMediabunnyAudioCodec,
	codecToMediabunnyCodec,
	containerToMediabunnyContainer,
	getDefaultVideoCodecForContainer,
	getMimeType,
	getQualityForWebRendererQuality,
	type WebRendererVideoCodec,
} from './mediabunny-mappings';
import type {WebRendererOutputTarget} from './output-target';
import type {
	CompositionCalculateMetadataOrExplicit,
	InferProps,
} from './props-if-has-props';
import {onlyOneRenderAtATimeQueue} from './render-operations-queue';
import {resolveAudioCodec} from './resolve-audio-codec';
import {sendUsageEvent} from './send-telemetry-event';
import {createLayer} from './take-screenshot';
import {createThrottledProgressCallback} from './throttle-progress';
import {validateScale} from './validate-scale';
import {validateVideoFrame, type OnFrameCallback} from './validate-video-frame';
import {waitForReady} from './wait-for-ready';
import {cleanupStaleOpfsFiles, createWebFsTarget} from './web-fs-target';

export type InputPropsIfHasProps<
	Schema extends AnyZodObject,
	Props,
> = AnyZodObject extends Schema
	? {} extends Props
		? {
				// Neither props nor schema specified
				inputProps?: z.input<Schema> & Props;
			}
		: {
				// Only props specified
				inputProps: Props;
			}
	: {} extends Props
		? {
				// Only schema specified
				inputProps: z.input<Schema>;
			}
		: {
				// Props and schema specified
				inputProps: z.input<Schema> & Props;
			};

type MandatoryRenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	composition: CompositionCalculateMetadataOrExplicit<Schema, Props>;
};

export type RenderMediaOnWebProgress = {
	renderedFrames: number;
	encodedFrames: number;
	// TODO: encodedDoneIn, renderEstimatedTime, progress
};

export type RenderMediaOnWebResult = {
	getBlob: () => Promise<Blob>;
	internalState: InternalState;
};

export type RenderMediaOnWebProgressCallback = (
	progress: RenderMediaOnWebProgress,
) => void;

type OptionalRenderMediaOnWebOptions<Schema extends AnyZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	mediaCacheSizeInBytes: number | null;
	videoCodec: WebRendererVideoCodec;
	audioCodec: WebRendererAudioCodec | null;
	audioBitrate: number | WebRendererQuality;
	container: WebRendererContainer;
	signal: AbortSignal | null;
	onProgress: RenderMediaOnWebProgressCallback | null;
	hardwareAcceleration: 'no-preference' | 'prefer-hardware' | 'prefer-software';
	keyframeIntervalInSeconds: number;
	videoBitrate: number | WebRendererQuality;
	frameRange: FrameRange | null;
	transparent: boolean;
	onArtifact: WebRendererOnArtifact | null;
	onFrame: OnFrameCallback | null;
	outputTarget: WebRendererOutputTarget | null;
	licenseKey: string | undefined;
	muted: boolean;
	scale: number;
};

export type RenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderMediaOnWebOptions<Schema, Props> &
	Partial<OptionalRenderMediaOnWebOptions<Schema>> &
	InputPropsIfHasProps<Schema, Props>;

type InternalRenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderMediaOnWebOptions<Schema, Props> &
	OptionalRenderMediaOnWebOptions<Schema> &
	InputPropsIfHasProps<Schema, Props>;

// TODO: More containers
// TODO: Metadata
// TODO: Validating inputs
// TODO: Apply defaultCodec

const internalRenderMediaOnWeb = async <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>({
	composition,
	inputProps,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	mediaCacheSizeInBytes,
	schema,
	videoCodec: codec,
	audioCodec: unresolvedAudioCodec,
	audioBitrate,
	container,
	signal,
	onProgress,
	hardwareAcceleration,
	keyframeIntervalInSeconds,
	videoBitrate,
	frameRange,
	transparent,
	onArtifact,
	onFrame,
	outputTarget: userDesiredOutputTarget,
	licenseKey,
	muted,
	scale,
}: InternalRenderMediaOnWebOptions<
	Schema,
	Props
>): Promise<RenderMediaOnWebResult> => {
	validateScale(scale);
	const outputTarget =
		userDesiredOutputTarget === null
			? (await canUseWebFsWriter())
				? 'web-fs'
				: 'arraybuffer'
			: userDesiredOutputTarget;

	if (outputTarget === 'web-fs') {
		await cleanupStaleOpfsFiles();
	}

	const format = containerToMediabunnyContainer(container);

	if (
		codec &&
		!format.getSupportedCodecs().includes(codecToMediabunnyCodec(codec))
	) {
		return Promise.reject(
			new Error(`Codec ${codec} is not supported for container ${container}`),
		);
	}

	const resolvedAudioBitrate =
		typeof audioBitrate === 'number'
			? audioBitrate
			: getQualityForWebRendererQuality(audioBitrate);

	let finalAudioCodec: WebRendererAudioCodec | null = null;
	if (!muted) {
		const audioResult = await resolveAudioCodec({
			container,
			requestedCodec: unresolvedAudioCodec,
			userSpecifiedAudioCodec:
				unresolvedAudioCodec !== undefined && unresolvedAudioCodec !== null,
			bitrate: resolvedAudioBitrate,
		});

		// log warnings and reject on errors
		for (const issue of audioResult.issues) {
			if (issue.severity === 'error') {
				return Promise.reject(new Error(issue.message));
			}

			Internals.Log.warn(
				{logLevel, tag: '@remotion/web-renderer'},
				issue.message,
			);
		}

		finalAudioCodec = audioResult.codec;
	}

	const resolved = await Internals.resolveVideoConfig({
		calculateMetadata:
			(composition.calculateMetadata as CalculateMetadataFunction<
				InferProps<AnyZodObject, Record<string, unknown>>
			>) ?? null,
		signal: signal ?? new AbortController().signal,
		defaultProps: composition.defaultProps ?? {},
		inputProps: inputProps ?? {},
		compositionId: composition.id,
		compositionDurationInFrames: composition.durationInFrames ?? null,
		compositionFps: composition.fps ?? null,
		compositionHeight: composition.height ?? null,
		compositionWidth: composition.width ?? null,
	});

	const realFrameRange = getRealFrameRange(
		resolved.durationInFrames,
		frameRange,
	);

	if (signal?.aborted) {
		return Promise.reject(new Error('renderMediaOnWeb() was cancelled'));
	}

	using scaffold = createScaffold({
		width: resolved.width,
		height: resolved.height,
		fps: resolved.fps,
		durationInFrames: resolved.durationInFrames,
		Component: composition.component,
		resolvedProps: resolved.props,
		id: resolved.id,
		delayRenderTimeoutInMilliseconds,
		logLevel,
		mediaCacheSizeInBytes,
		schema: schema ?? null,
		audioEnabled: !muted,
		videoEnabled: true,
		initialFrame: 0,
		defaultCodec: resolved.defaultCodec,
		defaultOutName: resolved.defaultOutName,
	});

	const {delayRenderScope, div, timeUpdater, collectAssets, errorHolder} =
		scaffold;

	using internalState = makeInternalState();

	using keepalive = createBackgroundKeepalive({
		fps: resolved.fps,
		logLevel,
	});

	const artifactsHandler = handleArtifacts();

	const webFsTarget =
		outputTarget === 'web-fs' ? await createWebFsTarget() : null;

	const target = webFsTarget
		? new StreamTarget(webFsTarget.stream)
		: new BufferTarget()!;

	using outputWithCleanup = makeOutputWithCleanup({
		format,
		target,
	});

	using throttledProgress = createThrottledProgressCallback(onProgress);
	const throttledOnProgress = throttledProgress?.throttled ?? null;

	try {
		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
			signal,
			apiName: 'renderMediaOnWeb',
			internalState,
			keepalive,
		});
		checkForError(errorHolder);

		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		using videoSampleSource = makeVideoSampleSourceCleanup({
			codec: codecToMediabunnyCodec(codec),
			bitrate:
				typeof videoBitrate === 'number'
					? videoBitrate
					: getQualityForWebRendererQuality(videoBitrate),
			sizeChangeBehavior: 'deny',
			hardwareAcceleration,
			latencyMode: 'quality',
			keyFrameInterval: keyframeIntervalInSeconds,
			alpha: transparent ? 'keep' : 'discard',
		});

		outputWithCleanup.output.addVideoTrack(videoSampleSource.videoSampleSource);

		using audioSampleSource = createAudioSampleSource({
			muted,
			codec: finalAudioCodec
				? audioCodecToMediabunnyAudioCodec(finalAudioCodec)
				: null,
			bitrate: resolvedAudioBitrate,
		});

		if (audioSampleSource) {
			outputWithCleanup.output.addAudioTrack(
				audioSampleSource.audioSampleSource,
			);
		}

		await outputWithCleanup.output.start();

		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		const progress: RenderMediaOnWebProgress = {
			renderedFrames: 0,
			encodedFrames: 0,
		};

		for (let frame = realFrameRange[0]; frame <= realFrameRange[1]; frame++) {
			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			timeUpdater.current?.update(frame);

			await waitForReady({
				timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
				scope: delayRenderScope,
				signal,
				apiName: 'renderMediaOnWeb',
				keepalive,
				internalState,
			});
			checkForError(errorHolder);

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			const createFrameStart = performance.now();
			const layer = await createLayer({
				element: div,
				scale,
				logLevel,
				internalState,
				onlyBackgroundClipText: false,
				cutout: new DOMRect(0, 0, resolved.width, resolved.height),
			});
			internalState.addCreateFrameTime(performance.now() - createFrameStart);

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			const timestamp = Math.round(
				((frame - realFrameRange[0]) / resolved.fps) * 1_000_000,
			);
			const videoFrame = new VideoFrame(layer.canvas, {
				timestamp,
			});
			progress.renderedFrames++;
			throttledOnProgress?.({...progress});

			// Process frame through onFrame callback if provided
			let frameToEncode = videoFrame;
			if (onFrame) {
				const returnedFrame = await onFrame(videoFrame);
				if (signal?.aborted) {
					throw new Error('renderMediaOnWeb() was cancelled');
				}

				frameToEncode = validateVideoFrame({
					originalFrame: videoFrame,
					returnedFrame,
					expectedWidth: Math.round(resolved.width * scale),
					expectedHeight: Math.round(resolved.height * scale),
					expectedTimestamp: timestamp,
				});
			}

			const audioCombineStart = performance.now();
			const assets = collectAssets.current!.collectAssets();
			if (onArtifact) {
				await artifactsHandler.handle({
					imageData: layer.canvas,
					frame,
					assets,
					onArtifact,
				});
			}

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			const audio = muted
				? null
				: onlyInlineAudio({assets, fps: resolved.fps, frame});
			internalState.addAudioMixingTime(performance.now() - audioCombineStart);

			const addSampleStart = performance.now();
			await Promise.all([
				addVideoSampleAndCloseFrame(
					frameToEncode,
					videoSampleSource.videoSampleSource,
				),
				audio && audioSampleSource
					? addAudioSample(audio, audioSampleSource.audioSampleSource)
					: Promise.resolve(),
			]);
			internalState.addAddSampleTime(performance.now() - addSampleStart);

			progress.encodedFrames++;
			throttledOnProgress?.({...progress});

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}
		}

		// Call progress one final time to ensure final state is reported
		onProgress?.({...progress});

		videoSampleSource.videoSampleSource.close();
		audioSampleSource?.audioSampleSource.close();
		await outputWithCleanup.output.finalize();

		Internals.Log.verbose(
			{logLevel, tag: 'web-renderer'},
			`Render timings: waitForReady=${internalState.getWaitForReadyTime().toFixed(2)}ms, createFrame=${internalState.getCreateFrameTime().toFixed(2)}ms, addSample=${internalState.getAddSampleTime().toFixed(2)}ms, audioMixing=${internalState.getAudioMixingTime().toFixed(2)}ms`,
		);

		if (webFsTarget) {
			sendUsageEvent({
				licenseKey: licenseKey ?? null,
				succeeded: true,
				apiName: 'renderMediaOnWeb',
				isStill: null,
				isProduction: null,
			});

			await webFsTarget.close();
			return {
				getBlob: () => {
					return webFsTarget.getBlob();
				},
				internalState,
			};
		}

		if (!(target instanceof BufferTarget)) {
			throw new Error('Expected target to be a BufferTarget');
		}

		sendUsageEvent({
			licenseKey: licenseKey ?? null,
			succeeded: true,
			apiName: 'renderMediaOnWeb',
			isStill: null,
			isProduction: null,
		});

		return {
			getBlob: () => {
				if (!target.buffer) {
					throw new Error('The resulting buffer is empty');
				}

				return Promise.resolve(
					new Blob([target.buffer], {type: getMimeType(container)}),
				);
			},
			internalState,
		};
	} catch (err) {
		if (!signal?.aborted) {
			sendUsageEvent({
				succeeded: false,
				licenseKey: licenseKey ?? null,
				apiName: 'renderMediaOnWeb',
				isStill: null,
				isProduction: null,
			}).catch((err2) => {
				Internals.Log.error(
					{logLevel: 'error', tag: 'web-renderer'},
					'Failed to send usage event',
					err2,
				);
			});
		}

		throw err;
	}
};

export const renderMediaOnWeb = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>(
	options: RenderMediaOnWebOptions<Schema, Props>,
): Promise<RenderMediaOnWebResult> => {
	const container = options.container ?? 'mp4';
	const codec =
		options.videoCodec ?? getDefaultVideoCodecForContainer(container);

	onlyOneRenderAtATimeQueue.ref = onlyOneRenderAtATimeQueue.ref
		.catch(() => Promise.resolve())
		.then(() =>
			internalRenderMediaOnWeb<Schema, Props>({
				...options,
				delayRenderTimeoutInMilliseconds:
					options.delayRenderTimeoutInMilliseconds ?? 30000,
				logLevel: options.logLevel ?? window.remotion_logLevel ?? 'info',
				schema: options.schema ?? undefined,
				mediaCacheSizeInBytes: options.mediaCacheSizeInBytes ?? null,
				videoCodec: codec,
				audioCodec: options.audioCodec ?? null,
				audioBitrate: options.audioBitrate ?? 'medium',
				container,
				signal: options.signal ?? null,
				onProgress: options.onProgress ?? null,
				hardwareAcceleration: options.hardwareAcceleration ?? 'no-preference',
				keyframeIntervalInSeconds: options.keyframeIntervalInSeconds ?? 5,
				videoBitrate: options.videoBitrate ?? 'medium',
				frameRange: options.frameRange ?? null,
				transparent: options.transparent ?? false,
				onArtifact: options.onArtifact ?? null,
				onFrame: options.onFrame ?? null,
				outputTarget: options.outputTarget ?? null,
				licenseKey: options.licenseKey ?? undefined,
				muted: options.muted ?? false,
				scale: options.scale ?? 1,
			}),
		);

	return onlyOneRenderAtATimeQueue.ref as Promise<RenderMediaOnWebResult>;
};
