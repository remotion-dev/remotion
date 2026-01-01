import {
	AudioSampleSource,
	BufferTarget,
	canEncodeAudio,
	Output,
	StreamTarget,
	VideoSampleSource,
} from 'mediabunny';
import type {CalculateMetadataFunction} from 'remotion';
import {Internals, type LogLevel} from 'remotion';
import type {AnyZodObject, z} from 'zod';
import {addAudioSample, addVideoSampleAndCloseFrame} from './add-sample';
import {handleArtifacts, type WebRendererOnArtifact} from './artifact';
import {onlyInlineAudio} from './audio';
import {canUseWebFsWriter} from './can-use-webfs-target';
import {createScaffold} from './create-scaffold';
import {getRealFrameRange, type FrameRange} from './frame-range';
import type {InternalState} from './internal-state';
import {makeInternalState} from './internal-state';
import type {
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
} from './mediabunny-mappings';
import {
	audioCodecToMediabunnyAudioCodec,
	codecToMediabunnyCodec,
	containerToMediabunnyContainer,
	getDefaultAudioCodecForContainer,
	getDefaultVideoCodecForContainer,
	getMimeType,
	getQualityForWebRendererQuality,
	getSupportedAudioCodecsForContainer,
	type WebRendererVideoCodec,
} from './mediabunny-mappings';
import type {WebRendererOutputTarget} from './output-target';
import type {
	CompositionCalculateMetadataOrExplicit,
	InferProps,
} from './props-if-has-props';
import {onlyOneRenderAtATimeQueue} from './render-operations-queue';
import {sendUsageEvent} from './send-telemetry-event';
import {createFrame} from './take-screenshot';
import {createThrottledProgressCallback} from './throttle-progress';
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
}: InternalRenderMediaOnWebOptions<
	Schema,
	Props
>): Promise<RenderMediaOnWebResult> => {
	const outputTarget =
		userDesiredOutputTarget === null
			? (await canUseWebFsWriter())
				? 'web-fs'
				: 'arraybuffer'
			: userDesiredOutputTarget;

	if (outputTarget === 'web-fs') {
		await cleanupStaleOpfsFiles();
	}

	const cleanupFns: (() => void)[] = [];
	const format = containerToMediabunnyContainer(container);

	if (
		codec &&
		!format.getSupportedCodecs().includes(codecToMediabunnyCodec(codec))
	) {
		return Promise.reject(
			new Error(`Codec ${codec} is not supported for container ${container}`),
		);
	}

	const audioCodec =
		unresolvedAudioCodec ?? getDefaultAudioCodecForContainer(container);
	const userSpecifiedAudioCodec = unresolvedAudioCodec !== undefined;

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

	const {delayRenderScope, div, cleanupScaffold, timeUpdater, collectAssets} =
		await createScaffold({
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

	const internalState = makeInternalState();

	const artifactsHandler = handleArtifacts();

	cleanupFns.push(() => {
		cleanupScaffold();
	});

	const webFsTarget =
		outputTarget === 'web-fs' ? await createWebFsTarget() : null;

	const target = webFsTarget
		? new StreamTarget(webFsTarget.stream)
		: new BufferTarget()!;

	const output = new Output({
		format,
		target,
	});

	try {
		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
			signal,
			apiName: 'renderMediaOnWeb',
		});

		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		cleanupFns.push(() => {
			if (output.state === 'finalized' || output.state === 'canceled') {
				return;
			}

			output.cancel();
		});

		const videoSampleSource = new VideoSampleSource({
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

		cleanupFns.push(() => {
			videoSampleSource.close();
		});

		output.addVideoTrack(videoSampleSource);

		let audioSampleSource: AudioSampleSource | null = null;

		if (!muted) {
			const supportedAudioCodecs =
				getSupportedAudioCodecsForContainer(container);
			if (!supportedAudioCodecs.includes(audioCodec)) {
				return Promise.reject(
					new Error(
						`Audio codec "${audioCodec}" is not supported for container "${container}". Supported audio codecs: ${supportedAudioCodecs.join(', ')}`,
					),
				);
			}

			const resolvedAudioBitrate =
				typeof audioBitrate === 'number'
					? audioBitrate
					: getQualityForWebRendererQuality(audioBitrate);

			let finalAudioCodec = audioCodec;
			const mediabunnyAudioCodec = audioCodecToMediabunnyAudioCodec(audioCodec);
			const canEncode = await canEncodeAudio(mediabunnyAudioCodec, {
				bitrate: resolvedAudioBitrate,
			});

			if (!canEncode) {
				if (userSpecifiedAudioCodec) {
					let errorMessage = `Audio codec "${audioCodec}" cannot be encoded by this browser.`;
					const isFirefox =
						typeof navigator !== 'undefined' &&
						/firefox/i.test(navigator.userAgent);
					if (audioCodec === 'aac' && isFirefox) {
						errorMessage +=
							' AAC encoding is not supported in Firefox. Try using "opus" instead.';
					} else {
						errorMessage +=
							' This is common for AAC on Firefox. Try using "opus" instead.';
					}

					return Promise.reject(new Error(errorMessage));
				}

				let fallbackCodec: WebRendererAudioCodec | null = null;
				for (const supportedCodec of supportedAudioCodecs) {
					if (supportedCodec !== audioCodec) {
						const fallbackMediabunnyCodec =
							audioCodecToMediabunnyAudioCodec(supportedCodec);
						const canEncodeFallback = await canEncodeAudio(
							fallbackMediabunnyCodec,
							{
								bitrate: resolvedAudioBitrate,
							},
						);
						if (canEncodeFallback) {
							fallbackCodec = supportedCodec;
							break;
						}
					}
				}

				Internals.Log.warn(
					{logLevel, tag: '@remotion/web-renderer'},
					`Falling back from audio codec "${audioCodec}" to "${fallbackCodec}" for container "${container}" because the original codec cannot be encoded by this browser.`,
				);
				if (!fallbackCodec) {
					return Promise.reject(
						new Error(
							`No audio codec can be encoded by this browser for container "${container}".`,
						),
					);
				}

				finalAudioCodec = fallbackCodec;
			}

			audioSampleSource = new AudioSampleSource({
				codec: audioCodecToMediabunnyAudioCodec(finalAudioCodec),
				bitrate: resolvedAudioBitrate,
			});

			cleanupFns.push(() => {
				audioSampleSource?.close();
			});

			output.addAudioTrack(audioSampleSource);
		}

		await output.start();

		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		const progress: RenderMediaOnWebProgress = {
			renderedFrames: 0,
			encodedFrames: 0,
		};

		const throttledOnProgress = createThrottledProgressCallback(onProgress);

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
			});

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			const imageData = await createFrame({
				div,
				width: resolved.width,
				height: resolved.height,
				logLevel,
				internalState,
			});

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			const assets = collectAssets.current!.collectAssets();
			if (onArtifact) {
				await artifactsHandler.handle({
					imageData,
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

			const timestamp = Math.round(
				((frame - realFrameRange[0]) / resolved.fps) * 1_000_000,
			);
			const videoFrame = new VideoFrame(imageData, {
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
					expectedWidth: resolved.width,
					expectedHeight: resolved.height,
					expectedTimestamp: timestamp,
				});
			}

			await Promise.all([
				addVideoSampleAndCloseFrame(frameToEncode, videoSampleSource),
				audio && audioSampleSource
					? addAudioSample(audio, audioSampleSource)
					: Promise.resolve(),
			]);

			progress.encodedFrames++;
			throttledOnProgress?.({...progress});

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}
		}

		// Call progress one final time to ensure final state is reported
		onProgress?.({...progress});

		videoSampleSource.close();
		audioSampleSource?.close();
		await output.finalize();

		const mimeType = getMimeType(container);

		if (webFsTarget) {
			sendUsageEvent({
				licenseKey: licenseKey ?? null,
				succeeded: true,
				apiName: 'renderMediaOnWeb',
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
		});

		return {
			getBlob: () => {
				if (!target.buffer) {
					throw new Error('The resulting buffer is empty');
				}

				return Promise.resolve(new Blob([target.buffer], {type: mimeType}));
			},
			internalState,
		};
	} catch (err) {
		sendUsageEvent({
			succeeded: false,
			licenseKey: licenseKey ?? null,
			apiName: 'renderMediaOnWeb',
		}).catch((err2) => {
			Internals.Log.error(
				{logLevel: 'error', tag: 'web-renderer'},
				'Failed to send usage event',
				err2,
			);
		});
		throw err;
	} finally {
		cleanupFns.forEach((fn) => fn());
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
				composition: options.composition,
				inputProps: options.inputProps,
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
			} as InternalRenderMediaOnWebOptions<Schema, Props>),
		);

	return onlyOneRenderAtATimeQueue.ref as Promise<RenderMediaOnWebResult>;
};
