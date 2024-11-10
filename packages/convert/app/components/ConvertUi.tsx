import {Button} from '@/components/ui/button';
import {CardTitle} from '@/components/ui/card';
import {fetchReader} from '@remotion/media-parser/fetch';
import {webFileReader} from '@remotion/media-parser/web-file';
import {
	convertMedia,
	ConvertMediaAudioCodec,
	ConvertMediaContainer,
	ConvertMediaVideoCodec,
} from '@remotion/webcodecs';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ConvertState, Source} from '~/lib/convert-state';
import {getNewName} from '~/lib/generate-new-name';
import {ConvertForm} from './ConvertForm';
import {ConvertProgress, convertProgressRef} from './ConvertProgress';
import {ErrorState} from './ErrorState';
import {flipVideoFrame} from './flip-video';
import {Badge} from './ui/badge';

export default function ConvertUI({src}: {readonly src: Source}) {
	const [container, setContainer] = useState<ConvertMediaContainer>('webm');
	const [videoCodec, setVideoCodec] = useState<ConvertMediaVideoCodec>('vp8');
	const [audioCodec, setAudioCodec] = useState<ConvertMediaAudioCodec>('opus');
	const [state, setState] = useState<ConvertState>({type: 'idle'});
	const [name, setName] = useState<string | null>(null);
	const [flipHorizontal, setFlipHorizontal] = useState(false);
	const [flipVertical, setFlipVertical] = useState(false);

	const abortSignal = useRef<AbortController | null>(null);

	const onClick = useCallback(() => {
		const abortController = new AbortController();
		abortSignal.current = abortController;

		let _n: string | null = null;

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
			onMediaStateUpdate: (s) => {
				setState({
					type: 'in-progress',
					state: s,
					abortConversion: () => {
						abortController.abort();
					},
				});
			},
			videoCodec,
			audioCodec,
			container: container as 'webm',
			signal: abortController.signal,
			fields: {
				name: true,
			},
			onName: (n) => {
				_n = n;
				setName(n);
			},
		})
			.then(({save}) => {
				// TODO: When to remove?
				setState((prevState) => {
					if (prevState.type !== 'in-progress') {
						throw new Error('Invalid state transition');
					}
					return {
						type: 'done',
						download: async () => {
							if (!_n) {
								throw new Error('No name');
							}

							const file = await save();
							const a = document.createElement('a');
							a.href = URL.createObjectURL(file);
							a.download = getNewName(_n!, container);
							a.click();
							URL.revokeObjectURL(a.href);
						},
						state: prevState.state,
					};
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
	}, [src, videoCodec, audioCodec, container, flipHorizontal, flipVertical]);

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

	const onDownload = useCallback(async () => {
		if (state.type !== 'done') {
			throw new Error('Cannot download when not done');
		}

		try {
			await state.download();
		} catch (e) {
			console.error(e);
			setState({type: 'error', error: e as Error});
		}
	}, [state]);

	useEffect(() => {
		return () => {
			if (abortSignal.current) {
				abortSignal.current.abort();
			}
		};
	}, []);

	return (
		<div className="w-full lg:w-[350px]">
			<div className="gap-4">
				{state.type === 'error' ? (
					<>
						<ErrorState error={state.error} />
						<div className="h-4" />
						<Button
							className="block w-full"
							type="button"
							onClick={dimissError}
						>
							Dismiss
						</Button>
					</>
				) : state.type === 'in-progress' ? (
					<>
						<ConvertProgress
							state={state.state}
							name={name}
							container={container}
						/>
						<div className="h-2" />
						<Button className="block w-full" type="button" onClick={cancel}>
							Cancel
						</Button>
					</>
				) : state.type === 'done' ? (
					<>
						<ConvertProgress
							state={state.state}
							name={name}
							container={container}
						/>
						<div className="h-2" />
						<Button className="block w-full" type="button" onClick={onDownload}>
							Download
						</Button>
					</>
				) : (
					<>
						<div className=" w-full items-center">
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
									setVideoCodec,
									videoCodec,
									audioCodec,
									setAudioCodec,
									flipHorizontal,
									flipVertical,
									setFlipHorizontal,
									setFlipVertical,
								}}
							/>
						</div>
						<div className="h-4" />
						<Button
							className="block w-full font-brand"
							type="button"
							variant="brand"
							onClick={onClick}
						>
							Convert
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
