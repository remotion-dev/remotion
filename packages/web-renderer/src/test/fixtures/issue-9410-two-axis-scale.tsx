import {AbsoluteFill} from 'remotion';

const Issue9410TwoAxisScale: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'rgb(255, 200, 100)',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					backgroundColor: 'rgb(255, 100, 100)',
					height: 400,
					scale: '0.967513 0.977461',
					width: 400,
				}}
			/>
		</AbsoluteFill>
	);
};

export const issue9410TwoAxisScale = {
	component: Issue9410TwoAxisScale,
	id: 'issue-9410-two-axis-scale',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
