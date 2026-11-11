import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const svgFontReviewCarrier = ({literal}: {literal: boolean}) => {
	const Fixture = () => {
		const frame = useCurrentFrame();
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg width={300} height={70}>
					<text
						x={8}
						y={48}
						style={{
							fontFamily: '"External SVG, class font"',
							fontSize: 34 + frame,
						}}
					>
						Carrier font
					</text>
					<style>{literal ? '/* Closed comment. */' : '/* EOF comment'}</style>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-font-review-carrier${literal ? '-literal' : ''}`,
		width: 300,
		height: 70,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
