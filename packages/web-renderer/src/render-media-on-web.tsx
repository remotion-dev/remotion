import {BufferTarget, StreamTarget} from 'mediabunny';
import type {CalculateMetadataFunction} from 'remotion';
import {Internals, type LogLevel} from 'remotion';
import {VERSION} from 'remotion/version';
import type {z} from 'zod';
import type {$ZodObject} from 'zod/v4/core';
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
	isAudioOnlyContainer,
	type WebRendererVideoCodec,
} from './mediabunny-mappings';
import type {WebRendererOutputTarget} from './output-target';
import type {CompositionCalculateMetadataOrExplicit} from './props-if-has-props';
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
	Schema extends $ZodObject,
	Props,
> = $ZodObject extends Schema
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
	Schema extends $ZodObject,
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

export type WebRendererHardwareAcceleration =
	| 'no-preference'
	| 'prefer-hardware'
	| 'prefer-software';

type OptionalRenderMediaOnWebOptions<Schema extends $ZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	mediaCacheSizeInBytes: number | null;
	videoCodec: WebRendererVideoCodec | null;
	audioCodec: WebRendererAudioCodec | null;
	audioBitrate: number | WebRendererQuality;
	container: WebRendererContainer;
	signal: AbortSignal | null;
	onProgress: RenderMediaOnWebProgressCallback | null;
	hardwareAcceleration: WebRendererHardwareAcceleration;
	keyframeIntervalInSeconds: number;
	videoBitrate: number | WebRendererQuality;
	frameRange: FrameRange | null;
	transparent: boolean;
	onArtifact: WebRendererOnArtifact | null;
	onFrame: OnFrameCallback | null;
	outputTarget: WebRendererOutputTarget | null;
	licenseKey: string | null;
	isProduction: boolean;
	muted: boolean;
	scale: number;
};

export type RenderMediaOnWebOptions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderMediaOnWebOptions<Schema, Props> &
	Partial<OptionalRenderMediaOnWebOptions<Schema>> &
	InputPropsIfHasProps<Schema, Props>;

type InternalRenderMediaOnWebOptions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderMediaOnWebOptions<Schema, Props> &
	OptionalRenderMediaOnWebOptions<Schema> &
	InputPropsIfHasProps<Schema, Props>;

// TODO: Validating inputs
// TODO: Apply defaultCodec

const internalRenderMediaOnWeb = async <
	Schema extends $ZodObject,
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
	isProduction,
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
	const videoEnabled = !isAudioOnlyContainer(container);

	if (
		videoEnabled &&
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
			(composition.calculateMetadata as unknown as CalculateMetadataFunction<
				Record<string, unknown>
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
		videoEnabled,
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

	outputWithCleanup.output.setMetadataTags({
		comment: `Made with Remotion ${VERSION}`,
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

		using videoSampleSource =
			videoEnabled && codec
				? makeVideoSampleSourceCleanup({
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
					})
				: null;

		const totalFrames = realFrameRange[1] - realFrameRange[0] + 1;
		const durationInSeconds = totalFrames / resolved.fps;

		if (videoSampleSource) {
			outputWithCleanup.output.addVideoTrack(
				videoSampleSource.videoSampleSource,
				{
					// 1 packet per frame, + 33% buffer
					// https://mediabunny.dev/api/BaseTrackMetadata#maximumpacketcount
					maximumPacketCount: Math.ceil(totalFrames * 1.33),
				},
			);
		}

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
				{
					// ~1 packet per 10ms, + 33% buffer
					// https://mediabunny.dev/api/BaseTrackMetadata#maximumpacketcount
					maximumPacketCount: Math.ceil(durationInSeconds * 100 * 1.33),
				},
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

			const timestamp = Math.round(
				((frame - realFrameRange[0]) / resolved.fps) * 1_000_000,
			);

			let frameToEncode: VideoFrame | null = null;
			let layerCanvas: OffscreenCanvas | null = null;

			if (videoEnabled) {
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
				layerCanvas = layer.canvas;

				if (signal?.aborted) {
					throw new Error('renderMediaOnWeb() was cancelled');
				}

				const videoFrame = new VideoFrame(layer.canvas, {
					timestamp,
				});

				frameToEncode = videoFrame;
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
			}

			progress.renderedFrames++;
			throttledOnProgress?.({...progress});

			const audioCombineStart = performance.now();
			const assets = collectAssets.current!.collectAssets();
			if (onArtifact) {
				await artifactsHandler.handle({
					imageData: layerCanvas,
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
				: onlyInlineAudio({assets, fps: resolved.fps, timestamp});
			internalState.addAudioMixingTime(performance.now() - audioCombineStart);

			const addSampleStart = performance.now();
			const encodingPromises: Promise<void>[] = [];
			if (frameToEncode && videoSampleSource) {
				encodingPromises.push(
					addVideoSampleAndCloseFrame(
						frameToEncode,
						videoSampleSource.videoSampleSource,
					),
				);
			}

			if (audio && audioSampleSource) {
				encodingPromises.push(
					addAudioSample(audio, audioSampleSource.audioSampleSource),
				);
			}

			await Promise.all(encodingPromises);
			internalState.addAddSampleTime(performance.now() - addSampleStart);

			progress.encodedFrames++;
			throttledOnProgress?.({...progress});

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}
		}

		// Call progress one final time to ensure final state is reported
		onProgress?.({...progress});

		videoSampleSource?.videoSampleSource.close();
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
				isStill: false,
				isProduction: isProduction ?? true,
			});

			await webFsTarget.close();
			return {
				getBlob: async () => {
					const file = await webFsTarget.getBlob();
					return new Blob([file], {type: getMimeType(container)});
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
			isStill: false,
			isProduction: isProduction ?? true,
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
				isStill: false,
				isProduction: isProduction ?? true,
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
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
>(
	options: RenderMediaOnWebOptions<Schema, Props>,
): Promise<RenderMediaOnWebResult> => {
	const container = options.container ?? 'mp4';
	const codec =
		options.videoCodec ?? getDefaultVideoCodecForContainer(container) ?? null;

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
				licenseKey: options.licenseKey ?? null,
				muted: options.muted ?? false,
				scale: options.scale ?? 1,
				isProduction: options.isProduction ?? true,
			}),
		);

	return onlyOneRenderAtATimeQueue.ref as Promise<RenderMediaOnWebResult>;
};
