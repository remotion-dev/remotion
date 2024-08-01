import {parseMedia} from '@remotion/media-parser';
import {getVideoMetadata} from '@remotion/media-utils';
import {useEffect} from 'react';
import {staticFile} from 'remotion';

const src = staticFile('blush-2x.mp4');

export const VideoParser: React.FC = () => {
	useEffect(() => {
		const start = Date.now();
		parseMedia(src, {
			durationInSeconds: true,
			dimensions: true,
		}).then(({durationInSeconds, dimensions}) => {
			console.log(
				'@remotion/media-parser',
				durationInSeconds,
				dimensions,
				'in ',
				Date.now() - start,
				'ms',
			);
		});

		getVideoMetadata(src).then(({durationInSeconds}) => {
			console.log(
				'getVideoMetadata',
				durationInSeconds,
				'in ',
				Date.now() - start,
				'ms',
			);
		});
	}, []);

	return <div>VideoParser</div>;
};
