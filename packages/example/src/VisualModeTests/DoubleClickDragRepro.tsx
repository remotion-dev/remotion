import {AbsoluteFill, Sequence} from 'remotion';

export const DoubleClickDragChild = () => {
	return <AbsoluteFill style={{backgroundColor: 'seagreen'}} />;
};

export const DoubleClickDragRepro = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Sequence name="Double click drag target" from={2} durationInFrames={30}>
				<DoubleClickDragChild />
			</Sequence>
		</AbsoluteFill>
	);
};
