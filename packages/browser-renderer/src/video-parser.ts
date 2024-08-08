import {parseMedia} from '@remotion/media-parser';
import {webFileReader} from '@remotion/media-parser/web-file';
import {createDecoder} from './create-decoder';

export const parseVideo = async (file: File) => {
	const {dimensions, videoTracks} = await parseMedia({
		src: file,
		readerInterface: webFileReader,
		fields: {
			dimensions: true,
			tracks: true,
		},
	});

	const firstVideoTrack = videoTracks[0];

	const {decoder} = createDecoder({
		onFrame: (frame) => {
			console.log('frame', frame);
		},
		onProgress: (decoded) => {
			console.log('progress', decoded);
		},
	});

	if (!firstVideoTrack) {
		throw new Error('No video track found');
	}

	// TODO: Once matroska is supported, make description not nullable
	if (!firstVideoTrack.description) {
		throw new Error('No video description found');
	}

	decoder.configure({
		codec: 'avc1.640020',
		codedHeight: dimensions.height,
		codedWidth: dimensions.width,
		hardwareAcceleration: 'prefer-hardware',
		description: firstVideoTrack.description,
	});

	const result = await parseMedia({
		src: file,
		readerInterface: webFileReader,
		fields: {
			durationInSeconds: true,
		},
		onVideoSample: (video) => {
			const chunk = new EncodedVideoChunk({
				type: video.type,
				timestamp: video.timestamp,
				duration: video.duration,
				data: video.bytes,
			});

			decoder.decode(chunk);

			console.log('video sample', video);
		},
	});
	console.log(result);
};
