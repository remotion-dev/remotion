import {Lottie} from '@remotion/lottie';
import {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	Loop,
	Sequence,
	continueRender,
	delayRender,
	useVideoConfig,
} from 'remotion';

const paths = {
	// Credits: Christina Bublyk, Viktor Anisimov, Daniel Teasdale
	// Source: https://lottiefiles.com/blog/tips-and-tutorials/how-to-chain-interactions-lottie-interactivity
	bird: 'https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json',
	// Credits: https://lottiefiles.com/34191-end-color
	end: 'https://assets4.lottiefiles.com/private_files/lf30_uezjhwrv.json',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PathsData = Record<keyof typeof paths, any> | null;

// I don't know if all animations have the same shape
interface Marker {
	tm: number;
	cm: string;
	dr: number;
}

const getFramesByName = (name: string, markers: Marker[] = []) => {
	return markers.find((m) => m.cm.includes(name))?.dr || 0;
};

const LottieExplodingBird = () => {
	const {height, width} = useVideoConfig();
	const [animationData, setAnimationData] = useState<PathsData>(null);
	const [handle] = useState(delayRender);

	useEffect(() => {
		Promise.all([
			fetch(paths.bird).then((res) => res.json()),
			fetch(paths.end).then((res) => res.json()),
		]).then(([bird, end]) => {
			setAnimationData({bird, end});
			continueRender(handle);
		});
	}, [handle]);

	// Get the markers and frames from the data
	const markers = animationData?.bird?.markers;
	const birdNFrames = getFramesByName('bird', markers);
	const explosionNFrames = getFramesByName('explosion', markers);
	const feathersNFrames = getFramesByName('feathers', markers);
	// Computed variables
	const birdLoops = 6;
	const birdSpeed = 2;
	const explosionSpeed = 0.1;
	const feathersSpeed = 0.8;
	const birdDuration = Math.floor(birdNFrames / birdSpeed);
	const explosionFrom = birdDuration * birdLoops;
	const explosionDuration = Math.floor(explosionNFrames / explosionSpeed);
	const explosionStart = birdNFrames / explosionSpeed;
	const feathersFrom = explosionFrom + explosionDuration;
	const feathersDuration = Math.floor(feathersNFrames / feathersSpeed);
	const feathersStart = Math.ceil(
		(birdNFrames + explosionNFrames) / feathersSpeed,
	);
	const endFrom = feathersFrom + feathersDuration;

	return (
		<AbsoluteFill style={{height, width}}>
			{animationData?.bird ? (
				<>
					<Loop durationInFrames={birdDuration} times={birdLoops}>
						<Lottie
							animationData={animationData.bird}
							playbackRate={birdSpeed}
							style={{height, width}}
						/>
					</Loop>
					<Sequence from={explosionFrom} durationInFrames={explosionDuration}>
						<Sequence from={-explosionStart}>
							<Lottie
								animationData={animationData.bird}
								playbackRate={explosionSpeed}
								style={{height, width}}
							/>
						</Sequence>
					</Sequence>
					<Sequence from={feathersFrom} durationInFrames={feathersDuration}>
						<Sequence from={-feathersStart}>
							<Lottie
								animationData={animationData.bird}
								playbackRate={feathersSpeed}
								style={{height, width}}
							/>
						</Sequence>
					</Sequence>
				</>
			) : null}
			{animationData?.end ? (
				<Sequence from={endFrom}>
					<Lottie
						animationData={animationData.end}
						playbackRate={2}
						style={{height, width}}
					/>
				</Sequence>
			) : null}
		</AbsoluteFill>
	);
};

export default LottieExplodingBird;
