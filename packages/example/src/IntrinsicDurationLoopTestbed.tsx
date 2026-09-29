import {Gif} from '@remotion/gif';
import {Lottie, type LottieAnimationData} from '@remotion/lottie';
import {Audio, Video} from '@remotion/media';
import {useEffect, useState, type ReactNode} from 'react';
import {
	AbsoluteFill,
	AnimatedImage,
	staticFile,
	useCurrentFrame,
	useDelayRender,
} from 'remotion';

const gifSrc = staticFile('giphy.gif');
const mediaStyle = {width: '100%', height: 280, objectFit: 'contain' as const};

const Panel = ({
	title,
	detail,
	children,
}: {
	title: string;
	detail: string;
	children: ReactNode;
}) => (
	<div
		style={{
			borderRadius: 18,
			backgroundColor: '#1b2738',
			border: '1px solid #39506a',
			padding: 22,
			display: 'flex',
			flexDirection: 'column',
			gap: 12,
		}}
	>
		<div style={{fontSize: 27, fontWeight: 700}}>{title}</div>
		<div style={{fontSize: 18, color: '#a8c3de'}}>{detail}</div>
		<div
			style={{
				backgroundColor: '#101a27',
				borderRadius: 12,
				flex: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
			}}
		>
			{children}
		</div>
	</div>
);

export const IntrinsicDurationLoopTestbed = () => {
	const frame = useCurrentFrame();
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [handle] = useState(() => delayRender('Loading loop testbed Lottie'));
	const [animationData, setAnimationData] =
		useState<LottieAnimationData | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		fetch(staticFile('reverse-loader.json'), {signal: controller.signal})
			.then((response) => response.json())
			.then((data) => {
				setAnimationData(data);
				continueRender(handle);
			})
			.catch((error) => {
				if (error.name !== 'AbortError') {
					cancelRender(error);
				}
			});

		return () => {
			controller.abort();
			continueRender(handle);
		};
	}, [cancelRender, continueRender, handle]);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0c1522',
				color: '#f1f7ff',
				fontFamily: 'sans-serif',
				padding: 48,
				gap: 24,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between'}}>
				<div style={{fontSize: 40, fontWeight: 700}}>
					Intrinsic duration loops
				</div>
				<div style={{fontSize: 25, fontVariantNumeric: 'tabular-nums'}}>
					Frame {frame} / 299
				</div>
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gridTemplateRows: 'repeat(2, 1fr)',
					gap: 20,
					flex: 1,
				}}
			>
				<Panel title="Video" detail="loop · trimBefore=15 · 3× speed">
					<Video
						src={staticFile('demo_smpte_h264_aac.mp4')}
						loop
						trimBefore={15}
						playbackRate={3}
						muted
						style={mediaStyle}
						objectFit="contain"
					/>
				</Panel>
				<Panel title="Audio" detail="loop · intrinsic range · 20× speed">
					<Audio
						src={staticFile('chirp.wav')}
						loop
						playbackRate={20}
						volume={0.2}
					/>
					<div style={{fontSize: 64}}>♪</div>
				</Panel>
				<Panel title="Lottie" detail="loop · trimBefore=30 · 2× speed">
					{animationData ? (
						<Lottie
							animationData={animationData}
							loop
							trimBefore={30}
							playbackRate={2}
							style={{width: 280, height: 280}}
						/>
					) : null}
				</Panel>
				<Panel title="Gif" detail="loop · intrinsic range · 1× speed">
					<Gif
						src={gifSrc}
						loop
						loopBehavior="pause-after-finish"
						width={500}
						height={280}
						fit="contain"
						style={mediaStyle}
					/>
				</Panel>
				<Panel title="AnimatedImage" detail="loop · intrinsic range · 1× speed">
					<AnimatedImage
						src={gifSrc}
						loop
						loopBehavior="pause-after-finish"
						width={500}
						height={280}
						fit="contain"
						style={mediaStyle}
					/>
				</Panel>
				<Panel
					title="Trimmed image loops"
					detail="Both use trimBefore=15 · 2× speed"
				>
					<div style={{display: 'flex', width: '100%'}}>
						<Gif
							src={gifSrc}
							loop
							trimBefore={15}
							playbackRate={2}
							loopBehavior="pause-after-finish"
							width={240}
							height={280}
							fit="contain"
							style={{width: '50%', height: 280}}
						/>
						<AnimatedImage
							src={gifSrc}
							loop
							trimBefore={15}
							playbackRate={2}
							loopBehavior="pause-after-finish"
							width={240}
							height={280}
							fit="contain"
							style={{width: '50%', height: 280}}
						/>
					</div>
				</Panel>
			</div>
		</AbsoluteFill>
	);
};
