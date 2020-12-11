import {
	registerVideo,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import {lighten} from 'polished';
import React, {useMemo} from 'react';
import styled from 'styled-components';

const Title = styled.div`
	font-family: Bangers;
	font-size: 80px;
`;

const OrangeText = styled.span`
	background: -webkit-linear-gradient(#fa4b00, #e0a82b);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	-webkit-text-stroke: 2px white;
	position: relative;
	&:before {
		content: 'Game Changer';
		position: absolute;
		left: 0;
		z-index: 0;
		-webkit-background-clip: none;
		text-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
	}
`;

const BlueText = styled.span`
	background: -webkit-linear-gradient(#0089ff, #02435d);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	-webkit-text-stroke: 2px white;
	position: relative;
	&:before {
		content: ' no Game Changer ';
		position: absolute;
		left: 0;
		z-index: 0;
		-webkit-background-clip: none;
		text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
	}
`;

export const GameChanger = () => {
	const image = require('./gamechangerbig.png').default;
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();

	const size = (videoConfig.height / 3) * 1.6;

	const makeProgressFromFrame = (f: number) =>
		spring({
			config: {
				damping: 2,
				mass: 0.1,
				stiffness: 10,
				overshootClamping: false,
			},
			fps: videoConfig.fps,
			from: 0,
			to: 1,
			frame: f,
		});

	const whiteCircleProgress = makeProgressFromFrame(frame);
	const strokeProgress = 1 - makeProgressFromFrame(frame - 10);
	const williamProgress = 1 - makeProgressFromFrame(frame - 15);
	const gameChangerProgress = makeProgressFromFrame(frame - 5);
	const orChangerProgress = makeProgressFromFrame(frame - 10);
	const noGameChangerProgress = makeProgressFromFrame(frame - 15);

	const circleStyle = useMemo(() => {
		return {
			width: size,
			height: size,
			left: (videoConfig.width - size) / 2,
			top: (videoConfig.height - size) / 5,
			borderRadius: videoConfig.height / 3,
			background: 'white',
			overflow: 'hidden' as const,
			position: 'absolute' as const,
			transform: `scale(${whiteCircleProgress})`,
		};
	}, [whiteCircleProgress, size, videoConfig.height, videoConfig.width]);

	const imageStyle = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			transform: `translateY(${williamProgress * 100}%)`,
		};
	}, [williamProgress]);

	const r = size / 2 + size / 14 / 2;

	return (
		<div
			style={{
				flex: 1,
				background: `linear-gradient(to right, rgb(255, 244, 200), ${lighten(
					0.4,
					'#fe8c00'
				)})`,
			}}
		>
			<svg
				viewBox={`-${size / 2} -${size / 2} ${size * 2} ${size * 2}`}
				style={{
					position: 'absolute',
					width: size * 2,
					height: size * 2,
					left: (videoConfig.width - size) / 2 - size / 2,
					top: (videoConfig.height - size) / 5 - size / 2,
					transform: 'rotate(-90deg)',
				}}
			>
				<defs>
					<linearGradient id="grad">
						<stop stopColor="#fe8c00" offset="0%" />
						<stop stopColor="#f83600" offset="100%" />
					</linearGradient>
				</defs>
				<circle
					r={r}
					cx={size / 2}
					cy={size / 2}
					stroke="url(#grad)"
					strokeWidth={size / 14}
					fill="none"
					strokeDasharray={Math.PI * r * 2}
					strokeLinecap="round"
					strokeDashoffset={Math.PI * r * 2 * strokeProgress}
				/>
			</svg>
			<div style={circleStyle}>
				<img src={image} style={imageStyle} />
			</div>
			<Title
				style={{
					position: 'absolute',
					top: (videoConfig.height / 5) * 3.7,
					fontSize: videoConfig.height / 8,
					textAlign: 'center',
					width: '100%',
				}}
			>
				<OrangeText
					style={{
						display: 'inline-block',
						transform: `scale(${gameChangerProgress})`,
						paddingRight: videoConfig.width / 200,
					}}
				>
					{' '}
					Game Changer{' '}
				</OrangeText>{' '}
				<span
					style={{
						fontSize: videoConfig.height / 14,
						marginRight: videoConfig.width / 60,
						position: 'relative',
						display: 'inline-block',
						transform: `scale(${orChangerProgress})`,
					}}
				>
					or
				</span>
				<BlueText
					style={{
						display: 'inline-block',
						transform: `scale(${noGameChangerProgress})`,
						paddingRight: videoConfig.width / 200,
					}}
				>
					no Game Changer{' '}
				</BlueText>
			</Title>
		</div>
	);
};

registerVideo(GameChanger, {
	width: 1920 * 2,
	height: 1080 * 2,
	durationInFrames: 60,
	fps: 30,
});
