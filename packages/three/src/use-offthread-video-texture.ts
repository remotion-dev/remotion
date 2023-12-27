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
import {getExpectedMediaFrameUncorrected} from 'remotion/src/video/get-current-time';
import * as THREE from 'three';
import {getVideoMetadata} from '../../media-utils';
import {useVideoTexture} from './use-video-texture';

export function useVideoDuration({src}: {src: string}) {
	const [videoDuration, setVideoDuration] = useState<null | number>(null);
	const [videoDurationHandle] = useState(() =>
		delayRender('fetch video duration'),
	);

	useEffect(() => {
		if (src) {
			getVideoMetadata(src)
				.then(({durationInSeconds}) => {
					setVideoDuration(durationInSeconds);
					continueRender(videoDurationHandle);
				})
				.catch((err) => {
					console.error(err);
					cancelRender(err);
				});
		} else {
			continueRender(videoDurationHandle);
		}
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
}

export function useOffthreadVideoTexture({
	src,
	loop = false,
	playbackRate = 1,
}: UseOffthreadVideoTextureProps) {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const {isRendering} = getRemotionEnvironment();

	const videoDuration = useVideoDuration({src});

	// taken from OffthreadVideoForRendering.tsx as it's not exported yet
	const currentTime = useMemo(() => {
		let time =
			getExpectedMediaFrameUncorrected({
				frame,
				playbackRate,
				startFrom: 0,
			}) / fps;

		if (loop && videoDuration) {
			time %= videoDuration;
		}

		return time;
	}, [frame, fps, loop, videoDuration, playbackRate]);

	const offthreadVideoFrameSrc = useMemo(() => {
		if (!src) {
			return null;
		}

		return `http://localhost:${
			window.remotion_proxyPort
		}/proxy?src=${encodeURIComponent(
			NoReactInternals.getAbsoluteSrc(src),
		)}&time=${encodeURIComponent(currentTime)}&transparent=${String(false)}`;
	}, [currentTime, src]);

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

	const {videoRef} = useVideoRef({src, currentTime});

	const videoTexture = useVideoTexture(videoRef);

	if (!src) {
		return new THREE.Texture();
	}

	return isRendering ? imageTexture : videoTexture;
}
