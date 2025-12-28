import {AbsoluteFill, Img, staticFile} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'black',
			}}
		>
			<AbsoluteFill
				style={{
					opacity: 0.18,
				}}
			>
				<AbsoluteFill
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						transform: 'rotateY(3.87957deg)',
					}}
				>
					<Img src={staticFile('shine.png')} style={{height: 165}} />
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const threeDTransformOpacity = {
	component: Component,
	id: 'three-d-transform-opacity',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
