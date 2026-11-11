import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const escapedStyleSelectorModes = [
	'hex',
	'simple',
	'suffix',
	'wildcard',
] as const;

export const svgEscapedStyleSelector = ({
	mode,
	literal,
}: {
	mode: (typeof escapedStyleSelectorModes)[number];
	literal: boolean;
}) => {
	const Fixture = () => {
		const frame = useCurrentFrame();
		const attribute =
			mode === 'simple'
				? 'data-remotion-authored-\\style'
				: 'data-remotion-\\61 uthored-style' + (mode === 'suffix' ? '-' : '');
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg width={100} height={60}>
					{literal ? null : (
						<style>
							{mode === 'wildcard'
								? 'text:not([*|style]) + rect {fill:blue}'
								: `
      text[style] + rect {fill:blue}
      ${mode === 'suffix' ? 'text[data-remotion-authored-style] + rect {fill:red}' : ''}
      text[${attribute}] + rect {fill:red}
     `}
						</style>
					)}
					<text
						style={mode === 'wildcard' ? undefined : {letterSpacing: 1}}
						fontSize={0}
					>
						Label
					</text>
					<rect
						x={10 + frame}
						y={10}
						width={70}
						height={40}
						fill={literal ? 'blue' : undefined}
					/>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-escaped-style-selector-${mode}${literal ? '-literal' : ''}`,
		width: 100,
		height: 60,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
