import {Button} from '@/components/ui/button';
import type {
	Dimensions,
	LogLevel,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	ParseMediaContainer,
	TracksField,
} from '@remotion/media-parser';
import {MediaParserInternals} from '@remotion/media-parser';
import {fetchReader} from '@remotion/media-parser/fetch';
import {webFileReader} from '@remotion/media-parser/web-file';
import type {ConvertMediaContainer, ResizeOperation} from '@remotion/webcodecs';
import {convertMedia, WebCodecsInternals} from '@remotion/webcodecs';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {canRotateOrMirror} from '~/lib/can-rotate-or-mirror';
import type {ConvertState, Source} from '~/lib/convert-state';
import type {ConvertSections, RotateOrMirrorState} from '~/lib/default-ui';
import {getOrderOfSections, isConvertEnabledByDefault} from '~/lib/default-ui';
import {
	getActualAudioConfigIndex,
	getActualVideoOperation,
} from '~/lib/get-audio-video-config-index';
import {getInitialResizeSuggestion} from '~/lib/get-initial-resize-suggestion';
import {isReencoding} from '~/lib/is-reencoding';
import {isSubmitDisabled} from '~/lib/is-submit-enabled';
import type {RouteAction} from '~/seo';
import {ConversionDone} from './ConversionDone';
import {ConvertForm} from './ConvertForm';
import {ConvertProgress, convertProgressRef} from './ConvertProgress';
import {ConvertUiSection} from './ConvertUiSection';
import {ErrorState} from './ErrorState';
import {flipVideoFrame} from './flip-video';
import {getDefaultContainerForConversion} from './guess-codec-from-source';
import {MirrorComponents} from './MirrorComponents';
import {ResizeUi} from './ResizeUi';
import {RotateComponents} from './RotateComponents';
import {useSupportedConfigs} from './use-supported-configs';
import type {VideoThumbnailRef} from './VideoThumbnail';

export default function ConvertUI({
	src,
	currentAudioCodec,
	currentVideoCodec,
	tracks,
	setSrc,
	duration,
	logLevel,
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
}: {
	readonly src: Source;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly currentAudioCodec: MediaParserAudioCodec | null;
	readonly currentVideoCodec: MediaParserVideoCodec | null;
	readonly tracks: TracksField | null;
	readonly videoThumbnailRef: React.RefObject<VideoThumbnailRef | null>;
	readonly unrotatedDimensions: Dimensions | null;
	readonly dimensions: Dimensions | null;
	readonly duration: number | null;
	readonly rotation: number | null;
	readonly inputContainer: ParseMediaContainer | null;
	readonly logLevel: LogLevel;
	readonly action: RouteAction;
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
}) {
	const [outputContainer, setContainer] = useState<ConvertMediaContainer>(() =>
		getDefaultContainerForConversion(src, action),
	);
	const [videoOperationSelection, setVideoOperationKey] = useState<
		Record<number, string>
	>({});
	const [audioOperationSelection, setAudioOperationKey] = useState<
		Record<number, string>
	>({});
	const [state, setState] = useState<ConvertState>({type: 'idle'});
	const [name, setName] = useState<string | null>(null);
	const [enableConvert, setEnableConvert] = useState(() =>
		isConvertEnabledByDefault(action),
	);
	const [resizeOperation, setResizeOperation] =
		useState<ResizeOperation | null>(() => {
			return action.type === 'resize-format' || action.type === 'generic-resize'
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

	const supportedConfigs = useSupportedConfigs({
		outputContainer,
		tracks,
		action,
		userRotation,
		inputContainer,
		resizeOperation,
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

	const abortSignal = useRef<AbortController | null>(null);

	const onClick = useCallback(() => {
		const abortController = new AbortController();
		abortSignal.current = abortController;

		let videoFrames = 0;

		convertMedia({
			src: src.type === 'url' ? src.url : src.file,
			reader: src.type === 'file' ? webFileReader : fetchReader,
			onVideoFrame: ({frame}) => {
				const flipped = flipVideoFrame({
					frame,
					horizontal: flipHorizontal && enableRotateOrMirror === 'mirror',
					vertical: flipVertical && enableRotateOrMirror === 'mirror',
				});
				if (videoFrames % 15 === 0) {
					// TODO: Pass rotation that was applied
					convertProgressRef.current?.draw(flipped);
				}

				videoFrames++;
				return flipped;
			},
			rotate: userRotation,
			logLevel,
			onProgress: (s) => {
				setState({
					type: 'in-progress',
					state: s,
					abortConversion: () => {
						abortController.abort();
					},
				});
			},
			container: outputContainer,
			signal: abortController.signal,
			fields: {
				name: true,
			},
			onName: (n) => {
				setName(n);
			},
			onAudioTrack: ({track}) => {
				const options = supportedConfigs?.audioTrackOptions.find((trk) => {
					return trk.trackId === track.trackId;
				});
				if (!options) {
					throw new Error('Found no options for audio track');
				}

				const operation = getActualAudioConfigIndex({
					enableConvert,
					audioConfigIndexSelection: audioOperationSelection,
					trackNumber: track.trackId,
					operations: options.operations,
				});

				MediaParserInternals.Log.info(
					'info',
					`Selected operation for audio track ${track.trackId}`,
					operation,
				);

				return operation;
			},
			onVideoTrack: ({track}) => {
				const options = supportedConfigs?.videoTrackOptions.find((trk) => {
					return trk.trackId === track.trackId;
				});
				if (!options) {
					throw new Error('Found no options for video track');
				}

				const operation = getActualVideoOperation({
					enableConvert,
					videoConfigIndexSelection: videoOperationSelection,
					trackNumber: track.trackId,
					operations: options.operations,
				});

				MediaParserInternals.Log.info(
					'info',
					`Selected operation for video track ${track.trackId}`,
					operation,
				);
				return operation;
			},
			// Remotion team can see usage on https://www.remotion.pro/projects/remotiondevconvert/
			apiKey: 'rm_pub_9a996d341238eaa34e696b099968d8510420b9f6ba4aa0ee',
		})
			.then(({save, finalState}) => {
				setState({
					type: 'done',
					download: save,
					state: finalState,
				});
			})
			.catch((e) => {
				if ((e as Error).stack?.toLowerCase()?.includes('aborted')) {
					setState({type: 'idle'});
					return;
				}

				// eslint-disable-next-line no-console
				console.error(e);
				setState({type: 'error', error: e as Error});
			});

		return () => {
			abortController.abort();
		};
	}, [
		src,
		userRotation,
		logLevel,
		outputContainer,
		flipHorizontal,
		enableRotateOrMirror,
		flipVertical,
		supportedConfigs,
		enableConvert,
		audioOperationSelection,
		videoOperationSelection,
	]);

	const cancel = useCallback(() => {
		if (state.type !== 'in-progress') {
			throw new Error('Cannot cancel when not in progress');
		}

		state.abortConversion();
		setState({type: 'idle'});
	}, [state]);

	const dimissError = useCallback(() => {
		setState({type: 'idle'});
	}, []);

	useEffect(() => {
		return () => {
			if (abortSignal.current) {
				abortSignal.current.abort();
			}
		};
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
			videoCodec: isH264Reencode ? 'h264' : 'vp8',
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
					state={state.state}
					name={name}
					container={outputContainer}
					done={false}
					duration={duration}
					isReencoding={
						supportedConfigs !== null &&
						isReencoding({
							supportedConfigs,
							videoConfigIndexSelection: videoOperationSelection,
							enableConvert,
						})
					}
				/>
				<div className="h-2" />
				<Button className="block w-full" type="button" onClick={cancel}>
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
					name={name}
					container={outputContainer}
					duration={duration}
					isReencoding={
						supportedConfigs !== null &&
						isReencoding({
							supportedConfigs,
							videoConfigIndexSelection: videoOperationSelection,
							enableConvert,
						})
					}
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
}
