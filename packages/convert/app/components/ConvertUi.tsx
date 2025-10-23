import {Button} from '@/components/ui/button';
import type MediaFox from '@mediafox/core';
import type {
	CropRectangle,
	Input,
	InputAudioTrack,
	InputFormat,
	InputTrack,
	InputVideoTrack,
	Rotation,
} from 'mediabunny';
import {
	Conversion,
	Output,
	QUALITY_HIGH,
	QUALITY_LOW,
	QUALITY_MEDIUM,
	QUALITY_VERY_HIGH,
	QUALITY_VERY_LOW,
	StreamTarget,
} from 'mediabunny';
import React, {useCallback, useMemo, useState} from 'react';

type QualityLevel =
	| typeof QUALITY_VERY_LOW
	| typeof QUALITY_LOW
	| typeof QUALITY_MEDIUM
	| typeof QUALITY_HIGH
	| typeof QUALITY_VERY_HIGH
	| null;
import {applyCrop} from '~/lib/apply-crop';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';
import {calculateNewDimensionsFromRotateAndScale} from '~/lib/calculate-new-dimensions-from-dimensions';
import {canRotateOrMirror} from '~/lib/can-rotate-or-mirror';
import type {ConvertState, Source} from '~/lib/convert-state';
import type {
	ConvertSections,
	RotateOrMirrorOrCropState,
} from '~/lib/default-ui';
import {getOrderOfSections, isConvertEnabledByDefault} from '~/lib/default-ui';
import {getNewName} from '~/lib/generate-new-name';
import {
	getActualAudioOperation,
	getActualVideoOperation,
} from '~/lib/get-audio-video-config-index';
import {getDefaultOutputFormat} from '~/lib/get-default-output-format';
import {getInitialResizeSuggestion} from '~/lib/get-initial-resize-suggestion';
import {isReencoding} from '~/lib/is-reencoding';
import {isSubmitDisabled} from '~/lib/is-submit-enabled';
import type {MediabunnyResize} from '~/lib/mediabunny-calculate-resize-option';
import {calculateMediabunnyResizeOption} from '~/lib/mediabunny-calculate-resize-option';
import {getMediabunnyOutput} from '~/lib/output-container';
import type {ConvertProgressType} from '~/lib/progress';
import {makeWaveformVisualizer} from '~/lib/waveform-visualizer';
import {makeWebFsTarget} from '~/lib/web-fs-target';
import type {OutputContainer, RouteAction} from '~/seo';
import {CompressUi} from './CompressUi';
import {ConversionDone} from './ConversionDone';
import {ConvertForm} from './ConvertForm';
import {ConvertProgress, convertProgressRef} from './ConvertProgress';
import {ConvertUiSection} from './ConvertUiSection';
import {ErrorState} from './ErrorState';
import {flipVideoFrame} from './flip-video';
import {MirrorComponents} from './MirrorComponents';
import {PauseResumeAndCancel} from './PauseResumeAndCancel';
import {ResampleUi} from './ResampleUi';
import {ResizeUi} from './ResizeUi';
import {RotateComponents} from './RotateComponents';
import {useSupportedConfigs} from './use-supported-configs';
import type {VideoThumbnailRef} from './VideoThumbnail';

const ConvertUI = ({
	currentAudioCodec,
	currentVideoCodec,
	tracks,
	setSrc,
	durationInSeconds,
	action,
	enableRotateOrMirror,
	setEnableRotateOrMirror,
	userRotation,
	setRotation,
	flipHorizontal,
	flipVertical,
	setFlipHorizontal,
	setFlipVertical,
	inputContainer,
	videoThumbnailRef,
	rotation,
	dimensions,
	sampleRate,
	name,
	input,
	mediafox,
	crop,
	cropRect,
}: {
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly currentAudioCodec: InputAudioTrack['codec'] | null;
	readonly currentVideoCodec: InputVideoTrack['codec'] | null;
	readonly tracks: InputTrack[] | null;
	readonly videoThumbnailRef: React.RefObject<VideoThumbnailRef | null>;
	readonly dimensions: Dimensions | null | undefined;
	readonly durationInSeconds: number | null;
	readonly rotation: number | null;
	readonly inputContainer: InputFormat;
	readonly action: RouteAction;
	readonly name: string;
	readonly input: Input;
	readonly enableRotateOrMirror: RotateOrMirrorOrCropState;
	readonly setEnableRotateOrMirror: React.Dispatch<
		React.SetStateAction<RotateOrMirrorOrCropState | null>
	>;
	readonly userRotation: number;
	readonly setRotation: React.Dispatch<React.SetStateAction<number>>;
	readonly flipHorizontal: boolean;
	readonly flipVertical: boolean;
	readonly setFlipHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
	readonly setFlipVertical: React.Dispatch<React.SetStateAction<boolean>>;
	readonly crop: boolean;
	readonly sampleRate: number | null;
	readonly mediafox: MediaFox;
	readonly cropRect: CropRectangle;
}) => {
	const [outputContainer, setOutputContainer] = useState<OutputContainer>(() =>
		getDefaultOutputFormat(inputContainer),
	);
	const [videoOperationSelection, setVideoOperationKey] = useState<
		Record<number, string>
	>({});
	const [audioOperationSelection, setAudioOperationKey] = useState<
		Record<number, string>
	>({});
	const [state, setState] = useState<ConvertState>({type: 'idle'});
	useState<number | null>(null);
	const [enableConvert, setEnableConvert] = useState(() =>
		isConvertEnabledByDefault(action),
	);
	const [resizeOperation, setResizeOperation] =
		useState<MediabunnyResize | null>(() => {
			return (action.type === 'resize-format' ||
				action.type === 'generic-resize') &&
				dimensions
				? getInitialResizeSuggestion(dimensions)
				: null;
		});

	const order = useMemo(() => {
		return Object.entries(getOrderOfSections(action))
			.sort(([, aOrder], [, bOrder]) => {
				return aOrder - bOrder;
			})
			.map(([section]) => section as ConvertSections);
	}, [action]);

	const [resampleUserPreferenceActive, setResampleUserPreferenceActive] =
		useState(false);
	const [resampleRate, setResampleRate] = useState<number>(16000);

	const [compressActive, setCompressActive] = useState(false);
	const [videoQuality, setVideoQuality] = useState<QualityLevel>(QUALITY_MEDIUM);
	const [audioQuality, setAudioQuality] = useState<QualityLevel>(QUALITY_MEDIUM);

	const canResample = useMemo(() => {
		return tracks?.find((t) => t.isAudioTrack());
	}, [tracks]);

	const actualResampleRate = useMemo(() => {
		if (!canResample) {
			return null;
		}

		if (!resampleUserPreferenceActive) {
			return null;
		}

		return resampleRate;
	}, [resampleRate, canResample, resampleUserPreferenceActive]);

	const hasVideo = useMemo(() => {
		return (tracks?.filter((t) => t.isVideoTrack()).length ?? 0) > 0;
	}, [tracks]);

	const hasAudio = useMemo(() => {
		return (tracks?.filter((t) => t.isAudioTrack()).length ?? 0) > 0;
	}, [tracks]);

	const actualVideoQuality = useMemo(() => {
		if (!hasVideo || !compressActive) {
			return null;
		}
		return videoQuality;
	}, [videoQuality, hasVideo, compressActive]);

	const actualAudioQuality = useMemo(() => {
		if (!hasAudio || !compressActive) {
			return null;
		}
		return audioQuality;
	}, [audioQuality, hasAudio, compressActive]);

	const supportedConfigs = useSupportedConfigs({
		outputContainer,
		tracks,
		action,
		userRotation,
		inputContainer,
		resizeOperation,
		sampleRate: actualResampleRate,
	});

	const isH264Reencode = supportedConfigs?.videoTrackOptions.some((o) => {
		const operation = getActualVideoOperation({
			enableConvert,
			trackNumber: o.trackId,
			videoConfigIndexSelection: videoOperationSelection,
			operations: o.operations,
		});
		return operation.type === 'reencode' && operation.videoCodec === 'avc';
	});

	const setVideoConfigIndex = useCallback((trackId: number, key: string) => {
		setVideoOperationKey((prev) => ({
			...prev,
			[trackId]: key,
		}));
	}, []);

	const setAudioConfigIndex = useCallback((trackId: number, key: string) => {
		setAudioOperationKey((prev) => ({
			...prev,
			[trackId]: key,
		}));
	}, []);

	const [bars, setBars] = useState<number[]>([]);

	const onWaveformBars = useCallback((b: number[]) => {
		setBars(b);
	}, []);

	const onClick = useCallback(() => {
		const progress: ConvertProgressType = {
			bytesWritten: 0,
			millisecondsWritten: 0,
			overallProgress: 0,
			hasVideo: false,
		};

		const waveform = makeWaveformVisualizer({
			onWaveformBars,
		});

		const format = getMediabunnyOutput(outputContainer);

		let cancelConversion = () => {};

		const run = async () => {
			const filename = getNewName(name, format);
			const {getBlob, stream, getWrittenByteCount, close} =
				await makeWebFsTarget(filename);

			const output = new Output({
				format,
				target: new StreamTarget(stream),
			});

			const duration = await input.computeDuration();
			waveform.setDuration(duration);

			let videoFrames = 0;

			const startTime = Date.now();

			if (!supportedConfigs) {
				throw new Error('No supported configs');
			}

			let stopped = false;
			setState({
				type: 'in-progress',
				onAbort: () => {
					setState({
						type: 'idle',
					});
					stopped = true;
				},
				state: progress,
				startTime,
				newName: filename,
			});

			try {
				const conversion = await Conversion.init({
					input,
					output,
					video: (videoTrack) => {
						const operation = getActualVideoOperation({
							enableConvert,
							trackNumber: videoTrack.id,
							videoConfigIndexSelection: videoOperationSelection,
							operations:
								supportedConfigs.videoTrackOptions.find(
									(o) => o.trackId === videoTrack.id,
								)?.operations ?? [],
						});

						if (operation.type === 'drop') {
							return {discard: true};
						}

						if (operation.type === 'copy') {
							progress.hasVideo = true;
							return {};
						}

						if (operation.type === 'fail') {
							throw new Error('videoOperation.type === "fail"');
						}

						progress.hasVideo = true;

						const dimensionsAfterCrop =
							dimensions && crop ? applyCrop(dimensions, cropRect) : dimensions;

						return {
							height: Math.min(videoTrack.displayHeight, 1080),
							process(sample) {
								const flipped = flipVideoFrame({
									frame: sample.toVideoFrame(),
									horizontal:
										flipHorizontal && enableRotateOrMirror === 'mirror',
									vertical: flipVertical && enableRotateOrMirror === 'mirror',
								});
								if (videoFrames % 15 === 0) {
									convertProgressRef.current?.draw(flipped);
								}

								progress.millisecondsWritten = sample.timestamp * 1000;

								videoFrames++;
								return flipped;
							},
							crop: crop
								? {
										width: Number.isFinite(cropRect.width)
											? cropRect.width
											: dimensions!.width - cropRect.left,
										height: Number.isFinite(cropRect.height)
											? cropRect.height
											: dimensions!.height - cropRect.top,
										left: cropRect.left,
										top: cropRect.top,
									}
								: undefined,
							rotate: userRotation as Rotation,
							forceTranscode: true,
							...calculateMediabunnyResizeOption(
								resizeOperation,
								dimensionsAfterCrop ?? null,
							),
							codec: operation.videoCodec,
							quality: actualVideoQuality ?? undefined,
						};
					},
					audio: (audioTrack) => {
						const operations =
							supportedConfigs.audioTrackOptions.find((o) => {
								return o.trackId === audioTrack.id;
							})?.operations ?? [];
						const operation = getActualAudioOperation({
							audioConfigIndexSelection: audioOperationSelection,
							enableConvert,
							operations,
							trackNumber: audioTrack.id,
						});

						if (operation.type === 'fail') {
							throw new Error('audioOperation.type === "fail"');
						}

						if (operation.type === 'copy') {
							return {};
						}

						if (operation.type === 'drop') {
							return {discard: true};
						}

						return {
							sampleRate: operation.sampleRate ?? undefined,
							process(sample) {
								if (!progress.hasVideo) {
									waveform.add(sample.toAudioBuffer());
								}

								return sample;
							},
							quality: actualAudioQuality ?? undefined,
						};
					},
				});

				if (stopped) {
					return;
				}

				cancelConversion = () => {
					conversion.cancel();

					setState({
						type: 'idle',
					});
				};

				if (input.disposed) {
					throw new Error('Input disposed');
				}

				conversion.onProgress = (newProg) => {
					progress.overallProgress = newProg;
					progress.bytesWritten = getWrittenByteCount();

					setState({
						type: 'in-progress',
						onAbort: cancelConversion,
						state: progress,
						startTime,
						newName: filename,
					});
				};

				await conversion.execute();

				close();

				setState({
					type: 'done',
					download: async () => {
						const blob = await getBlob();
						return blob;
					},
					state: progress,
					startTime,
					completedTime: Date.now(),
					newName: filename,
				});
			} catch (error) {
				setState({
					type: 'error',
					error: error as Error,
				});
			}
		};

		run();

		return () => {
			cancelConversion();
		};
	}, [
		audioOperationSelection,
		dimensions,
		enableConvert,
		enableRotateOrMirror,
		flipHorizontal,
		flipVertical,
		input,
		name,
		onWaveformBars,
		outputContainer,
		resizeOperation,
		supportedConfigs,
		userRotation,
		videoOperationSelection,
		crop,
		cropRect,
		actualVideoQuality,
		actualAudioQuality,
	]);

	const dimissError = useCallback(() => {
		setState({type: 'idle'});
	}, []);

	const onMirrorClick = useCallback(() => {
		setEnableRotateOrMirror((m) => {
			if (m !== 'mirror') {
				return 'mirror';
			}

			return null;
		});
	}, [setEnableRotateOrMirror]);

	const onRotateClick = useCallback(() => {
		setEnableRotateOrMirror((m) => {
			if (m !== 'rotate') {
				return 'rotate';
			}

			return null;
		});
	}, [setEnableRotateOrMirror]);

	const onCropClick = useCallback(() => {
		setEnableRotateOrMirror((m) => {
			if (m !== 'crop') {
				// Scroll to top of the page when crop is activated
				if (typeof window !== 'undefined') {
					window.scrollTo({top: 0, behavior: 'smooth'});
				}

				return 'crop';
			}

			return null;
		});
	}, [setEnableRotateOrMirror]);

	const onResizeClick = useCallback(() => {
		setResizeOperation((r) => {
			if (r !== null || !dimensions) {
				return null;
			}

			return getInitialResizeSuggestion(dimensions);
		});
	}, [dimensions]);

	const inputIsAudioExclusively = useMemo(() => {
		return (tracks?.filter((t) => t.isVideoTrack()).length ?? 0) === 0;
	}, [tracks]);

	const unrotatedDimensions = useMemo(() => {
		if (!dimensions) {
			return null;
		}

		if (enableRotateOrMirror !== 'crop') {
			return dimensions;
		}

		return applyCrop(dimensions, cropRect);
	}, [dimensions, cropRect, enableRotateOrMirror]);

	const newDimensions = useMemo(() => {
		if (unrotatedDimensions === null) {
			return null;
		}

		return calculateNewDimensionsFromRotateAndScale({
			...unrotatedDimensions,
			rotation: userRotation - (rotation ?? 0),
			resizeOperation,
			needsToBeMultipleOfTwo: isH264Reencode ?? false,
		});
	}, [
		unrotatedDimensions,
		isH264Reencode,
		resizeOperation,
		rotation,
		userRotation,
	]);

	if (state.type === 'error') {
		return (
			<>
				<ErrorState error={state.error} />
				<div className="h-4" />
				<Button className="block w-full" type="button" onClick={dimissError}>
					Dismiss
				</Button>
			</>
		);
	}

	if (state.type === 'in-progress') {
		return (
			<>
				<ConvertProgress
					mediafox={mediafox}
					state={state.state}
					newName={state.newName}
					done={false}
					duration={durationInSeconds}
					isReencoding={
						supportedConfigs !== null &&
						isReencoding({
							supportedConfigs,
							videoConfigIndexSelection: videoOperationSelection,
							enableConvert,
						})
					}
					bars={bars}
					startTime={state.startTime}
				/>
				<div className="h-2" />
				<PauseResumeAndCancel onAbort={state.onAbort} />
			</>
		);
	}

	if (state.type === 'done') {
		return (
			<>
				<ConvertProgress
					done
					mediafox={mediafox}
					state={state.state}
					newName={state.newName}
					duration={durationInSeconds}
					isReencoding={
						supportedConfigs !== null &&
						isReencoding({
							supportedConfigs,
							videoConfigIndexSelection: videoOperationSelection,
							enableConvert,
						})
					}
					bars={bars}
					startTime={state.startTime}
					completedTime={state.completedTime}
				/>
				<div className="h-2" />
				<ConversionDone
					{...{container: outputContainer, name, setState, state, setSrc}}
				/>
			</>
		);
	}

	const disableSubmit = isSubmitDisabled({
		audioConfigIndexSelection: audioOperationSelection,
		supportedConfigs,
		videoConfigIndexSelection: videoOperationSelection,
		enableConvert,
		enableRotateOrMirror,
	});

	const canPixelManipulate = canRotateOrMirror({
		supportedConfigs,
		videoConfigIndexSelection: videoOperationSelection,
		enableConvert,
	});

	return (
		<>
			<div className="w-full gap-4 flex flex-col">
				{order.map((section) => {
					if (section === 'convert') {
						return (
							<div key="convert">
								<ConvertUiSection
									active={enableConvert}
									setActive={setEnableConvert}
								>
									Convert
								</ConvertUiSection>
								{enableConvert ? (
									<>
										<div className="h-2" />
										<ConvertForm
											{...{
												container: outputContainer,
												setContainer: setOutputContainer,
												flipHorizontal,
												flipVertical,
												setFlipHorizontal,
												setFlipVertical,
												supportedConfigs,
												audioConfigIndexSelection: audioOperationSelection,
												videoConfigIndexSelection: videoOperationSelection,
												setAudioConfigIndex,
												setVideoConfigIndex,
												currentAudioCodec,
												currentVideoCodec,
											}}
										/>
									</>
								) : null}
							</div>
						);
					}

					if (section === 'mirror') {
						if (inputIsAudioExclusively) {
							return null;
						}

						return (
							<div key="mirror">
								<ConvertUiSection
									active={enableRotateOrMirror === 'mirror'}
									setActive={onMirrorClick}
								>
									Mirror
								</ConvertUiSection>
								{enableRotateOrMirror === 'mirror' ? (
									<MirrorComponents
										canPixelManipulate={canPixelManipulate}
										flipHorizontal={flipHorizontal}
										flipVertical={flipVertical}
										setFlipHorizontal={setFlipHorizontal}
										setFlipVertical={setFlipVertical}
									/>
								) : null}
							</div>
						);
					}

					if (section === 'rotate') {
						if (inputIsAudioExclusively) {
							return null;
						}

						return (
							<div key="rotate">
								<ConvertUiSection
									active={enableRotateOrMirror === 'rotate'}
									setActive={onRotateClick}
								>
									Rotate
								</ConvertUiSection>
								{enableRotateOrMirror === 'rotate' ? (
									<RotateComponents
										canPixelManipulate={canPixelManipulate}
										rotation={userRotation}
										setRotation={setRotation}
									/>
								) : null}
							</div>
						);
					}

					if (section === 'resample') {
						if (!canResample) {
							return null;
						}

						return (
							<div key="resample">
								<ConvertUiSection
									active={resampleUserPreferenceActive}
									setActive={setResampleUserPreferenceActive}
								>
									Resample
								</ConvertUiSection>
								{resampleUserPreferenceActive ? (
									<ResampleUi
										sampleRate={resampleRate}
										setSampleRate={setResampleRate}
										currentSampleRate={sampleRate}
									/>
								) : null}
							</div>
						);
					}

					if (section === 'crop') {
						return (
							<div key="crop">
								<ConvertUiSection active={crop} setActive={onCropClick}>
									Crop
								</ConvertUiSection>
								{crop ? (
									<div className="text-gray-700 text-sm mt-2">
										Use the handles above to crop the video.
									</div>
								) : null}
							</div>
						);
					}

					if (section === 'resize') {
						if (inputIsAudioExclusively) {
							return null;
						}

						return (
							<div key="resize">
								<ConvertUiSection
									active={resizeOperation !== null && newDimensions !== null}
									setActive={onResizeClick}
								>
									Resize
								</ConvertUiSection>
								{resizeOperation !== null &&
								newDimensions !== null &&
								unrotatedDimensions !== null &&
								dimensions !== null &&
								dimensions !== undefined ? (
									<>
										<div className="h-2" />
										<ResizeUi
											originalDimensions={unrotatedDimensions}
											dimensions={newDimensions}
											thumbnailRef={videoThumbnailRef}
											rotation={userRotation - (rotation ?? 0)}
											setResizeMode={setResizeOperation}
											requireTwoStep={Boolean(isH264Reencode)}
											crop={enableRotateOrMirror === 'crop'}
											cropRect={cropRect}
											dimensionsBeforeCrop={dimensions}
										/>
									</>
								) : null}
							</div>
						);
					}

					if (section === 'compress') {
						return (
							<div key="compress">
								<ConvertUiSection
									active={compressActive}
									setActive={setCompressActive}
								>
									Compress
								</ConvertUiSection>
								{compressActive ? (
									<CompressUi
										videoQuality={videoQuality}
										setVideoQuality={setVideoQuality}
										audioQuality={audioQuality}
										setAudioQuality={setAudioQuality}
										hasVideo={hasVideo}
										hasAudio={hasAudio}
									/>
								) : null}
							</div>
						);
					}

					throw new Error('Unknown section ' + (section satisfies never));
				})}
			</div>
			<div className="h-8" />
			<Button
				className="block w-full"
				type="button"
				variant="brand"
				disabled={disableSubmit}
				onClick={onClick}
			>
				Convert
			</Button>
		</>
	);
};

export default ConvertUI;
