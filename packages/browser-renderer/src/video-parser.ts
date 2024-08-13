import {parseMedia} from '@remotion/media-parser';
import {webFileReader} from '@remotion/media-parser/web-file';

export const parseVideo = async (file: File) => {
	const videoDecoder = new VideoDecoder({
		output(inputFrame) {
			console.log('frame', inputFrame);
			inputFrame.close();
		},
		error(error) {
			console.error(error);
		},
	});

	const audioDecoder = new AudioDecoder({
		output(inputFrame) {
			console.log('audio frame', inputFrame);
			inputFrame.close();
		},
		error(error) {
			console.error(error);
		},
	});
	console.log(audioDecoder);

	await parseMedia({
		src: file,
		reader: webFileReader,
		onVideoTrack: (track) => {
			console.log(track);
			videoDecoder.configure({
				codec: track.codecString,
				codedHeight: track.height,
				codedWidth: track.width,
				hardwareAcceleration: 'no-preference',
				description: track.description ?? undefined,
			});
			return (videoSample) => {
				const chunk = new EncodedVideoChunk({
					type: videoSample.type,
					timestamp: videoSample.timestamp,
					// TODO: Must it really be undefined?
					duration: undefined,
					data: videoSample.bytes,
				});

				videoDecoder.decode(chunk);
			};
		},
		onAudioTrack: (track) => {
			console.log('audio track', track);
			return (audioSample) => {
				console.log('audio sample', audioSample);
			};
		},
	});
};
