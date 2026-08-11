import {Lottie} from '@remotion/lottie';
import {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	Sequence,
	continueRender,
	delayRender,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import HeaderAndCredits from './HeaderAndCredits';
import './common.css';

const Pumpkin = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const animationDelay = 1;
	const animationInput = frame - animationDelay;
	const animationOpacity = interpolate(
		animationInput,
		[0, 5, durationInFrames - 20, durationInFrames],
		[0, 1, 1, 0],
	);

	const [animationData, setAnimationData] = useState(null);
	const [handle] = useState(delayRender);

	useEffect(() => {
		// Credits: https://lottiefiles.com/37789-scary-halloween-pumpkin
		fetch('https://assets2.lottiefiles.com/packages/lf20_c5izbrx1.json')
			.then((res) => res.json())
			.then((data) => {
				setAnimationData(data);
				continueRender(handle);
			});
	}, [handle]);

	if (!animationData) {
		return null;
	}

	return (
		<AbsoluteFill style={{opacity: animationOpacity}}>
			<Lottie animationData={animationData} />
		</AbsoluteFill>
	);
};

const LottiePumpkin: React.FC = () => {
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<div className="container" style={{height, width}}>
			<Sequence durationInFrames={durationInFrames}>
				<Pumpkin />
			</Sequence>
			<Sequence from={30}>
				<HeaderAndCredits author="Roman Serebryakov" />
			</Sequence>
		</div>
	);
};

export default LottiePumpkin;
