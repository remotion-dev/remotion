import Hls from 'hls.js';
import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, RemotionVideoProps, Video} from 'remotion';

const HlsVideo: React.FC<RemotionVideoProps> = ({src}) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (!src) {
			throw new Error('src is required');
		}

		const hls = new Hls();

		hls.loadSource(src);
		hls.attachMedia(videoRef.current!);

		return () => {
			hls.destroy();
		};
	}, [src]);

	return <Video ref={videoRef} src={src} />;
};

export const HlsDemo: React.FC = () => {
	return (
		<AbsoluteFill>
			<HlsVideo src="https://stream.mux.com/nqGuji1CJuoPoU3iprRRhiy3HXiQN0201HLyliOg44HOU.m3u8" />
		</AbsoluteFill>
	);
};
