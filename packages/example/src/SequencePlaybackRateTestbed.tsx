import {Audio, Video} from '@remotion/media';
import type {CSSProperties, ReactNode} from 'react';
import {
	AbsoluteFill,
	AnimatedImage,
	Sequence,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const video = 'https://remotion.media/video.mp4';

const mediaStyle: CSSProperties = {
	width: '100%',
	height: 215,
	backgroundColor: '#080c14',
};

const Panel = ({title, children}: {title: string; children: ReactNode}) => (
	<div
		style={{
			backgroundColor: '#192332',
			border: '1px solid #35445a',
			borderRadius: 16,
			padding: 24,
			display: 'flex',
			flexDirection: 'column',
			gap: 14,
		}}
	>
		<div style={{fontSize: 25, fontWeight: 700}}>{title}</div>
		{children}
	</div>
);

const Clock = ({label, color}: {label: string; color: string}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{fontVariantNumeric: 'tabular-nums'}}>
			<div>
				{label}: {Number(frame.toFixed(2))}
			</div>
			<div style={{height: 8, backgroundColor: '#35445a', marginTop: 8}}>
				<div
					style={{
						height: '100%',
						width: `${(frame % 60) / 0.6}%`,
						backgroundColor: color,
					}}
				/>
			</div>
		</div>
	);
};

export const SequencePlaybackRateTestbed = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0d1420',
				color: '#edf4ff',
				fontFamily: 'sans-serif',
				fontSize: 20,
				padding: 32,
				gap: 24,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between'}}>
				<div style={{fontSize: 36, fontWeight: 700}}>Sequence playbackRate</div>
				<div style={{fontVariantNumeric: 'tabular-nums'}}>
					Composition frame: {frame} / 239 · 30 fps
				</div>
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gridTemplateRows: '1fr 1fr',
					gap: 24,
					flex: 1,
				}}
			>
				<Panel title="1. Video + audio inside a 2× sequence">
					<Sequence
						name="Sped-up video and audio · 2×"
						playbackRate={3.1}
						layout="none"
					>
						<Video
							name="Video inherits 2×"
							src={video}
							muted
							objectFit="contain"
							style={mediaStyle}
						/>
						<Audio
							name="Audio inherits 2×"
							src={staticFile('podcast.wav')}
							volume={0.6}
							toneFrequency={0.47}
						/>
						<Clock label="Media parent frame" color="#58d9c1" />
					</Sequence>
					<div>Video + audible podcast, both at double speed.</div>
				</Panel>
				<Panel title="2. Video with its own trim, duration, and rate">
					<div
						style={{
							position: 'relative',
							height: 215,
							backgroundColor: '#080c14',
						}}
					>
						<AbsoluteFill
							style={{justifyContent: 'center', alignItems: 'center'}}
						>
							Video is visible on composition frames 30–149
						</AbsoluteFill>
						<Sequence
							name="Trimmed video parent · 2×"
							playbackRate={0.9}
							layout="none"
						>
							<Video
								name="Trim 60 · duration 240 · rate 0.75×"
								src={video}
								from={60}
								trimBefore={60}
								durationInFrames={240}
								playbackRate={0.75}
								muted
								objectFit="contain"
								style={{...mediaStyle, position: 'relative'}}
							/>
						</Sequence>
					</div>
					<div>Parent 2× × video 0.75× = 1.5× source playback.</div>
					<div>from=60 · trimBefore=60 · durationInFrames=240</div>
					<div>Source starts at 2 s; the clip lasts 4 composition seconds.</div>
				</Panel>
				<Panel title="3. Three nested sequences">
					<div>Each clock uses useCurrentFrame() inside its own sequence.</div>
					<Sequence
						name="Level 1 · 2×"
						from={30}
						playbackRate={2}
						layout="none"
					>
						<Clock label="Level 1 · from 30 · 2×" color="#58d9c1" />
						<Sequence
							name="Level 2 · 0.5×"
							from={30}
							playbackRate={0.5}
							layout="none"
						>
							<Clock
								label="Level 2 · from 30 · cumulative 1×"
								color="#7eb4ff"
							/>
							<Sequence
								name="Level 3 · 1.5×"
								from={15}
								playbackRate={1.5}
								layout="none"
							>
								<Clock
									label="Level 3 · from 15 · cumulative 1.5×"
									color="#ffc46b"
								/>
							</Sequence>
						</Sequence>
					</Sequence>
					<div>At composition frame 90, the local frames are 120, 45, 45.</div>
				</Panel>
				<Panel title="4. AnimatedImage inside a 0.5× sequence">
					<Sequence
						name="Animated image parent · 0.5×"
						playbackRate={0.5}
						layout="none"
					>
						<AnimatedImage
							name="GIF inherits half speed"
							src={staticFile('giphy.gif')}
							style={{...mediaStyle, objectFit: 'contain'}}
						/>
						<Clock label="Animated image parent frame" color="#df9eff" />
					</Sequence>
					<div>The GIF and its local clock advance at half speed.</div>
				</Panel>
			</div>
		</AbsoluteFill>
	);
};
