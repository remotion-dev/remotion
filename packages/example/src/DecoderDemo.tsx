import React, {useEffect, useState} from 'react';
import {staticFile} from 'remotion';
import {SrcEncoder} from './Encoder/SrcEncoder';

export const DecoderDemo: React.FC = () => {
	const [blob, setBlob] = useState<string | null>(null);

	useEffect(() => {
		fetch(staticFile('iphone-hevc.mov'))
			.then((res) => res.blob())
			.then((buffer) => URL.createObjectURL(buffer))
			.then((url) => setBlob(url));
	}, []);

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
					label="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
					src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
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
					label="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm"
					src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm"
				/>
				<SrcEncoder
					label="vp8-with-stretch.webm"
					src={staticFile('stretched-vp8.webm')}
				/>
				<SrcEncoder
					label="vp8-vorbis.webm"
					src={staticFile('vp8-vorbis.webm')}
				/>
				<SrcEncoder label="opus-audio.webm" src={staticFile('opus.webm')} />
				<SrcEncoder
					label="transparent-with-dar.webm"
					src={staticFile('transparent-with-dar.webm')}
				/>
				<SrcEncoder
					label="vp8-opus-5-1-channels.webm"
					src={staticFile('vp8-opus-5-1-channels.webm')}
				/>
				{blob ? <SrcEncoder label="blob" src={blob} /> : null}
			</div>
		</>
	);
};
