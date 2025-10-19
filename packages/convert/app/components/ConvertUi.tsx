import {Button} from '@/components/ui/button';
import type {
	MediaParserAudioCodec,
	MediaParserContainer,
	MediaParserDimensions,
	MediaParserTrack,
} from '@remotion/media-parser';
import type {InputVideoTrack, Rotation} from 'mediabunny';
import {
	ALL_FORMATS,
	BlobSource,
	Conversion,
	Input,
	Output,
	StreamTarget,
	UrlSource,
} from 'mediabunny';
import React, {useCallback, useMemo, useState} from 'react';
import {canRotateOrMirror} from '~/lib/can-rotate-or-mirror';
import type {ConvertState, Source} from '~/lib/convert-state';
import type {ConvertSections, RotateOrMirrorState} from '~/lib/default-ui';
import {getOrderOfSections, isConvertEnabledByDefault} from '~/lib/default-ui';
import {getActualVideoOperation} from '~/lib/get-audio-video-config-index';
import {getInitialResizeSuggestion} from '~/lib/get-initial-resize-suggestion';
import {isReencoding} from '~/lib/is-reencoding';
import {isSubmitDisabled} from '~/lib/is-submit-enabled';
import {generateOutputFilename} from '~/lib/make-output-filename';
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
import {getDefaultContainerForConversion} from './guess-codec-from-source';
import {MirrorComponents} from './MirrorComponents';
import {PauseResumeAndCancel} from './PauseResumeAndCancel';
import {ResampleUi} from './ResampleUi';
import {ResizeUi} from './ResizeUi';
import {RotateComponents} from './RotateComponents';
import {useSupportedConfigs} from './use-supported-configs';
import type {VideoThumbnailRef} from './VideoThumbnail';

const ConvertUI = ({
	src,
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
	unrotatedDimensions,
	videoThumbnailRef,
	rotation,
	dimensions,
	sampleRate,
	name,
}: {
	readonly src: Source;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly currentAudioCodec: MediaParserAudioCodec | null;
	readonly currentVideoCodec: InputVideoTrack['codec'] | null;
	readonly tracks: MediaParserTrack[] | null;
	readonly videoThumbnailRef: React.RefObject<VideoThumbnailRef | null>;
	readonly unrotatedDimensions: MediaParserDimensions | null;
	readonly dimensions: MediaParserDimensions | null | undefined;
	readonly durationInSeconds: number | null;
	readonly fps: number | null;
	readonly rotation: number | null;
	readonly inputContainer: MediaParserContainer | null;
	readonly action: RouteAction;
	readonly name: string | null;
	readonly enableRotateOrMirror: RotateOrMirrorState;
	readonly setEnableRotateOrMirror: React.Dispatch<
		React.SetStateAction<RotateOrMirrorState | null>
	>;
	readonly userRotation: number;
	readonly setRotation: React.Dispatch<React.SetStateAction<number>>;
	readonly flipHorizontal: boolean;
	readonly flipVertical: boolean;
	readonly setFlipHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
	readonly setFlipVertical: React.Dispatch<React.SetStateAction<boolean>>;
	readonly sampleRate: number | null;
}) => {
	const [outputContainer, setContainer] = useState<OutputContainer>(() =>
		getDefaultContainerForConversion(src, action),
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

	const canResample = useMemo(() => {
		return outputContainer === 'wav';
	}, [outputContainer]);

	const actualResampleRate = useMemo(() => {
		if (!canResample) {
			return null;
		}

		if (!resampleUserPreferenceActive) {
			return null;
		}

		return resampleRate;
	}, [resampleRate, canResample, resampleUserPreferenceActive]);

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
		return operation.type === 'reencode' && operation.videoCodec === 'h264';
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
		};

		const waveform = makeWaveformVisualizer({
			onWaveformBars,
		});

		const input = new Input({
			formats: ALL_FORMATS,
			source:
				src.type === 'file' ? new BlobSource(src.file) : new UrlSource(src.url),
		});

		let cancelConversion = () => {};

		const run = async () => {
			const filename = generateOutputFilename(src, outputContainer);
			const {getBlob, stream, getWrittenByteCount, close} =
				await makeWebFsTarget(filename);

			const output = new Output({
				format: getMediabunnyOutput(outputContainer),
				target: new StreamTarget(stream),
			});

			const duration = await input.computeDuration();
			waveform.setDuration(duration);

			let videoFrames = 0;

			const startTime = Date.now();

			const conversion = await Conversion.init({
				input,
				output,
				video: (videoTrack, n) => {
					if (n > 1) {
						// TODO: Discard any other than first video tracks?
						// Keep only the first video track
						return {discard: true};
					}

					return {
						height: Math.min(videoTrack.displayHeight, 1080),
						process(sample) {
							const flipped = flipVideoFrame({
								frame: sample.toVideoFrame(),
								horizontal: flipHorizontal && enableRotateOrMirror === 'mirror',
								vertical: flipVertical && enableRotateOrMirror === 'mirror',
							});
							if (videoFrames % 15 === 0) {
								convertProgressRef.current?.draw(flipped);
							}

							progress.millisecondsWritten = sample.timestamp * 1000;

							videoFrames++;
							return flipped;
						},
						rotate: userRotation as Rotation,
						...calculateMediabunnyResizeOption(
							resizeOperation,
							dimensions ?? null,
						),
						// TODO: Support discard
						// TODO: Support force transcode
					};
				},
				audio: {
					process(sample) {
						// TODO: Only do this if it is an audio-only conversion
						waveform.add(sample.toAudioBuffer());

						return sample;
					},
				},
			});

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
			});
		};

		run();

		return () => {
			cancelConversion();
		};
	}, [
		enableRotateOrMirror,
		flipHorizontal,
		flipVertical,
		dimensions,
		resizeOperation,
		onWaveformBars,
		outputContainer,
		src,
		userRotation,
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

	const onResizeClick = useCallback(() => {
		setResizeOperation((r) => {
			if (r !== null || !dimensions) {
				return null;
			}

			return getInitialResizeSuggestion(dimensions);
		});
	}, [dimensions]);

	const newDimensions = useMemo(() => {
		if (unrotatedDimensions === null) {
			return null;
		}

		return WebCodecsInternals.calculateNewDimensionsFromDimensions({
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

	const isAudioExclusively = useMemo(() => {
		return (tracks?.filter((t) => t.type === 'video').length ?? 0) === 0;
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
					name={name}
					container={outputContainer}
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
					isAudioOnly={isAudioExclusively}
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
					state={state.state}
					name={name}
					container={outputContainer}
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
					isAudioOnly={isAudioExclusively}
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
												setContainer,
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
						if (isAudioExclusively) {
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
						if (isAudioExclusively) {
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

					if (section === 'resize') {
						if (isAudioExclusively) {
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
								unrotatedDimensions !== null ? (
									<>
										<div className="h-2" />
										<ResizeUi
											originalDimensions={unrotatedDimensions}
											dimensions={newDimensions}
											thumbnailRef={videoThumbnailRef}
											rotation={userRotation - (rotation ?? 0)}
											setResizeMode={setResizeOperation}
											requireTwoStep={Boolean(isH264Reencode)}
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
