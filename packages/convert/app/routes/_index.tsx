import type {MetaFunction} from '@remix-run/node';
import {convertMedia} from '@remotion/webcodecs';
import {useCallback, useState} from 'react';
import {VideoPreview} from '~/components/VideoPreview';
import {Button} from '~/components/ui/button';

export const meta: MetaFunction = () => {
	return [
		{title: 'New Remix App'},
		{name: 'description', content: 'Welcome to Remix!'},
	];
};

const Index = () => {
	const [abortController, setAbortController] = useState<AbortController>(
		() => new AbortController(),
	);

	const onClick = useCallback(async () => {
		const fn = await convertMedia({
			src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
			onVideoFrame: () => {
				console.log('frame');
				return Promise.resolve();
			},
			onMediaStateUpdate: (s) => {
				console.log('update', s);
			},
			videoCodec: 'vp8',
			audioCodec: 'opus',
			to: 'webm',
			signal: abortController.signal,
		});
	}, [abortController.signal]);

	const onAbort = useCallback(() => {
		abortController.abort();
	}, [abortController]);

	return (
		<div className="font-sans p-4 flex justify-center items-center h-screen">
			<Button type="button" onClick={onClick}>
				Convert
			</Button>
			<Button type="button" onClick={onAbort}>
				Abort
			</Button>
			<VideoPreview />
		</div>
	);
};

export default Index;
