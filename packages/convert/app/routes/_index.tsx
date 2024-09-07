import type {MetaFunction} from '@remix-run/node';
import type {
	Dimensions,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
} from '@remotion/media-parser';
import {parseMedia} from '@remotion/media-parser';
import {useCallback, useEffect, useState} from 'react';
import ConvertUI from '~/components/ConvertUi';
import {TableDemo} from '~/components/DataTable';
import {VideoPreview} from '~/components/VideoPreview';

export const meta: MetaFunction = () => {
	return [
		{title: 'Remotion Convert'},
		{name: 'description', content: 'Fast video conersion in the browser.'},
	];
};

const src =
	'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const Index = () => {
	const [dimensions, setDimensions] = useState<Dimensions | null>(null);
	const [videoCodec, setVideoCodec] = useState<MediaParserVideoCodec | null>(
		null,
	);
	const [audioCodec, setAudioCodec] = useState<MediaParserAudioCodec | null>(
		null,
	);
	const [size, setSize] = useState<number | null>(null);
	const [durationInSeconds, setDurationInSeconds] = useState<number | null>(
		null,
	);
	const [fps, setFps] = useState<number | null>(null);

	const getStart = useCallback(() => {
		parseMedia({
			src,
			fields: {
				dimensions: true,
				videoCodec: true,
				size: true,
				durationInSeconds: true,
				audioCodec: true,
				fps: true,
			},
		}).then((data) => {
			setDimensions(data.dimensions);
			setVideoCodec(data.videoCodec);
			setAudioCodec(data.audioCodec);
			setSize(data.size);
			setDurationInSeconds(data.durationInSeconds);
			setFps(data.fps);
		});
	}, []);

	useEffect(() => {
		getStart();
	}, [getStart]);

	return (
		<div className="font-sans p-4 flex justify-center items-center h-screen bg-slate-50 gap-16">
			<VideoPreview>
				<TableDemo
					container="MP4"
					dimensions={dimensions}
					videoCodec={videoCodec}
					size={size}
					durationInSeconds={durationInSeconds}
					audioCodec={audioCodec}
					fps={fps}
				/>
			</VideoPreview>
			<ConvertUI src={src} />
		</div>
	);
};

export default Index;
