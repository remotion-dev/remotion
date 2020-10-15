import {
	registerVideo,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import {mix} from 'polished';
import React from 'react';
import styled from 'styled-components';

const BRAND_GRADIENT = ['#5851db', '#405de6'];
const solidBrand = mix(0.5, BRAND_GRADIENT[0], BRAND_GRADIENT[1]);
const Label = styled.span<{
	outline: boolean;
}>`
	font-size: 120px;
	font-family: ${(props) =>
		props.outline ? 'Altero Outline' : 'Altero-Regular'};
	text-align: center;
	transform: scaleX(1);
	line-height: 1em;
	margin-left: 10px;
	margin-right: 10px;
`;

const lines = 7;
const Row: React.FC<{
	videoWidth: number;
	i: number;
}> = ({videoWidth, i}) => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const posX = spring({
		fps: videoConfig.fps,
		mass: 4,
		stiffness: 200,
		damping: 200,
		velocity: 2,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		from: 1,
		to: 0,
		frame: Math.max(0, frame - i * 2),
	});
	const dir = i % 2 === 0 ? -1 : 1;
	const color = mix(
		Math.min(1, (lines - i - 1) / lines),
		BRAND_GRADIENT[0],
		BRAND_GRADIENT[1]
	);
	return (
		<div
			style={{
				whiteSpace: 'nowrap',
				width: 7000,
				marginLeft: -(7000 - videoWidth) / 2 + posX * 1000 * dir,
				textAlign: 'center',
				color,
			}}
		>
			<Label outline>BETA</Label>
			<Label outline>BETA</Label>
			<Label outline>BETA</Label>
			<Label outline>BETA</Label>
			<Label outline={false}>BETA</Label>
			<Label outline>BETA</Label>
			<Label outline>BETA</Label>
			<Label outline>BETA</Label>
			<Label outline>BETA</Label>
		</div>
	);
};

export const BetaText = () => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				backgroundColor: 'white',
				flex: 1,
			}}
		>
			{new Array(9)
				.fill(true)
				.map((_, i) => i)
				.map((key) => {
					return <Row i={key} key={key} videoWidth={videoConfig.width}></Row>;
				})}
		</div>
	);
};

registerVideo(BetaText, {
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 30 * 4,
});
