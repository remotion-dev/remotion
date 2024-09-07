import type {MetaFunction} from '@remix-run/node';
import type {Dimensions, MediaParserVideoCodec} from '@remotion/media-parser';
import {parseMedia} from '@remotion/media-parser';
import {useCallback, useEffect, useState} from 'react';
import ConvertUI from '~/components/ConvertUi';
import {TableDemo} from '~/components/DataTable';
import {VideoPreview} from '~/components/VideoPreview';

export const meta: MetaFunction = () => {
	return [
		{title: 'New Remix App'},
		{name: 'description', content: 'Welcome to Remix!'},
	];
};

const src =
	'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const Index = () => {
	const [dimensions, setDimensions] = useState<Dimensions | null>(null);
	const [videoCodec, setVideoCodec] = useState<MediaParserVideoCodec | null>(
		null,
	);
	const [size, setSize] = useState<number | null>(null);
	const [durationInSeconds, setDurationInSeconds] = useState<number | null>(
		null,
	);

	const getStart = useCallback(() => {
		parseMedia({
			src,
			fields: {
				dimensions: true,
				videoCodec: true,
				size: true,
				durationInSeconds: true,
			},
		}).then((data) => {
			setDimensions(data.dimensions);
			setVideoCodec(data.videoCodec);
			setSize(data.size);
			setDurationInSeconds(data.durationInSeconds);
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
				/>
			</VideoPreview>
			<ConvertUI src={src} />
		</div>
	);
};

export default Index;
