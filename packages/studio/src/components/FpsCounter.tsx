import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT, RED} from '../helpers/colors';

const label: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	fontFamily: 'Arial, Helvetica, sans-serif',
	whiteSpace: 'nowrap',
};

type FrameSample = {
	time: number;
	frame: number;
};

const MAX_SAMPLES = 15;

// Playback advances by elapsed time, so above the display refresh rate one
// update can move several frames. Count frames advanced, not updates.
export const getFramesAdvancedPerSecond = (
	samples: FrameSample[],
	playbackSpeed: number,
): number | null => {
	let frames = 0;
	let time = 0;
	for (let i = 1; i < samples.length; i++) {
		const frameDelta = samples[i].frame - samples[i - 1].frame;
		// The frame jumped against the playback direction: playback looped.
		if (frameDelta * playbackSpeed < 0) {
			continue;
		}

		frames += Math.abs(frameDelta);
		time += samples[i].time - samples[i - 1].time;
	}

	if (time === 0) {
		return null;
	}

	return (frames / time) * 1000;
};

export const FpsCounter: React.FC<{
	readonly playbackSpeed: number;
}> = ({playbackSpeed}) => {
	const videoConfig = Internals.useUnsafeVideoConfig();
	const playing = Internals.usePlaying();
	const frame = Internals.Timeline.useTimelinePosition();

	const [marker, rerender] = useState({});
	const [fps, setFps] = useState(0);

	const previousUpdates = useRef<FrameSample[]>([]);
	const fpsRef = useRef<number>(0);
	const playingRef = useRef<boolean>(playing);
	const playbackSpeedRef = useRef<number>(playbackSpeed);

	useLayoutEffect(() => {
		fpsRef.current = 0;
		previousUpdates.current = [];
		playingRef.current = playing;
		playbackSpeedRef.current = playbackSpeed;
	}, [playing, playbackSpeed]);

	useLayoutEffect(() => {
		if (playingRef.current === false) return;

		previousUpdates.current = [
			...previousUpdates.current,
			{time: performance.now(), frame},
		].slice(-MAX_SAMPLES);

		const framesPerSecond = getFramesAdvancedPerSecond(
			previousUpdates.current,
			playbackSpeedRef.current,
		);
		if (framesPerSecond === null) return;

		fpsRef.current = framesPerSecond;

		if (previousUpdates.current.length === 2) setFps(fpsRef.current);
		/* This effect should depends only on frame, otherwise it will push extra updates to ref and fps will be wrong */
	}, [frame]);

	useEffect(() => {
		if (playing) {
			const t = setTimeout(() => {
				rerender({});
				setFps(fpsRef.current);
			}, 1000);
			return () => clearTimeout(t);
		}
	}, [marker, playing]);

	const style = useMemo(() => {
		if (!videoConfig) {
			return {};
		}

		const expectedFps = Math.abs(playbackSpeed) * videoConfig.fps;

		return {
			...label,
			color: fps < expectedFps * 0.9 ? RED : LIGHT_TEXT,
		};
	}, [fps, playbackSpeed, videoConfig]);

	if (fps === 0) {
		return null;
	}

	if (playing === false) {
		return null;
	}

	if (videoConfig === null) {
		return null;
	}

	return <div style={style}>{fps.toFixed(1)} FPS</div>;
};
