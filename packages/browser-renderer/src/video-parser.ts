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

	await parseMedia({
		src: file,
		reader: webFileReader,
		onVideoTrack: (track) => {
			videoDecoder.configure({
				...track,
				hardwareAcceleration: 'no-preference',
			});
			return (videoSample) => {
				const chunk = new EncodedVideoChunk({
					type: videoSample.type,
					timestamp: videoSample.timestamp,
					// TODO: Must it really be undefined?
					duration: undefined,
					data: videoSample.data,
				});

				videoDecoder.decode(chunk);
			};
		},
		onAudioTrack: (track) => {
			const audioDecoder = new AudioDecoder({
				output(inputFrame) {
					console.log('audio frame', inputFrame);
					inputFrame.close();
				},
				error(error) {
					console.error(error);
				},
			});
			audioDecoder.configure(track);
			console.log('audio track', track);
			return (audioSample) => {
				console.log('audio sample', audioSample);
			};
		},
	});
};
