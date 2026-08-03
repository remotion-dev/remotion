import {Button} from '@remotion/design';
import type {
	CropRectangle,
	Input,
	InputFormat,
	InputTrack,
	InputVideoTrack,
	Rotation,
} from 'mediabunny';
import {Conversion, Output, StreamTarget} from 'mediabunny';
import React, {useCallback, useMemo, useState} from 'react';
import {applyCrop} from '~/lib/apply-crop';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';
import {
	calculateNewDimensionsFromRotate,
	calculateNewSizeAfterResizing,
} from '~/lib/calculate-new-dimensions-from-dimensions';
import {canRotateOrMirror} from '~/lib/can-rotate-or-mirror';
import type {ConvertState, Source} from '~/lib/convert-state';
import type {ConvertSections, VideoEditState} from '~/lib/default-ui';
import {
	getOrderOfSections,
	isConvertEnabledByDefault,
	isVideoOnlySection,
} from '~/lib/default-ui';
import {getNewName} from '~/lib/generate-new-name';
import {
	getActualAudioOperation,
	getActualVideoOperation,
} from '~/lib/get-audio-video-config-index';
import {getConvertActionLabel} from '~/lib/get-convert-action-label';
import {
	getDefaultConvertOutputFormat,
	getDefaultEditOutputFormat,
} from '~/lib/get-default-output-format';
import {getDurationOrCompute} from '~/lib/get-duration-or-compute';
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
import {ConversionDone} from './ConversionDone';
import {ConvertForm} from './ConvertForm';
import {ConvertProgress, convertProgressRef} from './ConvertProgress';
import {ConvertUiSection} from './ConvertUiSection';
import {ErrorState} from './ErrorState';
import {flipVideoFrame} from './flip-video';
import {makeCrop} from './make-crop';
import {MirrorComponents} from './MirrorComponents';
import {ResampleUi} from './ResampleUi';
import {ResizeUi} from './ResizeUi';
import {RotateComponents} from './RotateComponents';
import {useSupportedConfigs} from './use-supported-configs';
import type {VideoThumbnailRef} from './VideoThumbnail';

const ConvertUI = ({
	currentVideoCodec,
	tracks,
	setSrc,
	durationInSeconds,
	fps,
	action,
	trim,
	setTrim,
	trimInFrame,
	trimOutFrame,
	userRotation,
	setRotation,
	flipHorizontal,
	flipVertical,
	setFlipHorizontal,
	setFlipVertical,
	inputContainer,
	videoThumbnailRef,
	dimensions,
	sampleRate,
	name,
	input,
	videoEditState,
	setVideoEditState,
	cropRect,
}: {
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly currentVideoCodec: InputVideoTrack['codec'] | null;
	readonly tracks: InputTrack[] | null;
	readonly videoThumbnailRef: React.RefObject<VideoThumbnailRef | null>;
	readonly dimensions: Dimensions | null | undefined;
	readonly durationInSeconds: number | null;
	readonly fps: number | null | undefined;
	readonly inputContainer: InputFormat;
	readonly action: RouteAction;
	readonly trim: boolean;
	readonly setTrim: React.Dispatch<React.SetStateAction<boolean>>;
	readonly trimInFrame: number | null;
	readonly trimOutFrame: number | null;
	readonly name: string;
	readonly input: Input;
	readonly videoEditState: VideoEditState;
	readonly setVideoEditState: React.Dispatch<
		React.SetStateAction<VideoEditState>
	>;
	readonly userRotation: number;
	readonly setRotation: React.Dispatch<React.SetStateAction<number>>;
	readonly flipHorizontal: boolean;
	readonly flipVertical: boolean;
	readonly setFlipHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
	readonly setFlipVertical: React.Dispatch<React.SetStateAction<boolean>>;
	readonly sampleRate: number | null;
	readonly cropRect: CropRectangle;
}) => {
	const {crop, mirror, rotate} = videoEditState;
	const [enableConvert, setEnableConvert] = useState(() =>
		isConvertEnabledByDefault(action),
	);
	const editOutputContainer = useMemo(
		() => getDefaultEditOutputFormat(inputContainer),
		[inputContainer],
	);
	const [convertOutputContainer, setConvertOutputContainer] =
		useState<OutputContainer>(() =>
			getDefaultConvertOutputFormat({inputContainer, action}),
		);
	const actualOutputContainer = enableConvert
		? convertOutputContainer
		: editOutputContainer;
	const [videoOperationSelection, setVideoOperationKey] = useState<
		Record<number, string>
	>({});
	const [audioOperationSelection, setAudioOperationKey] = useState<
		Record<number, string>
	>({});
	const [state, setState] = useState<ConvertState>({type: 'idle'});
	useState<number | null>(null);
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

	const disableVideoCopy =
		crop || mirror || rotate || trim || resizeOperation !== null;

	const supportedConfigs = useSupportedConfigs({
		outputContainer: actualOutputContainer,
		tracks,
		action,
		userRotation,
		inputContainer,
		resizeOperation,
		sampleRate: actualResampleRate,
		disableVideoCopy,
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

	const dimensionsAfterRotation = useMemo(() => {
		if (!dimensions) {
			return null;
		}

		return calculateNewDimensionsFromRotate({
			...dimensions,
			rotation: userRotation,
		});
	}, [dimensions, userRotation]);

	const dimensionsAfterCrop = useMemo(() => {
		if (dimensionsAfterRotation === null || !crop) {
			return dimensionsAfterRotation;
		}

		return applyCrop(dimensionsAfterRotation, cropRect);
	}, [crop, cropRect, dimensionsAfterRotation]);

	const newDimensions = useMemo(() => {
		if (dimensionsAfterCrop === null) {
			return null;
		}

		return calculateNewSizeAfterResizing({
			dimensions: dimensionsAfterCrop,
			resizeOperation,
			needsToBeMultipleOfTwo: isH264Reencode ?? false,
		});
	}, [dimensionsAfterCrop, isH264Reencode, resizeOperation]);

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

		const format = getMediabunnyOutput(actualOutputContainer);

		let cancelConversion = () => {};

		const run = async () => {
			const filename = getNewName(name, format);
			const {getBlob, stream, getWrittenByteCount, close} =
				await makeWebFsTarget(filename);

			const output = new Output({
				format,
				target: new StreamTarget(stream),
			});

			const duration = await getDurationOrCompute(input);
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
					trim:
						trim && fps
							? {
									start: trimInFrame === null ? undefined : trimInFrame / fps,
									end:
										trimOutFrame === null
											? undefined
											: (trimOutFrame + 1) / fps,
								}
							: undefined,
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

						return {
							process(sample) {
								const flipped = flipVideoFrame({
									frame: sample.toVideoFrame(),
									horizontal: flipHorizontal && mirror,
									vertical: flipVertical && mirror,
								});
								if (videoFrames % 15 === 0) {
									convertProgressRef.current?.draw(flipped);
								}

								progress.millisecondsWritten = sample.timestamp * 1000;

								videoFrames++;
								return flipped;
							},
							crop: crop
								? makeCrop({
										cropRect,
										dimensions: dimensionsAfterRotation!,
										mirrorHorizontal: flipHorizontal && mirror,
										mirrorVertical: flipVertical && mirror,
										videoCodec: operation.videoCodec,
									})
								: undefined,
							rotate: userRotation as Rotation,
							forceTranscode: true,
							...calculateMediabunnyResizeOption(
								resizeOperation,
								dimensionsAfterCrop ?? null,
							),
							codec: operation.videoCodec,
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
							codec: operation.audioCodec,
							forceTranscode: true,
							sampleRate: operation.sampleRate ?? undefined,
							process(sample) {
								if (!progress.hasVideo) {
									waveform.add(sample.toAudioBuffer());
								}

								return sample;
							},
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
		actualOutputContainer,
		enableConvert,
		flipHorizontal,
		flipVertical,
		input,
		name,
		onWaveformBars,
		resizeOperation,
		supportedConfigs,
		fps,
		trim,
		trimInFrame,
		trimOutFrame,
		userRotation,
		videoOperationSelection,
		crop,
		cropRect,
		dimensionsAfterCrop,
		dimensionsAfterRotation,
		mirror,
	]);

	const dimissError = useCallback(() => {
		setState({type: 'idle'});
	}, []);

	const onMirrorClick = useCallback(() => {
		setVideoEditState((editState) => ({
			...editState,
			mirror: !editState.mirror,
		}));
	}, [setVideoEditState]);

	const onRotateClick = useCallback(() => {
		setVideoEditState((editState) => ({
			...editState,
			rotate: !editState.rotate,
		}));
	}, [setVideoEditState]);

	const onCropClick = useCallback(() => {
		setVideoEditState((editState) => {
			if (!editState.crop) {
				// Scroll to top of the page when crop is activated
				if (typeof window !== 'undefined') {
					window.scrollTo({top: 0, behavior: 'smooth'});
				}
			}

			return {...editState, crop: !editState.crop};
		});
	}, [setVideoEditState]);

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
				<Button key="cancel" className="w-full" onClick={state.onAbort}>
					Cancel
				</Button>
			</>
		);
	}

	if (state.type === 'done') {
		return (
			<>
				<ConvertProgress
					done
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
					{...{container: actualOutputContainer, name, setState, state, setSrc}}
				/>
			</>
		);
	}

	const disableSubmit = isSubmitDisabled({
		audioConfigIndexSelection: audioOperationSelection,
		supportedConfigs,
		videoConfigIndexSelection: videoOperationSelection,
		enableConvert,
		videoEditState,
		enableTrim: trim,
		enableResize: resizeOperation !== null,
	});

	const canPixelManipulate = canRotateOrMirror({
		supportedConfigs,
		videoConfigIndexSelection: videoOperationSelection,
		enableConvert,
	});

	const convertActionLabel = getConvertActionLabel({
		audioConfigIndexSelection: audioOperationSelection,
		enableConvert,
		inputContainer,
		outputContainer: actualOutputContainer,
		supportedConfigs,
		tracks,
		videoConfigIndexSelection: videoOperationSelection,
	});

	return (
		<>
			<div className="w-full gap-4 flex flex-col">
				{order.map((section) => {
					if (inputIsAudioExclusively && isVideoOnlySection(section)) {
						return null;
					}

					if (section === 'convert') {
						return (
							<div key="convert">
								<ConvertUiSection
									active={enableConvert}
									setActive={setEnableConvert}
								>
									{convertActionLabel}
								</ConvertUiSection>
								{enableConvert ? (
									<>
										<div className="h-2" />
										<ConvertForm
											{...{
												container: convertOutputContainer,
												setContainer: setConvertOutputContainer,
												flipHorizontal,
												flipVertical,
												setFlipHorizontal,
												setFlipVertical,
												supportedConfigs,
												audioConfigIndexSelection: audioOperationSelection,
												videoConfigIndexSelection: videoOperationSelection,
												setAudioConfigIndex,
												setVideoConfigIndex,
												currentVideoCodec,
											}}
										/>
									</>
								) : null}
							</div>
						);
					}

					if (section === 'mirror') {
						return (
							<div key="mirror">
								<ConvertUiSection active={mirror} setActive={onMirrorClick}>
									Mirror
								</ConvertUiSection>
								{mirror ? (
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
						return (
							<div key="rotate">
								<ConvertUiSection active={rotate} setActive={onRotateClick}>
									Rotate
								</ConvertUiSection>
								{rotate ? (
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

					if (section === 'trim') {
						return (
							<div key="trim">
								<ConvertUiSection active={trim} setActive={setTrim}>
									Trim
								</ConvertUiSection>
								{trim ? (
									<div className="text-gray-700 text-sm mt-2">
										Use the handles below the player to choose the start and end
										of the video.
									</div>
								) : null}
							</div>
						);
					}

					if (section === 'resize') {
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
								dimensionsAfterCrop !== null &&
								dimensionsAfterRotation !== null &&
								dimensions !== null &&
								dimensions !== undefined ? (
									<>
										<div className="h-2" />
										<ResizeUi
											originalDimensions={dimensionsAfterCrop}
											dimensions={newDimensions}
											thumbnailRef={videoThumbnailRef}
											rotation={userRotation}
											setResizeMode={setResizeOperation}
											requireTwoStep={Boolean(isH264Reencode)}
											crop={crop}
											cropRect={cropRect}
											dimensionsBeforeCrop={dimensionsAfterRotation}
											sourceDimensions={dimensions}
											mirrorHorizontal={flipHorizontal && mirror}
											mirrorVertical={flipVertical && mirror}
										/>
									</>
								) : null}
							</div>
						);
					}

					throw new Error('Unknown section ' + (section satisfies never));
				})}
			</div>
			<div className="h-8" />
			<Button
				className="block w-full rounded-full bg-brand text-white"
				type="button"
				disabled={disableSubmit}
				onClick={onClick}
			>
				{convertActionLabel}
			</Button>
		</>
	);
};

export default ConvertUI;
