import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#fff',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<svg
				viewBox="0 0 200 80"
				style={{width: 200, height: 80}}
				xmlns="http://www.w3.org/2000/svg"
			>
				<text
					x="20"
					y="50"
					fontSize="30"
					fill="#000"
					aria-label={['B', 'R', 'A', 'V', 'O'].join('\u0003')}
				>
					BRAVO
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const issue8650SvgControlCharacter = {
	component: Component,
	id: 'issue-8650-svg-control-character',
	width: 400,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
