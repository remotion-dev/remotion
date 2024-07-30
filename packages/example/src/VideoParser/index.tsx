import {parseMedia} from '@remotion/video-parser';
import {useEffect} from 'react';

export const VideoParser: React.FC = () => {
	useEffect(() => {
		const start = Date.now();
		parseMedia(
			'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
			{
				durationInSeconds: true,
			},
		).then(({durationInSeconds}) => {
			console.log(
				'@remotion/video-parser',
				durationInSeconds,
				'in ',
				Date.now() - start,
				'ms',
			);
		});
		/*
		GetVideoMetadata(
			'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
		).then(({durationInSeconds}) => {
			console.log(
				'getVideoMetadata',
				durationInSeconds,
				'in ',
				Date.now() - start,
				'ms',
			);
		});
		*/
	}, []);

	return <div>VideoParser</div>;
};
