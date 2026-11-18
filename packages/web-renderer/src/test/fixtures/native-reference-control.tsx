import {useCurrentFrame} from 'remotion';

const Component: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				width: 32,
				height: 24,
				background: `rgba(${80 + frame * 10}, 120, 160, ${frame === 0 ? 1 : 0.5})`,
			}}
		/>
	);
};

export const nativeReferenceControl = {
	component: Component,
	id: 'native-reference-control',
	width: 32,
	height: 24,
	fps: 30,
	durationInFrames: 2,
} as const;
