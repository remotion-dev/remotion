import React from 'react';
import {
	AbsoluteFill,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const DurationReadout = ({label}: {label: string}) => {
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			{label}: {durationInFrames} frames
		</div>
	);
};

const ExpressionChild = ({label}: {label: string}) => {
	const {durationInFrames: duration} = useVideoConfig();
	const frame = useCurrentFrame();
	return (
		<Sequence
			name={label}
			durationInFrames={duration * 0.5}
			style={{
				position: 'relative',
				opacity: interpolate(frame, [0, duration - 1], [0, 1]),
			}}
		>
			<DurationReadout label={label} />
			<div
				data-testid={label}
				style={{width: 20, height: 20, backgroundColor: 'red'}}
			/>
		</Sequence>
	);
};

export const SourceSubscriptionChurn: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#eee', color: '#111', fontSize: 28}}>
		<Sequence name="Trim this parent" durationInFrames={300} layout="none">
			<DurationReadout label="Parent scope" />
			<Sequence name="Nested child 01" durationInFrames={180} layout="none">
				<DurationReadout label="Child 01" />
			</Sequence>
			<Sequence name="Nested child 02" durationInFrames={180} layout="none">
				<DurationReadout label="Child 02" />
			</Sequence>
			<Sequence name="Nested child 03" durationInFrames={180} layout="none">
				<DurationReadout label="Child 03" />
			</Sequence>
			<Sequence name="Nested child 04" durationInFrames={180} layout="none">
				<DurationReadout label="Child 04" />
			</Sequence>
			<Sequence name="Nested child 05" durationInFrames={180} layout="none">
				<DurationReadout label="Child 05" />
			</Sequence>
			<Sequence name="Nested child 06" durationInFrames={180} layout="none">
				<DurationReadout label="Child 06" />
			</Sequence>
			<Sequence name="Nested child 07" durationInFrames={180} layout="none">
				<DurationReadout label="Child 07" />
			</Sequence>
			<Sequence name="Nested child 08" durationInFrames={180} layout="none">
				<DurationReadout label="Child 08" />
			</Sequence>
			<ExpressionChild label="Expression A" />
		</Sequence>
		<Sequence name="Other parent" durationInFrames={400} layout="none">
			<ExpressionChild label="Expression B" />
		</Sequence>
		<Sequence name="Root control 01" durationInFrames={180} layout="none">
			<DurationReadout label="Root control 01" />
		</Sequence>
		<Sequence name="Root control 02" durationInFrames={180} layout="none">
			<DurationReadout label="Root control 02" />
		</Sequence>
	</AbsoluteFill>
);
