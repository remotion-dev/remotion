import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#f6f4ee',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					color: '#8c8880',
					fontFamily: 'sans-serif',
					fontSize: 72,
					fontWeight: 600,
					lineHeight: 1.18,
					position: 'relative',
					transform: 'rotateX(-12deg) rotateY(-16deg) rotateZ(-3deg)',
				}}
			>
				<span>Thinking</span>
				<span
					style={{
						backgroundClip: 'text',
						backgroundImage:
							'linear-gradient(90deg, transparent 0%, transparent 34%, rgba(255, 255, 255, 0.8) 50%, transparent 66%, transparent 100%)',
						backgroundPosition: '86% 0',
						backgroundSize: '220% 100%',
						color: 'transparent',
						inset: 0,
						lineHeight: 1.18,
						position: 'absolute',
						WebkitBackgroundClip: 'text',
					}}
				>
					Thinking
				</span>
			</div>
		</AbsoluteFill>
	);
};

export const issue9736BackgroundPosition = {
	component: Component,
	durationInFrames: 1,
	fps: 30,
	height: 240,
	id: 'issue-9736-background-position',
	width: 480,
} as const;
