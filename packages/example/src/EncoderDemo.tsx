import {parseVideo, reencodeVideo} from '@remotion/browser-renderer';
import React from 'react';
import {staticFile} from 'remotion';
import {SrcEncoder} from './Encoder/SrcEncoder';

export const EncoderDemo: React.FC = () => {
	return (
		<>
			<div
				style={{
					overflowY: 'scroll',
				}}
			>
				<div>
					<input
						type="file"
						onChange={(e) => parseVideo(e.target.files?.[0] as File)}
					/>
					<input
						type="file"
						onChange={(e) => reencodeVideo(e.target.files?.[0] as File)}
					/>
				</div>
				<SrcEncoder src={staticFile('av1.webm')} />
				<SrcEncoder src={staticFile('av1.mp4')} />
				<SrcEncoder src={staticFile('mp4-mp3.mp4')} />
				<SrcEncoder src={staticFile('bigbuckbunny.mp4')} />
				<SrcEncoder src={staticFile('corrupted.mp4')} />
				<SrcEncoder src={staticFile('matroska-pcm16.mkv')} />
				<SrcEncoder src={staticFile('matroska-h265-aac.mkv')} />
				<SrcEncoder src={staticFile('matroska-mp3.mkv')} />
				<SrcEncoder src={staticFile('vid1.mp4')} />
				<SrcEncoder src={staticFile('whip.mp3')} />
				<SrcEncoder src={staticFile('sample.aac')} />
				<SrcEncoder src={staticFile('stretched-vp8.webm')} />
				<SrcEncoder src={staticFile('opus.webm')} />
				<SrcEncoder src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
			</div>
		</>
	);
};
