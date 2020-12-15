import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export const GameChangerMain = () => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();

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

	const gameChangerProgress = makeProgressFromFrame(frame - 5);

	return (
		<div
			style={{
				flex: 1,
				background: 'transparent',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Title
				style={{
					fontSize: videoConfig.height / 5,
					textAlign: 'center',
					width: '100%',
				}}
			>
				<OrangeText
					style={{
						display: 'inline-block',
						transform: `scale(${gameChangerProgress})`,
						paddingRight: videoConfig.width / 100,
					}}
				>
					Game Changer{' '}
				</OrangeText>
			</Title>
		</div>
	);
};

export default GameChangerMain;
