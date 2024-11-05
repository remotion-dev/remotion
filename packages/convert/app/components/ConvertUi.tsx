import {Button} from '@/components/ui/button';
import {CardContent, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {convertMedia} from '@remotion/webcodecs';
import {useCallback, useState} from 'react';
import {ConvertState} from '~/lib/convert-state';
import {Badge} from './ui/badge';

export default function ConvertUI({src}: {readonly src: string}) {
	const [container, setContainer] = useState('webm');
	const [videoCodec, setVideoCodec] = useState('vp8');
	const [audioCodec, setAudioCodec] = useState('opus');
	const [state, setState] = useState<ConvertState>({type: 'idle'});

	const onClick = useCallback(() => {
		const abortController = new AbortController();

		setState(() => {
			return {
				type: 'in-progress',
				state: {
					decodedAudioFrames: 0,
					decodedVideoFrames: 0,
					encodedAudioFrames: 0,
					encodedVideoFrames: 0,
					bytesWritten: 0,
				},
				abortConversion: () => abortController.abort(),
			};
		});

		convertMedia({
			src,
			onVideoFrame: () => {
				return Promise.resolve();
			},
			onMediaStateUpdate: (s) => {
				setState({
					type: 'in-progress',
					state: s,
					abortConversion: () => {
						abortController.abort();
					},
				});
			},
			videoCodec: videoCodec as 'vp8',
			audioCodec: audioCodec as 'opus',
			to: container as 'webm',
			signal: abortController.signal,
		})
			.then(() => {
				setState({type: 'done'});
			})
			.catch((e) => {
				setState({type: 'idle'});
				if ((e as Error).stack?.toLowerCase()?.includes('aborted')) {
					return;
				}
				console.error(e);
			});

		return () => {
			abortController.abort();
		};
	}, [src, videoCodec, audioCodec, container]);

	// useEffect(() => {
	// 	if (!TEST_FAST) {
	// 		return;
	// 	}

	// 	const cancel = onClick();
	// 	return () => {
	// 		cancel();
	// 	};
	// }, [onClick]);

	const cancel = useCallback(() => {
		if (state.type !== 'in-progress') {
			throw new Error('Cannot cancel when not in progress');
		}

		state.abortConversion();
		setState({type: 'idle'});
	}, [state]);

	return (
		<div className="w-[380px]">
			<CardContent className="gap-4">
				{state.type === 'in-progress' ? (
					<>
						{JSON.stringify(state.state)}
						<Button className="block w-full" type="button" onClick={cancel}>
							Cancel
						</Button>
					</>
				) : state.type === 'done' ? (
					<Button className="block w-full" type="button">
						Done!
					</Button>
				) : (
					<>
						<div className="grid w-full items-center gap-4">
							<div className="flex flex-row">
								<CardTitle>Convert video</CardTitle>
								<div className="w-2" />
								<Badge variant="default">Alpha</Badge>
							</div>
							<div>
								<Label htmlFor="container">Container</Label>
								<Select value={container} onValueChange={setContainer}>
									<SelectTrigger id="container">
										<SelectValue placeholder="Select a container" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="webm">WebM</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="videoCodec">Video codec</Label>
								<Select value={videoCodec} onValueChange={setVideoCodec}>
									<SelectTrigger id="videoCodec">
										<SelectValue placeholder="Select a video codec" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="vp8">VP8</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="audioCodec">Audio codec</Label>
								<Select value={audioCodec} onValueChange={setAudioCodec}>
									<SelectTrigger id="audioCodec">
										<SelectValue placeholder="Select a audio codec" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="opus">Opus</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="h-4" />
						<Button className="block w-full" type="button" onClick={onClick}>
							Convert
						</Button>
					</>
				)}
			</CardContent>
		</div>
	);
}
