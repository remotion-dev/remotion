import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<div
				style={{
					borderRadius: 50,
					width: 200,
					height: 200,
				}}
			>
				<div
					style={{
						borderRadius: 10,
						backgroundColor: 'red',
						width: 200,
						height: 200,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const borderRadiusNested = {
	component: Component,
	id: 'border-radius-nested',
	width: 400,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
