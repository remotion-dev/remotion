import {AbsoluteFill} from 'remotion';

export const EvenDimensionCropTest: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#0000ff'}}>
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: 1,
					backgroundColor: '#ff0000',
				}}
			/>
		</AbsoluteFill>
	);
};
