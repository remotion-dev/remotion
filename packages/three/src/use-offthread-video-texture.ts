import {getVideoMetadata} from '@remotion/media-utils';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	getRemotionEnvironment,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import * as THREE from 'three';
import {useVideoTexture} from './use-video-texture';

export function useVideoDuration({src}: {src: string}) {
	const [videoDuration, setVideoDuration] = useState<null | number>(null);
	const [videoDurationHandle] = useState(() =>
		delayRender('fetch video duration'),
	);

	useEffect(() => {
		getVideoMetadata(src)
			.then(({durationInSeconds}) => {
				setVideoDuration(durationInSeconds);
				continueRender(videoDurationHandle);
			})
			.catch((err) => {
				console.error(err);
				cancelRender(err);
			});
	}, [src, videoDurationHandle]);

	return videoDuration;
}

const useVideoRef = ({
	src,
	currentTime,
}: {
	src: string;
	currentTime: number;
}) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	const videoElement = useMemo(() => {
		const video = document.createElement('video');
		video.muted = true;
		video.src = src;
		video.style.display = 'none';

		// crossOrigin="anonymous" is important to allow CORS-enabled servers
		// to be read from a canvas
		video.crossOrigin = 'anonymous';

		return video;
	}, [src]);

	useEffect(() => {
		document.body.appendChild(videoElement);

		videoRef.current = videoElement;

		return () => {
			document.body.removeChild(videoElement);
		};
	}, [videoElement]);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.currentTime = currentTime;
		}
	}, [currentTime]);

	return {videoRef};
};

interface UseOffthreadVideoTextureProps {
	src: string;
	loop?: boolean;
	playbackRate?: number;
	transparent?: boolean;
}

export function useOffthreadVideoTexture({
	src,
	loop = false,
	playbackRate = 1,
	transparent = false,
}: UseOffthreadVideoTextureProps) {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	if (!src) {
		throw new Error('src must be provided to useOffthreadVideoTexture');
	}

	const {isRendering} = getRemotionEnvironment();

	const videoDuration = useVideoDuration({src});

	const currentTime = useMemo(() => {
		let time =
			NoReactInternals.getExpectedMediaFrameUncorrected({
				frame,
				playbackRate,
				startFrom: 0,
			}) / fps;

		if (loop && videoDuration !== null) {
			time %= videoDuration;
		}

		return time;
	}, [frame, fps, loop, videoDuration, playbackRate]);

	const offthreadVideoFrameSrc = useMemo(() => {
		return NoReactInternals.getOffthreadVideoSource({
			currentTime,
			src,
			transparent,
		});
	}, [currentTime, src, transparent]);

	const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null);

	const fetchTexture = useCallback(() => {
		const imageTextureHandle = delayRender('fetch offthread video frame');

		if (!offthreadVideoFrameSrc || !isRendering) {
			continueRender(imageTextureHandle);
			return;
		}

		new THREE.TextureLoader()
			.loadAsync(offthreadVideoFrameSrc)
			.then((texture) => {
				setImageTexture(texture);
				continueRender(imageTextureHandle);
			})
			.catch((err) => {
				cancelRender(err);
			});
	}, [offthreadVideoFrameSrc, isRendering]);

	useEffect(() => {
		fetchTexture();
	}, [offthreadVideoFrameSrc, fetchTexture]);

	if (isRendering) {
		return imageTexture;
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const {videoRef} = useVideoRef({src, currentTime});

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const videoTexture = useVideoTexture(videoRef);

	return videoTexture;
}
