import {parseMedia} from '@remotion/media-parser';
import React, {useCallback} from 'react';
import {flushSync} from 'react-dom';

export const SrcEncoder: React.FC<{
	src: string;
}> = ({src}) => {
	const [samples, setSamples] = React.useState<number>(0);
	const [videoFrames, setVideoFrames] = React.useState<number>(0);
	const [audioFrames, setAudioFrames] = React.useState<number>(0);

	const onClick = useCallback(() => {
		console.log('parseMedia');
		parseMedia({
			src,
			onVideoTrack: (track) => {
				const videoDecoder = new VideoDecoder({
					output(inputFrame) {
						flushSync(() => {
							setVideoFrames((prev) => prev + 1);
						});
						inputFrame.close();
					},
					error(error) {
						console.error(error);
					},
				});
				videoDecoder.configure(track);
				return (chunk) => {
					flushSync(() => {
						setSamples((s) => s + 1);
					});
					console.log(videoDecoder);
					videoDecoder.decode(new EncodedVideoChunk(chunk));
				};
			},
			onAudioTrack: (track) => {
				console.log(track);
				if (typeof AudioDecoder === 'undefined') {
					return null;
				}
				const audioDecoder = new AudioDecoder({
					output(inputFrame) {
						flushSync(() => {
							setAudioFrames((prev) => prev + 1);
						});
						inputFrame.close();
					},
					error(error) {
						console.error(error);
					},
				});

				audioDecoder.configure(track);

				return (audioSample) => {
					flushSync(() => {
						setSamples((s) => s + 1);
					});
					audioDecoder.decode(new EncodedAudioChunk(audioSample));
				};
			},
		});
	}, [src]);

	return (
		<div>
			{src}{' '}
			<button type="button" onClick={onClick}>
				Decode
			</button>
			{samples > 0 && <div>{samples} samples</div>}
			{videoFrames > 0 && <div>{videoFrames} video frames</div>}
			{audioFrames > 0 && <div>{audioFrames} audio frames</div>}
		</div>
	);
};
