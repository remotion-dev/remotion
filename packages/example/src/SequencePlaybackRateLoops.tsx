import {Video} from '@remotion/media';
import type {CSSProperties, ReactNode} from 'react';
import {
	AbsoluteFill,
	Freeze,
	Html5Video,
	Sequence,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const src = staticFile('vp8-vorbis.webm');
const videoStyle: CSSProperties = {
	width: '100%',
	height: 180,
	backgroundColor: '#080c14',
};

const NestedClocks = ({children}: {children: ReactNode}) => (
	<Sequence
		name="Outer · from 12 · trim 7 · 2×"
		from={12}
		trimBefore={7}
		playbackRate={2}
		durationInFrames={180}
		layout="none"
	>
		<Sequence
			name="Middle · from 11 · trim 5 · 0.5×"
			from={11}
			trimBefore={5}
			playbackRate={0.5}
			durationInFrames={340}
			layout="none"
		>
			<Sequence
				name="Inner · from 9 · trim 13 · 3.1×"
				from={9}
				trimBefore={13}
				playbackRate={3.1}
				durationInFrames={150}
				layout="none"
			>
				{children}
			</Sequence>
		</Sequence>
	</Sequence>
);

const Panel = ({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) => (
	<div
		style={{
			backgroundColor: '#192332',
			border: '1px solid #35445a',
			borderRadius: 16,
			padding: 20,
			display: 'flex',
			flexDirection: 'column',
			gap: 16,
		}}
	>
		<div style={{fontSize: 26, fontWeight: 700}}>{title}</div>
		<div style={{position: 'relative', height: 180}}>
			<AbsoluteFill
				style={{
					backgroundColor: '#080c14',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				Outside the video&apos;s duration
			</AbsoluteFill>
			<div style={{position: 'relative'}}>{children}</div>
		</div>
		<div>{description}</div>
	</div>
);

export const SequencePlaybackRateLoops = () => {
	const frame = useCurrentFrame();
	// Independently expand all three parent clocks and the video's `from`.
	const elapsed = (((frame - 12) * 2 + 7 - 11) * 0.5 + 5 - 9) * 3.1 + 13 - 17;
	const active = elapsed >= 0 && elapsed < 420;
	const sourceElapsed = elapsed * 0.75;
	const sourceFrame = 197 + (sourceElapsed % 71);
	const iteration = Math.floor(sourceElapsed / 71);
	const phaseSourceFrame = 197 + ((((frame - 30) * 2 + 75) * 0.7) % 27);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0d1420',
				color: '#edf4ff',
				fontFamily: 'sans-serif',
				fontSize: 20,
				padding: 24,
				gap: 14,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between'}}>
				<div style={{fontSize: 36, fontWeight: 700}}>
					Loop + trim + nested playback rates
				</div>
				<div>Frame {frame} / 299 · 30 fps</div>
			</div>
			<div>
				Sequence rates: 2 × 0.5 × 3.1. Video rate: 0.75. Effective rate: 2.325×.
			</div>
			<div
				style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20}}
			>
				<Panel
					title="Video loop"
					description="@remotion/media, with audible audio. Loop only the trimmed source interval."
				>
					<NestedClocks>
						<Video
							name="Loop · source [197, 268) · 0.75×"
							src={src}
							from={17}
							durationInFrames={420}
							trimBefore={197}
							trimAfter={268}
							playbackRate={0.75}
							loop
							volume={0.3}
							objectFit="contain"
							style={videoStyle}
						/>
					</NestedClocks>
				</Panel>
				<Panel
					title="Html5Video loop"
					description="Same clocks, trims, and rate through the native video path. Muted for comparison."
				>
					<NestedClocks>
						<Sequence from={17} durationInFrames={420} layout="none">
							<Html5Video
								name="Native loop · source [197, 268) · 0.75×"
								src={src}
								trimBefore={197}
								trimAfter={268}
								playbackRate={0.75}
								loop
								muted
								style={{...videoStyle, objectFit: 'contain'}}
							/>
						</Sequence>
					</NestedClocks>
				</Panel>
				<Panel
					title="Expected source frame"
					description="A non-looping Video frozen at the independently calculated source frame. All three pictures should match when paused."
				>
					{active ? (
						<Freeze frame={sourceFrame}>
							<Video
								name="Direct source-frame reference"
								src={src}
								muted
								objectFit="contain"
								style={videoStyle}
							/>
						</Freeze>
					) : null}
				</Panel>
			</div>
			<div style={{backgroundColor: '#192332', padding: 18, borderRadius: 16}}>
				<div style={{fontVariantNumeric: 'tabular-nums', fontSize: 28}}>
					{active
						? `Loop ${iteration + 1} · source frame ${sourceFrame.toFixed(6)} · ${(sourceFrame / 30).toFixed(6)} s`
						: 'Video is visible on composition frames 20–154'}
				</div>
				<div style={{height: 14, backgroundColor: '#35445a', marginTop: 16}}>
					<div
						style={{
							height: '100%',
							width: `${active ? ((sourceFrame - 197) / 71) * 100 : 0}%`,
							backgroundColor: '#58d9c1',
						}}
					/>
				</div>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						marginTop: 10,
					}}
				>
					<span>trimBefore = 197</span>
					<span>trimAfter = 268 (exclusive)</span>
				</div>
			</div>
			<div>
				Each loop lasts 30.537634… composition frames. The videos are visible on
				frames 20–154.
			</div>
			<div>
				Step through 49 → 50, 80 → 81, 110 → 111, and 141 → 142; then seek
				backward.
			</div>
			<div
				style={{
					display: 'flex',
					gap: 14,
					backgroundColor: '#192332',
					borderRadius: 16,
					padding: 20,
				}}
			>
				<div style={{flex: 1}}>
					<div style={{fontSize: 24, fontWeight: 700}}>
						Begin almost two loops in
					</div>
					<div>Parent: from=30, trimBefore=75, rate=2, duration=90.</div>
					<div>Video: trim [197, 224), rate=0.7, loop.</div>
					<div>
						{frame >= 30 && frame < 120
							? `Expected source frame: ${phaseSourceFrame.toFixed(6)}`
							: 'Visible on frames 30–119. First wrap: 31 → 32.'}
					</div>
					<div>The first filmstrip and waveform cycle should be partial.</div>
				</div>
				<div style={{width: 240}}>
					<div>Loop with inherited trim</div>
					<div style={{height: 135, backgroundColor: '#080c14'}}>
						<Sequence
							name="Skip into loop · trim 75 · 2×"
							from={30}
							trimBefore={75}
							playbackRate={2}
							durationInFrames={90}
							layout="none"
						>
							<Video
								name="Partial first loop · source [197, 224)"
								src={src}
								trimBefore={197}
								trimAfter={224}
								playbackRate={0.7}
								loop
								muted
								objectFit="contain"
								style={{width: 240, height: 135}}
							/>
						</Sequence>
					</div>
				</div>
				<div style={{width: 240}}>
					<div>Source-frame reference</div>
					<div style={{height: 135, backgroundColor: '#080c14'}}>
						{frame >= 30 && frame < 120 ? (
							<Freeze frame={phaseSourceFrame}>
								<Video
									name="Partial loop reference"
									src={src}
									muted
									objectFit="contain"
									style={{width: 240, height: 135}}
								/>
							</Freeze>
						) : null}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
