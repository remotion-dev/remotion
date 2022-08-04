import {Lottie} from '@remotion/lottie';
import React from 'react';
import {interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import balloonsAnimation from './balloons.json';
import './common.css';
import HeaderAndCredits from './HeaderAndCredits';

const Balloons = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const opacity = interpolate(
		frame,
		[0, 5, durationInFrames - 20, durationInFrames],
		[0, 1, 1, 0]
	);

	return (
		<div style={{opacity, display: 'grid', alignContent: 'center', flex: 1}}>
			<Lottie
				// https://lottiefiles.com/81293-horror-ballons
				animationData={balloonsAnimation}
				playbackRate={2}
				style={{height: 700}}
			/>
		</div>
	);
};

const LottieBalloons: React.FC = () => {
	const {height, width} = useVideoConfig();

	return (
		<div className="container" style={{height, width}}>
			<Sequence from={0}>
				<Balloons />
			</Sequence>
			<Sequence from={10}>
				<HeaderAndCredits author="Muhammad Yasir Ismail" />
			</Sequence>
		</div>
	);
};

export default LottieBalloons;
