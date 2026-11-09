import {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	useCurrentFrame,
} from 'remotion';

const bangers = new URL(
	'../../../../example/public/bangers.woff2',
	import.meta.url,
).pathname;
const roboto = new URL(
	'../../../../example/public/Roboto-Medium.ttf',
	import.meta.url,
).pathname;
const cases = [
	{family: 'SVG media font', label: 'Window media font'},
	{family: 'SVG supports font', label: 'Supports font selection'},
	{family: 'SVG nested media font', label: 'Supports then media font'},
	{family: 'SVG nested supports font', label: 'Media then supports font'},
] as const;
const face = (family: string, url: string, format: string) =>
	`@font-face{font-family:"${family}";src:url("${url}") format("${format}")}`;

const Component = () => {
	const [handle] = useState(() => delayRender('Loading conditional CSS fonts'));
	const frame = useCurrentFrame();
	useEffect(() => {
		Promise.all(
			cases.map(({family}) => document.fonts.load(`34px "${family}"`)),
		).then(() => continueRender(handle));
	}, [handle]);
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`
@media(min-width:900px){${face(cases[0].family, bangers, 'woff2')}}
@media(max-width:1px){${face(cases[0].family, roboto, 'truetype')}}
@supports(display:grid){${face(cases[1].family, roboto, 'truetype')}}
@supports(not-a-css-property:not-a-value){${face(cases[1].family, bangers, 'woff2')}}
@supports(display:grid){@media(min-width:900px){${face(cases[2].family, bangers, 'woff2')}}}
@supports(not-a-css-property:not-a-value){@media(min-width:900px){${face(cases[2].family, roboto, 'truetype')}}}
@media(min-width:900px){@supports(display:grid){${face(cases[3].family, roboto, 'truetype')}}}
@media(max-width:1px){@supports(display:grid){${face(cases[3].family, bangers, 'woff2')}}}
`}</style>
			<svg width={720} height={260}>
				{cases.map(({family, label}, index) => (
					<text
						key={family}
						x={12}
						y={50 + index * 60}
						style={{fontFamily: `"${family}"`, fontSize: 34 + frame * 2}}
					>
						{label}
					</text>
				))}
			</svg>
		</AbsoluteFill>
	);
};

// Window viewport is 1280px in tests; SVG viewport 720px must not select the font.
export const svgCssConditionalFont = {
	component: Component,
	id: 'svg-css-conditional-font',
	width: 720,
	height: 260,
	fps: 30,
	durationInFrames: 2,
} as const;
