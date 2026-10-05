import React from 'react';
import {
	AbsoluteFill,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const DurationReadout: React.FC<{readonly label: string}> = ({label}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<div>
			<div style={{fontWeight: 'bold', marginBottom: 16}}>{label}</div>
			<div>Current local frame: {frame}</div>
			<div>Local duration: {durationInFrames}</div>
			<div>Remaining local frames: {durationInFrames - frame}</div>
		</div>
	);
};

export const TimelineMinimumDurationRepro: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#111827',
				color: 'white',
				fontFamily: 'sans-serif',
				fontSize: 28,
			}}
		>
			<div style={{padding: 40}}>
				Keep the playhead at frame 0 and drag either blue clip&apos;s right edge
				past frame 0. It must keep one visible timeline frame.
			</div>
			<Sequence
				name="Ancestor starts at -30"
				from={-30}
				durationInFrames={120}
				layout="none"
			>
				<Sequence
					name="Trim clipped child (minimum 31)"
					durationInFrames={60}
					style={{
						top: 160,
						left: 40,
						width: 1200,
						height: 220,
						padding: 28,
						backgroundColor: '#2563eb',
					}}
				>
					<DurationReadout label="1× parent: minimum duration 31, remaining 1" />
				</Sequence>
			</Sequence>
			<Sequence
				name="2× ancestor starts at -30"
				from={-30}
				durationInFrames={240}
				playbackRate={2}
				layout="none"
			>
				<Sequence
					name="Trim sped-up child (minimum 62)"
					durationInFrames={120}
					style={{
						top: 400,
						left: 40,
						width: 1200,
						height: 220,
						padding: 28,
						backgroundColor: '#2563eb',
					}}
				>
					<DurationReadout label="2× parent: minimum duration 62, remaining 2" />
				</Sequence>
			</Sequence>
		</AbsoluteFill>
	);
};
