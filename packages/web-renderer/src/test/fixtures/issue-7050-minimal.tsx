import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#222',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					transform: 'translate3d(0, 0, 0) scale(0.683158)',
				}}
			>
				<span
					style={{
						fontFamily: 'sans-serif',
						fontSize: 137.812,
						display: 'inline-block',
						backgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						fontWeight: 900,
						lineHeight: 0.9,
						textTransform: 'uppercase',
						backgroundImage:
							'linear-gradient(90deg, rgb(160, 216, 62) 0%, rgb(160, 216, 62) 100%)',
						whiteSpace: 'pre',
					}}
				>
					ordering
				</span>
			</div>
		</AbsoluteFill>
	);
};

export const issue7050Minimal = {
	component: Component,
	id: 'issue-7050-minimal',
	width: 800,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
