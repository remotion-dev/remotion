import {getVideoMetadata, VideoMetadata} from '@remotion/media-utils';
import {
	ThreeCanvas,
	useOffthreadVideoTexture,
	useVideoTexture,
} from '@remotion/three';
import {zColor} from '@remotion/zod-types';
import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, staticFile, useVideoConfig, Video} from 'remotion';
import {z} from 'zod';
import {Phone} from './Phone';

const container: React.CSSProperties = {
	backgroundColor: 'white',
};

const videoStyle: React.CSSProperties = {
	position: 'absolute',
	opacity: 0,
};

export const myCompSchema = z.object({
	phoneColor: zColor(),
	deviceType: z.enum(['phone', 'tablet']),
	textureType: z.enum(['video', 'offthreadvideo']),
});

type MyCompSchemaType = z.infer<typeof myCompSchema>;

export const VideoTextureDemo: React.FC<
	{
		baseScale: number;
	} & MyCompSchemaType
> = ({baseScale, phoneColor, deviceType, textureType}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const {width, height} = useVideoConfig();
	const [videoData, setVideoData] = useState<VideoMetadata | null>(null);

	const videoSrc =
		deviceType === 'phone' ? staticFile('phone.mp4') : staticFile('tablet.mp4');

	useEffect(() => {
		getVideoMetadata(videoSrc)
			.then((data) => setVideoData(data))
			.catch((err) => console.log(err));
	}, [videoSrc]);

	const texture =
		textureType === 'offthreadvideo'
			? // eslint-disable-next-line react-hooks/rules-of-hooks
			  useOffthreadVideoTexture({src: videoSrc, videoRef})
			: // eslint-disable-next-line react-hooks/rules-of-hooks
			  useVideoTexture(videoRef);

	return (
		<AbsoluteFill style={container}>
			<Video ref={videoRef} src={videoSrc} style={videoStyle} />
			{videoData ? (
				<ThreeCanvas linear width={width} height={height}>
					<ambientLight intensity={1.5} color={0xffffff} />
					<pointLight position={[10, 10, 0]} />
					<Phone
						phoneColor={phoneColor}
						baseScale={baseScale}
						videoTexture={texture}
						aspectRatio={videoData.aspectRatio}
					/>
				</ThreeCanvas>
			) : null}
		</AbsoluteFill>
	);
};
