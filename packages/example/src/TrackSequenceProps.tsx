import React from 'react';
import {AbsoluteFill, Sequence, Track, useCurrentFrame} from 'remotion';

const FrameClock: React.FC<{readonly label: string}> = ({label}) => {
	const frame = useCurrentFrame();

	return (
		<div style={{fontVariantNumeric: 'tabular-nums'}}>
			{label}: {frame}
		</div>
	);
};

export const TrackSequenceProps: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				padding: 32,
				backgroundColor: '#141b24',
				color: '#eef3fa',
				fontFamily: 'Arial, sans-serif',
				fontSize: 20,
			}}
		>
			<div style={{fontSize: 36, fontWeight: 700, marginBottom: 16}}>
				Track Sequence props
			</div>
			<FrameClock label="Composition frame" />
			<div style={{fontSize: 20, color: '#acb8c8', marginTop: 16}}>
				Track: from 30, trim 15, duration 90, speed 2. Visible on frames 30–74.
			</div>
			<div
				style={{
					position: 'relative',
					height: 260,
					marginTop: 28,
					border: '1px solid #445164',
					borderRadius: 12,
					overflow: 'hidden',
				}}
			>
				<Track
					name="Timed Track"
					from={30}
					trimBefore={15}
					playbackRate={2}
					durationInFrames={90}
				>
					<AbsoluteFill
						showInTimeline={false}
						className="track-sequence-container"
						style={{display: 'block', padding: 28, backgroundColor: '#243345'}}
					>
						<FrameClock label="Track local frame" />
						<div style={{marginTop: 24}}>
							<Sequence name="Child A" durationInFrames={45} layout="none">
								<div style={{color: '#7de1c0', marginBottom: 12}}>
									Child A — composition frames 30–44
								</div>
								<FrameClock label="Child A local frame" />
							</Sequence>
							<Sequence
								name="Child B clipped by Track"
								from={45}
								durationInFrames={90}
								layout="none"
							>
								<div style={{color: '#e8bf7d', marginBottom: 12}}>
									Child B — composition frames 45–74
								</div>
								<FrameClock label="Child B local frame" />
								<div style={{fontSize: 20, marginTop: 16}}>
									Its 90-frame duration is clipped when the Track ends.
								</div>
							</Sequence>
						</div>
					</AbsoluteFill>
				</Track>
			</div>
			<div style={{display: 'flex', gap: 20, marginTop: 20}}>
				<div style={{position: 'relative', width: 590, height: 140}}>
					<Track
						name="Looped Track (code only)"
						from={15}
						trimBefore={10}
						durationInFrames={30}
						playbackRate={2}
						loop
						width={590}
						height={140}
					>
						<AbsoluteFill
							showInTimeline={false}
							style={{
								display: 'block',
								padding: 20,
								backgroundColor: '#254a42',
							}}
						>
							<FrameClock label="Looped Track frame" />
							<Sequence
								name="Loop first half"
								durationInFrames={25}
								layout="none"
							>
								First half (local frames 10–24)
							</Sequence>
							<Sequence
								name="Loop second half"
								from={25}
								durationInFrames={15}
								layout="none"
							>
								Second half (local frames 25–39)
							</Sequence>
						</AbsoluteFill>
					</Track>
				</div>
				<div style={{position: 'relative', width: 590, height: 140}}>
					<Track
						name="Frozen Track (code only)"
						from={15}
						durationInFrames={90}
						freeze={20}
					>
						<AbsoluteFill
							showInTimeline={false}
							style={{
								display: 'block',
								padding: 20,
								backgroundColor: '#4a3c25',
							}}
						>
							<FrameClock label="Frozen Track frame" />
							<Sequence
								name="Frozen visible child"
								durationInFrames={30}
								layout="none"
							>
								Held inside the first child at frame 20.
							</Sequence>
							<Sequence name="Frozen inactive child" from={30} layout="none">
								This child should stay hidden.
							</Sequence>
						</AbsoluteFill>
					</Track>
				</div>
			</div>
			<div style={{marginTop: 28, fontSize: 20, color: '#acb8c8'}}>
				The hidden Track keeps its timeline header. Its red content stays
				hidden.
			</div>
			<Track name="Hidden Track" hidden>
				<Sequence name="Hidden child" durationInFrames={180} layout="none">
					<div style={{backgroundColor: '#b52f42', padding: 20, marginTop: 20}}>
						This content should be hidden.
					</div>
				</Sequence>
			</Track>
		</div>
	);
};
