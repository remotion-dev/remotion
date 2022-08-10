import {getLottieMetadata, Lottie, LottieAnimationData} from '@remotion/lottie';
import {useEffect, useState} from 'react';
import {
	continueRender,
	delayRender,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const LottieLoader = () => {
	const frame = useCurrentFrame();
	const [handle] = useState(() => delayRender('Loading Lottie animation'));

	const [animationData, setAnimationData] =
		useState<LottieAnimationData | null>(null);

	useEffect(() => {
		// Credits: https://lottiefiles.com/93004-reverse-loader
		fetch(staticFile('reverse-loader.json'))
			.then((data) => data.json())
			.then((json) => {
				setAnimationData(json);
				continueRender(handle);
			})
			.catch((err) => {
				console.log('Animation failed to load', err);
			});
	}, [handle]);

	if (!animationData) {
		return null;
	}

	const {durationInFrames: df} = getLottieMetadata(animationData) || {};
	const nLoop = df && frame > 0 ? Math.ceil(frame / df) : 1;
	const direction = nLoop % 2 === 0 ? -1 : 1;

	return <Lottie loop animationData={animationData} direction={direction} />;
};

export default LottieLoader;
