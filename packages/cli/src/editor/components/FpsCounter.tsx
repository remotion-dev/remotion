import React, {useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {getLastFrames} from '../state/last-frames';

const Label = styled.div`
	color: white;
	font-family: Arial, Helvetica, sans-serif;
`;

export const FpsCounter: React.FC = () => {
	const [now, setNow] = useState(0);
	const videoConfig = Internals.useUnsafeVideoConfig();

	useEffect(() => {
		const t = setTimeout(() => {
			setNow(Date.now());
		}, 1000);
		return () => clearTimeout(t);
	}, [now]);

	const lastFrames = getLastFrames();

	const diff = Math.max(...lastFrames) - Math.min(...lastFrames);
	const averageDistanceBetween = diff / (lastFrames.length - 1);
	const fps = 1000 / averageDistanceBetween;

	const style = useMemo((): React.CSSProperties => {
		if (!videoConfig) {
			return {};
		}
		return {color: fps < videoConfig.fps * 0.9 ? 'red' : 'white'};
	}, [fps, videoConfig]);

	if (lastFrames.length === 0) {
		return null;
	}

	if (videoConfig === null) {
		return null;
	}

	return <Label style={style}>{String(fps.toFixed(1))} FPS</Label>;
};
