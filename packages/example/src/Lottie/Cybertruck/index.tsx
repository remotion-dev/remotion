import {Lottie} from '@remotion/lottie';
import {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	useVideoConfig,
} from 'remotion';

const LottieCybertruck = () => {
	const {height, width} = useVideoConfig();
	const [animationData, setAnimationData] = useState(null);
	const [handle] = useState(delayRender);

	useEffect(() => {
		// Credits: https://lottiefiles.com/11643-tesla-cybertruck
		fetch('https://assets2.lottiefiles.com/packages/lf20_RqpTFh.json')
			.then((res) => res.json())
			.then(setAnimationData);
	}, []);

	useEffect(() => {
		if (animationData) {
			continueRender(handle);
		}
	}, [animationData, handle]);

	if (!animationData) {
		return null;
	}

	return (
		<AbsoluteFill style={{height, width}}>
			<Lottie
				loop
				animationData={animationData}
				playbackRate={10}
				style={{height, width}}
			/>
		</AbsoluteFill>
	);
};

export default LottieCybertruck;
