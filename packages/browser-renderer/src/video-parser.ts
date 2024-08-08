import {parseMedia} from '@remotion/media-parser';
import {webFileReader} from '@remotion/media-parser/web-file';
import {createDecoder} from './create-decoder';

export const parseVideo = async (file: File) => {
	const {dimensions} = await parseMedia({
		src: file,
		readerInterface: webFileReader,
		fields: {
			dimensions: true,
		},
	});

	const {decoder} = createDecoder({
		onFrame: (frame) => {
			console.log('frame', frame);
		},
		onProgress: (decoded) => {
			console.log('progress', decoded);
		},
	});

	decoder.configure({
		codec: 'avc1.640020',
		codedHeight: dimensions.height,
		codedWidth: dimensions.width,
		hardwareAcceleration: 'prefer-hardware',
	});

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
