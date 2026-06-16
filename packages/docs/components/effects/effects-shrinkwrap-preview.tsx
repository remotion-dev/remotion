import {shrinkwrap} from '@remotion/effects/shrinkwrap';
import React from 'react';
import {AbsoluteFill, HtmlInCanvas} from 'remotion';

export const SHRINKWRAP_PREVIEW_PARAMS = {
	amount: 1,
	displacement: 6.5,
	highlightIntensity: 1.1,
	wrinkleDensity: 0.62,
	edgeTension: 0.72,
	seed: 8,
} as const;

const background: React.CSSProperties = {
	backgroundColor: '#5f6900',
};

const labelContainer: React.CSSProperties = {
	alignItems: 'center',
	justifyContent: 'center',
};

const label: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#d7ff20',
	borderRadius: 64,
	boxShadow: '0 26px 70px rgba(0, 0, 0, 0.32)',
	display: 'flex',
	flexDirection: 'column',
	height: 560,
	justifyContent: 'center',
	overflow: 'hidden',
	width: 900,
};

const headline: React.CSSProperties = {
	color: '#111111',
	fontFamily: 'Arial Black, Inter, Arial, Helvetica, sans-serif',
	fontSize: 118,
	fontWeight: 900,
	lineHeight: 0.88,
	textAlign: 'center',
	textTransform: 'uppercase',
};

const frame: React.CSSProperties = {
	border: '12px solid #111111',
	height: 230,
	marginTop: 30,
	position: 'relative',
	width: 560,
};

const innerText: React.CSSProperties = {
	color: '#111111',
	fontFamily: 'Arial Black, Inter, Arial, Helvetica, sans-serif',
	fontSize: 84,
	fontWeight: 900,
	lineHeight: 1,
	textAlign: 'center',
};

export const EffectsShrinkwrapPreview: React.FC<{
	readonly amount: number;
	readonly displacement: number;
	readonly highlightIntensity: number;
	readonly wrinkleDensity: number;
	readonly edgeTension: number;
	readonly seed: number;
}> = ({
	amount,
	displacement,
	highlightIntensity,
	wrinkleDensity,
	edgeTension,
	seed,
}) => {
	return (
		<AbsoluteFill style={background}>
			<HtmlInCanvas
				width={1280}
				height={720}
				effects={[
					shrinkwrap({
						amount,
						displacement,
						highlightIntensity,
						wrinkleDensity,
						edgeTension,
						seed,
					}),
				]}
			>
				<AbsoluteFill style={labelContainer}>
					<div style={label}>
						<div style={headline}>
							<div>Shrink</div>
							<div>wrap</div>
						</div>
						<div style={frame}>
							<AbsoluteFill style={labelContainer}>
								<div style={innerText}>PLASTIC</div>
							</AbsoluteFill>
						</div>
					</div>
				</AbsoluteFill>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};
