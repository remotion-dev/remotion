import type {EmojiName} from '@remotion/animated-emoji';
import {
	getLottieMetadata,
	Lottie,
	type LottieAnimationData,
} from '@remotion/lottie';

import React, {useEffect, useMemo, useState} from 'react';
import {useDelayRender, useVideoConfig} from 'remotion';

type Data = {
	duration: number;
	data: LottieAnimationData;
};

export const DisplayedEmoji: React.FC<{
	readonly emoji: EmojiName;
}> = ({emoji}) => {
	const [data, setData] = useState<Data | null>(null);
	const {durationInFrames, fps} = useVideoConfig();
	const [browser, setBrowser] = useState<boolean>(
		typeof document !== 'undefined',
	);
	const {delayRender, continueRender, cancelRender} = useDelayRender();

	const src = useMemo(() => {
		if (emoji === 'melting') {
			return 'https://fonts.gstatic.com/s/e/notoemoji/latest/1fae0/lottie.json';
		}

		if (emoji === 'partying-face') {
			return 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/lottie.json';
		}

		if (emoji === 'fire') {
			return 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/lottie.json';
		}

		throw new Error('Unknown emoji');
	}, [emoji]);

	const [handle] = useState(() => delayRender('Loading emojis!'));

	useEffect(() => {
		fetch(src)
			.then((res) => res.json())
			.then((json) => {
				setData({
					duration: getLottieMetadata(json)?.durationInSeconds as number,
					data: json,
				});
				continueRender(handle);
			})
			.catch((err) => {
				cancelRender(err);
			});
	}, [handle, src, continueRender, cancelRender]);

	useEffect(() => {
		if (typeof document !== 'undefined') {
			setBrowser(true);
		}
	}, []);

	if (!browser) {
		return null;
	}

	if (!data) {
		return null;
	}

	const animDurtion = data.duration;
	const ratio = durationInFrames / fps / animDurtion;
	const closestInteger = ratio;
	const closestRatio = closestInteger / ratio;

	return (
		<Lottie
			style={{
				height: 100,
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
			}}
			loop
			animationData={data.data}
			playbackRate={closestRatio}
		/>
	);
};
