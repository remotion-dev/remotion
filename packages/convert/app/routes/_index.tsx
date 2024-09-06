import type {MetaFunction} from '@remix-run/node';
import {convertMedia} from '@remotion/webcodecs';
import {useCallback} from 'react';

export const meta: MetaFunction = () => {
	return [
		{title: 'New Remix App'},
		{name: 'description', content: 'Welcome to Remix!'},
	];
};

const Index = () => {
	const onClick = useCallback(async () => {
		const abortController = new AbortController();
		const fn = await convertMedia({
			src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
			onVideoFrame: () => {
				console.log('frame');
			},
			onMediaStateUpdate: (s) => {
				console.log('update', s);
			},
			videoCodec: 'vp8',
			audioCodec: 'opus',
			to: 'webm',
			signal: abortController.signal,
		});
	}, []);

	return (
		<div className="font-sans p-4">
			<h1 className="text-3xl">Welcome to Remix</h1>
			<button type="button" onClick={onClick}>
				Convert
			</button>
		</div>
	);
};

export default Index;
