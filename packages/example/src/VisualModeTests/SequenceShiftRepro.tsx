import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';

const LocalFrameDescendant = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			name="Local frame descendant"
			style={{opacity: interpolate(frame, [11, 21], [0, 1])}}
			from={1}
		/>
	);
};

const NestedLocalFrameDescendant = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			name="Nested local frame descendant"
			style={{opacity: interpolate(frame, [4, 14], [0, 1])}}
		/>
	);
};

export const SequenceShiftRepro = () => {
	// This hook runs outside the Sequence, so this is the composition frame.
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}} from={5}>
			<Sequence name="Shift parent" durationInFrames={30} from={2}>
				<AbsoluteFill
					name="Outer frame descendant"
					style={{
						backgroundColor: 'dodgerblue',
						translate: interpolate(frame, [17, 27], ['0px 0px', '500px 0px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				/>
				<LocalFrameDescendant />
				<Sequence name="Nested timing parent" durationInFrames={25} from={2}>
					<AbsoluteFill
						name="Nested outer frame descendant"
						style={{
							backgroundColor: 'hotpink',
							translate: interpolate(
								frame,
								[15, 25],
								['0px 0px', '300px 0px'],
								{
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					/>
					<NestedLocalFrameDescendant />
				</Sequence>
			</Sequence>
		</AbsoluteFill>
	);
};
