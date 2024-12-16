import {Button} from '@/components/ui/button';
import {
	LogLevel,
	MediaParserAudioCodec,
	MediaParserInternals,
	MediaParserVideoCodec,
	ParseMediaContainer,
	TracksField,
} from '@remotion/media-parser';
import {fetchReader} from '@remotion/media-parser/fetch';
import {webFileReader} from '@remotion/media-parser/web-file';
import {convertMedia, ConvertMediaContainer} from '@remotion/webcodecs';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {canRotateOrMirror} from '~/lib/can-rotate-or-mirror';
import {ConvertState, Source} from '~/lib/convert-state';
import {
	ConvertSections,
	getOrderOfSections,
	isConvertEnabledByDefault,
	RotateOrMirrorState,
} from '~/lib/default-ui';
import {
	getActualAudioConfigIndex,
	getActualVideoConfigIndex,
} from '~/lib/get-audio-video-config-index';
import {isReencoding} from '~/lib/is-reencoding';
import {isSubmitDisabled} from '~/lib/is-submit-enabled';
import {RouteAction} from '~/seo';
import {ConversionDone} from './ConversionDone';
import {ConvertForm} from './ConvertForm';
import {ConvertProgress, convertProgressRef} from './ConvertProgress';
import {ConvertUiSection} from './ConvertUiSection';
import {ErrorState} from './ErrorState';
import {flipVideoFrame} from './flip-video';
import {getDefaultContainerForConversion} from './guess-codec-from-source';
import {MirrorComponents} from './MirrorComponents';
import {RotateComponents} from './RotateComponents';
import {useSupportedConfigs} from './use-supported-configs';

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
}: {
	readonly src: Source;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly currentAudioCodec: MediaParserAudioCodec | null;
	readonly currentVideoCodec: MediaParserVideoCodec | null;
	readonly tracks: TracksField | null;
	readonly duration: number | null;
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
	const [videoConfigIndexSelection, _setVideoConfigIndex] = useState<
		Record<number, number>
	>({});
	const [audioConfigIndexSelection, _setAudioConfigIndex] = useState<
		Record<number, number>
	>({});
	const [state, setState] = useState<ConvertState>({type: 'idle'});
	const [name, setName] = useState<string | null>(null);
	const [enableConvert, setEnableConvert] = useState(() =>
		isConvertEnabledByDefault(action),
	);

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
	});

	const setVideoConfigIndex = useCallback((trackId: number, i: number) => {
		_setVideoConfigIndex((prev) => ({
			...prev,
			[trackId]: i,
		}));
	}, []);

	const setAudioConfigIndex = useCallback((trackId: number, i: number) => {
		_setAudioConfigIndex((prev) => ({
			...prev,
			[trackId]: i,
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

				const configIndex = getActualAudioConfigIndex({
					enableConvert,
					audioConfigIndexSelection,
					trackNumber: track.trackId,
				});

				const operation = options.operations[configIndex ?? 0];
				if (!operation) {
					throw new Error('Found no operation');
				}

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

				const configIndex = getActualVideoConfigIndex({
					enableConvert,
					videoConfigIndexSelection,
					trackNumber: track.trackId,
				});

				const operation = options.operations[configIndex ?? 0];
				if (!operation) {
					throw new Error('Found no operation');
				}
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
		audioConfigIndexSelection,
		videoConfigIndexSelection,
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
							videoConfigIndexSelection,
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
							videoConfigIndexSelection,
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
		audioConfigIndexSelection,
		supportedConfigs,
		videoConfigIndexSelection,
		enableConvert,
		enableRotateOrMirror,
	});

	const canPixelManipulate = canRotateOrMirror({
		supportedConfigs,
		videoConfigIndexSelection,
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
												audioConfigIndexSelection,
												videoConfigIndexSelection,
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

					throw new Error('Unknown section');
				})}
			</div>
			<div className="h-8" />
			<Button
				className="block w-full font-brand"
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
