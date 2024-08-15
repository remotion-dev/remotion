import React from 'react';
import {staticFile} from 'remotion';
import {SrcEncoder} from './Encoder/SrcEncoder';

export const EncoderDemo: React.FC = () => {
	return (
		<>
			<div style={{}}>
				<SrcEncoder label="av1-in-webm.webm" src={staticFile('av1.webm')} />
				<SrcEncoder label="av1-in-mp4.mp4" src={staticFile('av1.mp4')} />
				<SrcEncoder label="mp4-with-mp3.mp4" src={staticFile('mp4-mp3.mp4')} />
				<SrcEncoder
					label="bigbuckbunny.mp4"
					src={staticFile('bigbuckbunny.mp4')}
				/>
				<SrcEncoder
					label="corrupted-timestamps.mp4"
					src={staticFile('corrupted.mp4')}
				/>
				<SrcEncoder
					label="lossless-audio.mkv"
					src={staticFile('matroska-pcm16.mkv')}
				/>
				<SrcEncoder
					label="h265-with-aac.mkv"
					src={staticFile('matroska-h265-aac.mkv')}
				/>
				<SrcEncoder
					label="mp3-in-mkv.mkv"
					src={staticFile('matroska-mp3.mkv')}
				/>
				<SrcEncoder label="vid1.mp4" src={staticFile('vid1.mp4')} />
				<SrcEncoder
					label="hevc-with-rotation.mov"
					src={staticFile('iphone-hevc.mov')}
				/>
				<SrcEncoder
					label="vp8-with-stretch.webm"
					src={staticFile('stretched-vp8.webm')}
				/>
				<SrcEncoder label="opus-audio.webm" src={staticFile('opus.webm')} />
				<SrcEncoder
					label="https://remotion.dev/bbb.mp4"
					src="https://remotion.dev/bbb.mp4"
				/>
			</div>
		</>
	);
};
