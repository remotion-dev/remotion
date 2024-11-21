import {Button} from '@/components/ui/button';
import {CardTitle} from '@/components/ui/card';
import {
	MediaParserAudioCodec,
	MediaParserInternals,
	MediaParserVideoCodec,
	TracksField,
} from '@remotion/media-parser';
import {fetchReader} from '@remotion/media-parser/fetch';
import {webFileReader} from '@remotion/media-parser/web-file';
import {convertMedia, ConvertMediaContainer} from '@remotion/webcodecs';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ConvertState, Source} from '~/lib/convert-state';
import {ConversionDone} from './ConversionDone';
import {ConvertForm} from './ConvertForm';
import {ConvertProgress, convertProgressRef} from './ConvertProgress';
import {ErrorState} from './ErrorState';
import {flipVideoFrame} from './flip-video';
import {getDefaultContainerForConversion} from './guess-codec-from-source';
import {Badge} from './ui/badge';
import {useSupportedConfigs} from './use-supported-configs';

export default function ConvertUI({
	src,
	currentAudioCodec,
	currentVideoCodec,
	tracks,
	setSrc,
	duration,
}: {
	readonly src: Source;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly currentAudioCodec: MediaParserAudioCodec | null;
	readonly currentVideoCodec: MediaParserVideoCodec | null;
	readonly tracks: TracksField | null;
	readonly duration: number | null;
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
	const [flipHorizontal, setFlipHorizontal] = useState(false);
	const [flipVertical, setFlipVertical] = useState(false);

	const supportedConfigs = useSupportedConfigs({container, tracks});

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
					horizontal: flipHorizontal,
					vertical: flipVertical,
				});
				if (videoFrames % 15 === 0) {
					convertProgressRef.current?.draw(flipped);
				}

				videoFrames++;
				return flipped;
			},
			logLevel: 'verbose',
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
		container,
		flipHorizontal,
		flipVertical,
		supportedConfigs,
		audioConfigIndex,
		videoConfigIndex,
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
				/>
				<div className="h-2" />
				<ConversionDone {...{container, name, setState, state, setSrc}} />
			</>
		);
	}

	const disableConvert =
		supportedConfigs?.audioTrackOptions.every(
			(o) => o.operations[audioConfigIndex[o.trackId] ?? 0].type === 'drop',
		) &&
		supportedConfigs?.videoTrackOptions.every(
			(o) => o.operations[videoConfigIndex[o.trackId] ?? 0].type === 'drop',
		);

	return (
		<>
			<div className="w-full items-center">
				<div className="flex flex-row">
					<CardTitle>Convert video</CardTitle>
					<div className="w-2" />
					<Badge variant="default">Alpha</Badge>
				</div>
				<div className="h-6" />
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
			</div>
			<div className="h-4" />
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
