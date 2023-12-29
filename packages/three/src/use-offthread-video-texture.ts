import {getVideoMetadata} from '@remotion/media-utils';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	getRemotionEnvironment,
	Internals,
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

export type UseOffthreadVideoTextureOptions = {
	src: string;
	videoRef: React.MutableRefObject<HTMLVideoElement | null>;
	loop?: boolean;
	playbackRate?: number;
	transparent?: boolean;
};

export function useOffthreadVideoTexture({
	src,
	videoRef,
	loop = false,
	playbackRate = 1,
	transparent = false,
}: UseOffthreadVideoTextureOptions) {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	if (!src) {
		throw new Error('src must be provided to useOffthreadVideoTexture');
	}

	const {isRendering} = getRemotionEnvironment();
	if (!isRendering) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useVideoTexture(videoRef);
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const mediaStartsAt = Internals.useMediaStartsAt();

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const videoDuration = useVideoDuration({src});

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const currentTime = useMemo(() => {
		let time =
			NoReactInternals.getExpectedMediaFrameUncorrected({
				frame,
				playbackRate,
				startFrom: -mediaStartsAt,
			}) / fps;

		if (loop && videoDuration !== null) {
			time %= videoDuration;
		}

		return time;
	}, [frame, playbackRate, mediaStartsAt, fps, loop, videoDuration]);

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const offthreadVideoFrameSrc = useMemo(() => {
		return NoReactInternals.getOffthreadVideoSource({
			currentTime,
			src,
			transparent,
		});
	}, [currentTime, src, transparent]);

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null);

	// eslint-disable-next-line react-hooks/rules-of-hooks
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
		return () => {
			continueRender(imageTextureHandle);
		};
	}, [offthreadVideoFrameSrc, isRendering]);

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		fetchTexture();
	}, [offthreadVideoFrameSrc, fetchTexture]);

	if (isRendering) {
		return imageTexture;
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const videoTexture = useVideoTexture(videoRef);

	return videoTexture;
}
