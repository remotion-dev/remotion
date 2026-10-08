import React from 'react';
import {Sequence, Track, useCurrentFrame} from 'remotion';

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
				padding: 48,
				backgroundColor: '#141b24',
				color: '#eef3fa',
				fontFamily: 'Arial, sans-serif',
				fontSize: 24,
			}}
		>
			<div style={{fontSize: 36, fontWeight: 700, marginBottom: 16}}>
				Track Sequence props
			</div>
			<FrameClock label="Composition frame" />
			<div style={{fontSize: 20, color: '#acb8c8', marginTop: 16}}>
				Track: from 30, duration 90. Visible on composition frames 30–119.
			</div>
			<div
				style={{
					position: 'relative',
					height: 280,
					marginTop: 28,
					border: '1px solid #445164',
					borderRadius: 12,
					overflow: 'hidden',
				}}
			>
				<div style={{padding: 28, color: '#acb8c8'}}>
					Track content is absent before frame 30 and from frame 120 onward.
				</div>
				<Track name="Timed Track" from={30} durationInFrames={90}>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							padding: 28,
							backgroundColor: '#243345',
						}}
					>
						<FrameClock label="Track local frame" />
						<div style={{marginTop: 24}}>
							<Sequence name="Child A" durationInFrames={45} layout="none">
								<div style={{color: '#7de1c0', marginBottom: 12}}>
									Child A — Track frames 0–44
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
									Child B — starts at Track frame 45
								</div>
								<FrameClock label="Child B local frame" />
								<div style={{fontSize: 20, marginTop: 16}}>
									Its 90-frame duration is clipped when the Track ends.
								</div>
							</Sequence>
						</div>
					</div>
				</Track>
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
