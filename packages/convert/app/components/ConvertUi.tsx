import {Button} from '@/components/ui/button';
import {
	LogLevel,
	MediaParserAudioCodec,
	MediaParserInternals,
	MediaParserVideoCodec,
	TracksField,
} from '@remotion/media-parser';
import {fetchReader} from '@remotion/media-parser/fetch';
import {webFileReader} from '@remotion/media-parser/web-file';
import {convertMedia, ConvertMediaContainer} from '@remotion/webcodecs';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ConvertState, Source} from '~/lib/convert-state';
import {isDroppingEverything, isReencoding} from '~/lib/is-reencoding';
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
}: {
	readonly src: Source;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly currentAudioCodec: MediaParserAudioCodec | null;
	readonly currentVideoCodec: MediaParserVideoCodec | null;
	readonly tracks: TracksField | null;
	readonly duration: number | null;
	readonly logLevel: LogLevel;
}) {
	const [container, setContainer] = useState<ConvertMediaContainer>(() =>
		getDefaultContainerForConversion(src),
	);
	const [videoConfigIndex, _setVideoConfigIndex] = useState<
		Record<number, number>
	>({});
	const [audioConfigIndex, _setAudioConfigIndex] = useState<
		Record<number, number>
	>({});
	const [state, setState] = useState<ConvertState>({type: 'idle'});
	const [name, setName] = useState<string | null>(null);
	const [flipHorizontal, setFlipHorizontal] = useState(true);
	const [flipVertical, setFlipVertical] = useState(false);
	const [enableConvert, setEnableConvert] = useState(true);
	const [enableRotateOrMirrow, setEnableRotateOrMirror] = useState<
		'rotate' | 'mirror' | null
	>(null);

	const [rotation, setRotation] = useState(90);

	const actualRotation = useMemo(() => {
		if (enableRotateOrMirrow !== 'mirror') {
			// TODO: Native rotation
			return 0;
		}

		return rotation;
	}, [enableRotateOrMirrow, rotation]);

	const supportedConfigs = useSupportedConfigs({container, tracks, logLevel});

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
					horizontal: flipHorizontal && enableRotateOrMirrow === 'mirror',
					vertical: flipVertical && enableRotateOrMirrow === 'mirror',
				});
				if (videoFrames % 15 === 0) {
					convertProgressRef.current?.draw(flipped);
				}

				videoFrames++;
				return flipped;
			},
			rotate: actualRotation,
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
			container: container as 'webm',
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

				const configIndex = audioConfigIndex[track.trackId] ?? 0;

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

				const configIndex = videoConfigIndex[track.trackId] ?? 0;

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
		actualRotation,
		container,
		flipHorizontal,
		flipVertical,
		supportedConfigs,
		audioConfigIndex,
		videoConfigIndex,
		enableRotateOrMirrow,
		logLevel,
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
	}, []);

	const onRotateClick = useCallback(() => {
		setEnableRotateOrMirror((m) => {
			if (m !== 'rotate') {
				return 'rotate';
			}
			return null;
		});
	}, []);

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
					container={container}
					done={false}
					duration={duration}
					isReencoding={
						supportedConfigs !== null &&
						isReencoding({supportedConfigs, videoConfigIndex})
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
					container={container}
					duration={duration}
					isReencoding={
						supportedConfigs !== null &&
						isReencoding({supportedConfigs, videoConfigIndex})
					}
				/>
				<div className="h-2" />
				<ConversionDone {...{container, name, setState, state, setSrc}} />
			</>
		);
	}

	const disableConvert =
		!supportedConfigs ||
		isDroppingEverything({
			audioConfigIndex,
			supportedConfigs,
			videoConfigIndex,
		});

	const canPixelManipulate =
		(supportedConfigs && isReencoding({supportedConfigs, videoConfigIndex})) ??
		false;

	return (
		<>
			<div className="w-full items-center">
				<ConvertUiSection active={enableConvert} setActive={setEnableConvert}>
					Convert
				</ConvertUiSection>
				{enableConvert ? (
					<>
						<div className="h-2" />
						<ConvertForm
							{...{
								container,
								setContainer,
								flipHorizontal,
								flipVertical,
								setFlipHorizontal,
								setFlipVertical,
								supportedConfigs,
								audioConfigIndex,
								videoConfigIndex,
								setAudioConfigIndex,
								setVideoConfigIndex,
								currentAudioCodec,
								currentVideoCodec,
							}}
						/>
					</>
				) : null}
			</div>
			<div className="h-4" />
			<ConvertUiSection
				active={enableRotateOrMirrow === 'rotate'}
				setActive={onRotateClick}
			>
				Rotate
			</ConvertUiSection>
			{enableRotateOrMirrow === 'rotate' ? (
				<RotateComponents
					canPixelManipulate={canPixelManipulate}
					rotation={rotation}
					setRotation={setRotation}
				/>
			) : null}
			<div className="h-4" />
			<ConvertUiSection
				active={enableRotateOrMirrow === 'mirror'}
				setActive={onMirrorClick}
			>
				Mirror
			</ConvertUiSection>
			{enableRotateOrMirrow === 'mirror' ? (
				<MirrorComponents
					canPixelManipulate={canPixelManipulate}
					flipHorizontal={flipHorizontal}
					flipVertical={flipVertical}
					setFlipHorizontal={setFlipHorizontal}
					setFlipVertical={setFlipVertical}
				/>
			) : null}
			<div className="h-8" />
			<Button
				className="block w-full font-brand"
				type="button"
				variant="brand"
				disabled={disableConvert}
				onClick={onClick}
			>
				Convert
			</Button>
		</>
	);
}
