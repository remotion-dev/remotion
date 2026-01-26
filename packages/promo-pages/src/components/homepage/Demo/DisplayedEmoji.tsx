import type {EmojiName} from '@remotion/animated-emoji';
import type {Lottie, LottieAnimationData} from '@remotion/lottie';
import React, {useEffect, useMemo, useState} from 'react';
import {cancelRender, useDelayRender, useVideoConfig} from 'remotion';

type Data = {
	Lottie: typeof Lottie;
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
	const {delayRender, continueRender} = useDelayRender();

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

	const [handle] = useState(() => delayRender());

	useEffect(() => {
		Promise.all([
			fetch(src).then((res) => res.json()),
			import('@remotion/lottie').then(({Lottie, getLottieMetadata}) => ({
				Lottie,
				getLottieMetadata,
			})),
		])
			.then(([json, {Lottie, getLottieMetadata}]) => {
				setData({
					Lottie,
					duration: getLottieMetadata(json)?.durationInSeconds as number,
					data: json,
				});
				continueRender(handle);
			})
			.catch((err) => {
				cancelRender(err);
			});
	}, [handle, src, continueRender]);

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
		<data.Lottie
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
