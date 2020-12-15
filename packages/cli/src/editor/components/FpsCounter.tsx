import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {getLastFrames} from '../state/last-frames';

const Label = styled.div`
	color: white;
	font-family: Arial, Helvetica, sans-serif;
`;

export const FpsCounter: React.FC = () => {
	const [now, setNow] = useState(0);

	useEffect(() => {
		const t = setTimeout(() => {
			setNow(Date.now());
		}, 1000);
		return () => clearTimeout(t);
	}, [now]);

	const lastFrames = getLastFrames();
	if (lastFrames.length === 0) {
		return null;
	}

	const diff = Math.max(...lastFrames) - Math.min(...lastFrames);
	const avg = diff / lastFrames.length;
	const fps = 1000 / avg;
	return <Label>{String(fps.toFixed(1))} FPS</Label>;
};
