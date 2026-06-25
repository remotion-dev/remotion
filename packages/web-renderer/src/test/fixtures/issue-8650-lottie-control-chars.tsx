import {AbsoluteFill} from 'remotion';

/**
 * Minimal stand-in for Lottie animated text layers: inline SVG whose
 * aria-label contains U+0003 (ETX) control characters — the separator
 * lottie-web injects between glyphs for animated text.
 * Web renderer rasterizes SVG via turnSvgIntoDrawable → data:image/svg+xml,
 * which fails if the serialized string contains XML 1.0 illegal control
 * characters (see remotion#8650).
 */
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
					x="10"
					y="50"
					fontSize="24"
					fill="#000"
					aria-label={'B\u0003R\u0003A\u0003V\u0003O'}
				>
					BRAVO
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const issue8650LottieControlChars = {
	component: Component,
	id: 'issue-8650-lottie-control-chars',
	width: 400,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
