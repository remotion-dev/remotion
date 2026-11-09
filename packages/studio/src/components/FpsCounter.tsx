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

const pushWithMaxSize = (
	arr: number[],
	value: number,
	maxSize: number,
): number[] => {
	arr.push(value);
	return arr.slice(-maxSize);
};

export const getRefreshRate = (frameTimes: number[]): number | null => {
	const gaps = frameTimes
		.slice(1)
		.map((time, i) => time - frameTimes[i])
		.sort((a, b) => a - b);
	if (gaps.length === 0) {
		return null;
	}

	const median = gaps[Math.floor(gaps.length / 2)];
	return median > 0 ? 1000 / median : null;
};

export const getExpectedFps = ({
	fps,
	playbackSpeed,
	refreshRate,
}: {
	fps: number;
	playbackSpeed: number;
	refreshRate: number | null;
}) => {
	return Math.min(Math.abs(playbackSpeed) * fps, refreshRate ?? Infinity);
};

const REFRESH_RATE_PROBE_FRAMES = 30;

export const FpsCounter: React.FC<{
	readonly playbackSpeed: number;
}> = ({playbackSpeed}) => {
	const videoConfig = Internals.useUnsafeVideoConfig();
	const playing = Internals.usePlaying();
	const frame = Internals.Timeline.useTimelinePosition();

	const [marker, rerender] = useState({});
	const [fps, setFps] = useState(0);
	const [refreshRate, setRefreshRate] = useState<number | null>(null);

	const previousUpdates = useRef<number[]>([]);
	const fpsRef = useRef<number>(0);
	const playingRef = useRef<boolean>(playing);

	useLayoutEffect(() => {
		fpsRef.current = 0;
		previousUpdates.current = [];
		playingRef.current = playing;
	}, [playing]);

	useLayoutEffect(() => {
		if (playingRef.current === false) return;

		previousUpdates.current = pushWithMaxSize(
			previousUpdates.current,
			performance.now(),
			15,
		);

		if (previousUpdates.current.length < 2) return;

		const diff =
			Math.max(...previousUpdates.current) -
			Math.min(...previousUpdates.current);
		const averageDistanceBetween = diff / (previousUpdates.current.length - 1);
		fpsRef.current = 1000 / averageDistanceBetween;

		if (previousUpdates.current.length === 2) setFps(fpsRef.current);
		/* This effect should depends only on frame, otherwise it will push extra updates to ref and fps will be wrong */
	}, [frame]);

	useEffect(() => {
		let handle = 0;
		const frameTimes: number[] = [];
		const onFrame = (now: number) => {
			frameTimes.push(now);
			if (frameTimes.length < REFRESH_RATE_PROBE_FRAMES) {
				handle = requestAnimationFrame(onFrame);
				return;
			}

			const measured = getRefreshRate(frameTimes);
			if (measured !== null) {
				// A busy main thread only lowers the estimate, so keep the highest.
				setRefreshRate((prev) => Math.max(prev ?? 0, measured));
			}
		};

		handle = requestAnimationFrame(onFrame);
		return () => cancelAnimationFrame(handle);
	}, [playing]);

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

		const expectedFps = getExpectedFps({
			fps: videoConfig.fps,
			playbackSpeed,
			refreshRate,
		});

		return {
			...label,
			color: fps < expectedFps * 0.9 ? RED : LIGHT_TEXT,
		};
	}, [fps, playbackSpeed, refreshRate, videoConfig]);

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
