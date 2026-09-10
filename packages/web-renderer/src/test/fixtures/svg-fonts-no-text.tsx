import {AbsoluteFill} from 'remotion';

/** An SVG with no text at all — `svgFonts` must never be consulted. */
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
				viewBox="0 0 100 40"
				style={{width: 100, height: 40}}
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect x="0" y="0" width="100" height="40" fill="#333" />
			</svg>
		</AbsoluteFill>
	);
};

export const svgFontsNoTextFixture = {
	component: Component,
	id: 'svg-fonts-no-text',
	width: 200,
	height: 100,
	fps: 30,
	durationInFrames: 1,
} as const;
