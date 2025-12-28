import {AbsoluteFill, Img, staticFile} from 'remotion';

export const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: 'black',
			}}
		>
			<div
				style={{
					transform: 'rotateY(22deg)',
				}}
			>
				<Img src={staticFile('PinkHighlight.png')} />
			</div>
		</AbsoluteFill>
	);
};

export const transparentImage = {
	component: Component,
	id: 'transparent-image',
	width: 1080,
	height: 1080,
	durationInFrames: 1,
	fps: 30,
};
