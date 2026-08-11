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
					overflow: 'hidden',
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

export const borderRadiusNestedOverflowHidden = {
	component: Component,
	id: 'border-radius-nested-overflow-hidden',
	width: 400,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
