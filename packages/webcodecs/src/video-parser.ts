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
			return (chunk) => {
				videoDecoder.decode(new EncodedVideoChunk(chunk));
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

			audioDecoder.configure({
				codec: track.codec,
				sampleRate: track.sampleRate,
				numberOfChannels: track.numberOfChannels,
				description: track.description,
			});
			console.log('audio track', track);
			return (audioSample) => {
				audioDecoder.decode(new EncodedAudioChunk(audioSample));
			};
		},
	});
};
