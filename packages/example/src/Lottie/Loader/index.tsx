import {getLottieMetadata, Lottie, LottieAnimationData} from '@remotion/lottie';
import {AnimationItem} from 'lottie-web';
import {useCallback, useEffect, useState} from 'react';
import {
	continueRender,
	delayRender,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const LottieLoader = () => {
	const frame = useCurrentFrame();
	const [handle] = useState(() => delayRender('Loading Lottie animation'));

	const [error, setError] = useState<Error | null>(null);

	if (error) {
		throw error;
	}

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
				setError(err);
				console.log('Animation failed to load', err);
			});
	}, [handle]);

	const onAnimationLoaded = useCallback((item: AnimationItem) => {
		console.log(item.renderer);
	}, []);

	if (!animationData) {
		return null;
	}

	const {durationInFrames: df} = getLottieMetadata(animationData) || {};
	const nLoop = df && frame > 0 ? Math.ceil(frame / df) : 1;
	const direction = nLoop % 2 === 0 ? 'backward' : 'forward';

	return (
		<Lottie
			loop
			animationData={animationData}
			direction={direction}
			onAnimationLoaded={onAnimationLoaded}
		/>
	);
};

export default LottieLoader;
