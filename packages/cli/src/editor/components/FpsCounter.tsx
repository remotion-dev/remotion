import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';

const Label = styled.div`
	color: white;
	font-size: 15px;
	font-family: Arial, Helvetica, sans-serif;
`;

const pushWithMaxSize = (
	arr: number[],
	value: number,
	maxSize: number
): number[] => {
	arr.push(value);
	return arr.slice(-maxSize);
};

export const FpsCounter: React.FC = () => {
	const videoConfig = Internals.useUnsafeVideoConfig();
	const [playing] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();

	const [marker, rerender] = useState({});
	const [fps, setFps] = useState(0);

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
			15
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
		if (playing) {
			const t = setTimeout(() => {
				rerender({});
				setFps(fpsRef.current);
			}, 1000);
			return () => clearTimeout(t);
		}
	}, [marker, playing]);

	if (fps === 0) {
		return null;
	}

	if (playing === false) {
		return null;
	}

	if (videoConfig === null) {
		return null;
	}

	const style = {color: fps < videoConfig.fps * 0.9 ? 'red' : 'white'};
	return <Label style={style}>{fps.toFixed(1)} FPS</Label>;
};
