import {parseMedia} from '@remotion/media-parser';
import {webFileReader} from '@remotion/media-parser/web-file';
import {createDecoder} from './create-decoder';

export const parseVideo = async (file: File) => {
	const {dimensions} = await parseMedia({
		src: file,
		reader: webFileReader,
		fields: {
			dimensions: true,
			tracks: true,
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

	const result = await parseMedia({
		src: file,
		reader: webFileReader,
		fields: {
			durationInSeconds: true,
		},
		onVideoTrack: (track) => {
			decoder.configure({
				codec: track.codecString,
				codedHeight: dimensions.height,
				codedWidth: dimensions.width,
				hardwareAcceleration: 'prefer-hardware',
				description: track.description ?? undefined,
			});
			return (videoSample) => {
				const chunk = new EncodedVideoChunk({
					type: videoSample.type,
					timestamp: videoSample.timestamp,
					duration: videoSample.duration,
					data: videoSample.bytes,
				});

				decoder.decode(chunk);
			};
		},
	});
	console.log(result);
};
