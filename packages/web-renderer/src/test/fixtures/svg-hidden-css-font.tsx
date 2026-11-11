import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const hiddenCssFontModes = [
	'text',
	'ancestor',
	'tspan',
	'anchor',
	'css',
	'nested-svg',
] as const;
type HiddenCssFontMode = (typeof hiddenCssFontModes)[number];
const url = new URL('../../../../example/public/bangers.woff2', import.meta.url)
	.href;
const hiddenCssFontFamily = 'SVG hidden CSS URL font';

const Component = ({
	mode,
	literal,
}: {
	readonly mode: HiddenCssFontMode;
	readonly literal: boolean;
}) => {
	const frame = useCurrentFrame();
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [handle] = useState(() =>
		delayRender('Loading hidden-label control font'),
	);
	useEffect(() => {
		document.fonts
			.load(`32px "${hiddenCssFontFamily}"`)
			.then(() => continueRender(handle))
			.catch(cancelRender);
	}, [handle, continueRender, cancelRender]);
	const label = (
		<text
			x={4}
			y={36}
			style={{
				fontFamily: hiddenCssFontFamily,
				fontSize: 32,
				display: mode === 'text' ? 'none' : undefined,
			}}
		>
			{mode === 'tspan' ? (
				<tspan style={{display: 'none'}}>Hidden label</tspan>
			) : mode === 'anchor' ? (
				<a style={{display: 'none'}}>Hidden label</a>
			) : (
				'Hidden label'
			)}
		</text>
	);
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`@font-face{font-family:"${hiddenCssFontFamily}";src:url("${url}") format("woff2")}`}</style>
			<svg width={160} height={60}>
				<rect x={8 + frame * 12} y={8} width={40} height={36} fill="blue" />
				{literal ? null : mode === 'ancestor' ? (
					<g style={{display: 'none'}}>
						<g style={{display: 'block'}}>{label}</g>
					</g>
				) : mode === 'css' ? (
					<>
						<style>{'.hidden-css-label{display:none!important}'}</style>
						<g className="hidden-css-label" style={{display: 'block'}}>
							{label}
						</g>
					</>
				) : mode === 'nested-svg' ? (
					<svg style={{display: 'none'}}>{label}</svg>
				) : (
					label
				)}
			</svg>
		</AbsoluteFill>
	);
};

export const svgHiddenCssFont = (mode: HiddenCssFontMode, literal: boolean) =>
	({
		component: () => <Component mode={mode} literal={literal} />,
		id: `svg-hidden-css-font-${mode}${literal ? '-literal' : ''}`,
		width: 160,
		height: 60,
		fps: 30,
		durationInFrames: 2,
	}) as const;
