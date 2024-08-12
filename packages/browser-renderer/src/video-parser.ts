import {parseMedia} from '@remotion/media-parser';
import {webFileReader} from '@remotion/media-parser/web-file';
import {createDecoder} from './create-decoder';

export const parseVideo = async (file: File) => {
	const {decoder} = createDecoder({
		onFrame: (frame) => {
			console.log('frame', frame);
		},
		onProgress: (decoded) => {
			console.log('progress', decoded);
		},
	});

	await parseMedia({
		src: file,
		reader: webFileReader,
		fields: {},
		onVideoTrack: (track) => {
			decoder.configure({
				codec: track.codecString,
				codedHeight: track.height,
				codedWidth: track.width,
				hardwareAcceleration: 'no-preference',
			});
			return (videoSample) => {
				const chunk = new EncodedVideoChunk({
					type: videoSample.type,
					timestamp: videoSample.timestamp,
					duration: undefined,
					data: videoSample.bytes,
				});

				decoder.decode(chunk);
			};
		},
	});
};
