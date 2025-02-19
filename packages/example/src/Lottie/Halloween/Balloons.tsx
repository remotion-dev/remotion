import {Lottie, LottieAnimationData} from '@remotion/lottie';
import React, {useEffect, useState} from 'react';
import {
	Sequence,
	continueRender,
	delayRender,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import HeaderAndCredits from './HeaderAndCredits';
import './common.css';

const Balloons = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const opacity = interpolate(
		frame,
		[0, 5, durationInFrames - 20, durationInFrames],
		[0, 1, 1, 0],
	);

	const [error, setError] = useState<Error | null>(null);
	const [handle] = useState(() => delayRender('Loading Lottie animation'));

	if (error) {
		throw error;
	}

	const [animationData, setAnimationData] =
		useState<LottieAnimationData | null>(null);

	useEffect(() => {
		// Credits: https://lottiefiles.com/81293-horror-ballons
		fetch(staticFile('balloons.json'))
			.then((data) => data.json())
			.then((json) => {
				setAnimationData(json);
				continueRender(handle);
			})
			.catch((err) => {
				setError(err);
				console.log('Animation failed to load', err);
			});
	}, [handle]);

	if (!animationData) {
		return null;
	}

	return (
		<div style={{opacity, display: 'grid', alignContent: 'center', flex: 1}}>
			<Lottie
				animationData={animationData}
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
			<Sequence>
				<Balloons />
			</Sequence>
			<Sequence from={10}>
				<HeaderAndCredits author="Muhammad Yasir Ismail" />
			</Sequence>
		</div>
	);
};

export default LottieBalloons;
