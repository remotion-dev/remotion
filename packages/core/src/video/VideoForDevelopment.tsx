import React, {useEffect, useRef} from 'react';
import {FEATURE_FLAG_V2_BREAKING_CHANGES} from '../feature-flags';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {useMediaTagVolume} from '../sync-actual-volume';
import {usePlayingState} from '../timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {getCurrentTime} from './get-current-time';
import {RemotionVideoProps} from './props';

export const VideoForDevelopment: React.FC<RemotionVideoProps> = (props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const frame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();

	const videoConfig = useUnsafeVideoConfig();
	const [playing] = usePlayingState();

	const {volume, ...nativeProps} = props;

	// TODO: Register as an asset
	useEffect(() => {
		if (playing && !videoRef.current?.ended) {
			videoRef.current?.play();
		} else {
			videoRef.current?.pause();
		}
	}, [playing]);

	const actualVolume = useMediaTagVolume(videoRef);

	useEffect(() => {
		const userPreferredVolume = evaluateVolume({
			frame,
			volume,
		});
		if (
			!isApproximatelyTheSame(userPreferredVolume, actualVolume) &&
			videoRef.current
		) {
			videoRef.current.volume = userPreferredVolume;
		}
	}, [actualVolume, frame, props.volume, volume]);

	useEffect(() => {
		if (!videoRef.current) {
			throw new Error('No video ref found');
		}

		if (!videoConfig) {
			throw new Error(
				'No video config found. <Video> must be placed inside a composition.'
			);
		}
		const currentTime = (() => {
			if (FEATURE_FLAG_V2_BREAKING_CHANGES) {
				return getCurrentTime({
					fps: videoConfig.fps,
					frame,
					src: props.src as string,
				});
			}
			return frame / (1000 / videoConfig.fps);
		})();

		if (!playing || absoluteFrame === 0) {
			videoRef.current.currentTime = currentTime;
		}

		if (videoRef.current.paused && !videoRef.current.ended && playing) {
			videoRef.current.currentTime = currentTime;
			videoRef.current.play();
		}
	}, [frame, playing, videoConfig, absoluteFrame, props.src]);

	return <video ref={videoRef} {...nativeProps} />;
};
