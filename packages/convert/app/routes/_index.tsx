import type {MetaFunction} from '@remix-run/node';
import type {Dimensions, MediaParserVideoCodec} from '@remotion/media-parser';
import {parseMedia} from '@remotion/media-parser';
import {convertMedia} from '@remotion/webcodecs';
import {useCallback, useEffect, useState} from 'react';
import {TableDemo} from '~/components/DataTable';
import {VideoPreview} from '~/components/VideoPreview';
import {Button} from '~/components/ui/button';

export const meta: MetaFunction = () => {
	return [
		{title: 'New Remix App'},
		{name: 'description', content: 'Welcome to Remix!'},
	];
};

const src =
	'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const Index = () => {
	const [abortController, setAbortController] = useState<AbortController>(
		() => new AbortController(),
	);

	const onClick = useCallback(async () => {
		const fn = await convertMedia({
			src,
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

	const [dimensions, setDimensions] = useState<Dimensions | null>(null);
	const [videoCodec, setVideoCodec] = useState<MediaParserVideoCodec | null>(
		null,
	);

	const getStart = useCallback(() => {
		parseMedia({
			src,
			fields: {
				dimensions: true,
				videoCodec: true,
			},
		}).then((data) => {
			setDimensions(data.dimensions);
			setVideoCodec(data.videoCodec);
		});
	}, []);

	useEffect(() => {
		getStart();
	}, [getStart]);

	return (
		<div className="font-sans p-4 flex justify-center items-center h-screen">
			<Button type="button" onClick={onClick}>
				Convert
			</Button>
			<Button type="button" onClick={onAbort}>
				Abort
			</Button>
			<VideoPreview>
				<TableDemo
					container="MP4"
					dimensions={dimensions}
					videoCodec={videoCodec}
				/>
			</VideoPreview>
		</div>
	);
};

export default Index;
