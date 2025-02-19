/* eslint-disable react/no-unknown-property */
import type {VideoMetadata} from '@remotion/media-utils';
import {getVideoMetadata} from '@remotion/media-utils';
import {ThreeCanvas, useVideoTexture} from '@remotion/three';
import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, useVideoConfig, Video} from 'remotion';
import {Phone} from './Phone';

const videoStyle: React.CSSProperties = {
	position: 'absolute',
	opacity: 0,
};

export const Scene: React.FC<{
	readonly videoSrc: string;
	readonly baseScale: number;
}> = ({baseScale, videoSrc}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const {width, height} = useVideoConfig();
	const [videoData, setVideoData] = useState<VideoMetadata | null>(null);

	useEffect(() => {
		getVideoMetadata(videoSrc)
			.then((data) => setVideoData(data))
			.catch((err) => console.log(err));
	}, [videoSrc]);

	const texture = useVideoTexture(videoRef);
	return (
		<AbsoluteFill>
			<Video ref={videoRef} src={videoSrc} style={videoStyle} />
			{videoData ? (
				<ThreeCanvas width={width} height={height}>
					<ambientLight intensity={1.5} color={0xffffff} />
					<pointLight position={[10, 10, 0]} />
					<Phone
						baseScale={baseScale}
						videoTexture={texture}
						aspectRatio={videoData.aspectRatio}
					/>
				</ThreeCanvas>
			) : null}
		</AbsoluteFill>
	);
};
