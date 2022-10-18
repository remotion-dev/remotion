import {mix} from 'polished';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
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
	display: inline-block;
`;

const lines = 7;
const Row: React.FC<{
	videoWidth: number;
	i: number;
	text: string;
	zoom: number;
}> = ({videoWidth, i, text, zoom}) => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const progress = spring({
		config: {
			damping: 30,
			mass: 1,
			stiffness: 40,
			overshootClamping: false,
		},
		fps: videoConfig.fps,
		from: 0,
		to: 1,
		frame,
	});
	const posX = interpolate(progress, [0, 1], [1, 0]);

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
				width: 10000,
				marginLeft: -(10000 - videoWidth) / 2 + posX * 1000 * dir,
				textAlign: 'center',
				color,
				opacity: 1 - zoom,
			}}
		>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline={false} style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
		</div>
	);
};

type Props = {
	word1: string;
};

const BetaText = ({word1}: Props): React.ReactNode => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();

	const progress = spring({
		config: {
			damping: 30,
			mass: 1,
			stiffness: 40,
			overshootClamping: false,
		},
		fps: videoConfig.fps,
		from: 0,
		to: 1,
		frame: Math.max(0, frame - 70),
	});
	const scale = interpolate(progress, [0, 0.4], [1, 10]);
	const backgroundColor = mix(1 - progress, '#fff', solidBrand);

	return (
		<div
			style={{
				width: videoConfig.width,
				height: videoConfig.height,
				display: 'flex',
				transform: `scale(${scale})`,
			}}
		>
			<div
				style={{
					backgroundColor,
					flex: 1,
				}}
			>
				{new Array(17)
					.fill(true)
					.map((_, i) => i)
					.map((key) => {
						return (
							<Row
								key={key}
								zoom={progress}
								text={
									key === 7
										? 'CET'
										: key === 5
										? '5pm'
										: key === 3
										? word1 ?? 'TOMORROW'
										: key === 1
										? 'ANYSTICKER'
										: 'BETA'
								}
								i={key}
								videoWidth={videoConfig.width}
							/>
						);
					})}
			</div>
		</div>
	);
};

export default BetaText;
