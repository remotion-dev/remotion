import {AbsoluteFill} from 'remotion';

/**
 * The <div> and the <svg> ask for the same family. An SVG is rasterized by
 * serializing it into an <img>, which cannot see the page's fonts, so without
 * `svgFonts` only the <svg> line falls back to a system face.
 */
const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#fff',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 10,
			}}
		>
			<div style={{fontFamily: 'Bangers, sans-serif', fontSize: 32}}>
				Hamburgefonstiv
			</div>
			<svg
				viewBox="0 0 300 44"
				style={{width: 300, height: 44}}
				xmlns="http://www.w3.org/2000/svg"
			>
				<text
					x="0"
					y="32"
					fill="#000"
					style={{fontFamily: 'Bangers, sans-serif', fontSize: 32}}
				>
					Hamburgefonstiv
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const svgFontsFixture = {
	component: Component,
	id: 'svg-fonts',
	width: 400,
	height: 160,
	fps: 30,
	durationInFrames: 1,
} as const;
