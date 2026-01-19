import {Lottie, LottieAnimationData} from '@remotion/lottie';
import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';

export const MyAnimation = () => {
	const [handle] = useState(() => delayRender('Loading Lottie animation'));

	const [animationData, setAnimationData] =
		useState<LottieAnimationData | null>(null);

	useEffect(() => {
		fetch('https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json')
			.then((data) => data.json())
			.then((json) => {
				setAnimationData(json);
				continueRender(handle);
			})
			.catch((err) => {
				cancelRender(err);
			});
	}, [handle]);

	if (!animationData) {
		return null;
	}

	return <Lottie animationData={animationData} />;
};
