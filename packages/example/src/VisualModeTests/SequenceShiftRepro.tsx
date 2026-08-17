import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';

export const SequenceShiftRepro = () => {
	// This hook runs outside the Sequence, so this is the composition frame.
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Sequence durationInFrames={30} from={-5}>
				<AbsoluteFill
					style={{
						backgroundColor: 'dodgerblue',
						translate: interpolate(frame, [10, 20], ['0px 0px', '500px 0px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};
