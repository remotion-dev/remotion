import {parseMedia} from '@remotion/media-parser';
import {webFileReader} from '@remotion/media-parser/web-file';

export const parseVideo = async (file: File) => {
	const result = await parseMedia({
		src: file,
		readerInterface: webFileReader,
		fields: {
			durationInSeconds: true,
		},
		onVideoSample: (video) => {
			console.log('video sample', video);
		},
		onAudioSample: (audio) => {
			console.log('audio sample', audio);
		},
	});
	console.log(result);
};
