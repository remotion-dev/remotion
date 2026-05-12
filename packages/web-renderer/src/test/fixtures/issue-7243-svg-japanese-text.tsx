import {AbsoluteFill} from 'remotion';

/**
 * Minimal stand-in for Lottie text layers: inline SVG whose serialized XML
 * contains non-Latin-1 characters. Web renderer rasterizes SVG via
 * turnSvgIntoDrawable → btoa(serializedSvg), which throws for Unicode unless
 * encoded (see remotion#7243).
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
				<text x="10" y="50" fontSize="24" fill="#000">
					こんにちは Lottie
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const issue7243SvgJapaneseText = {
	component: Component,
	id: 'issue-7243-svg-japanese-text',
	width: 400,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
