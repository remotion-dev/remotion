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
const Component = () => {
	const [handle] = useState(() => delayRender('Loading CSS URL fonts'));
	const frame = useCurrentFrame();
	useEffect(() => {
		Promise.all([
			document.fonts.load('40px "SVG CSS URL WOFF2"'),
			document.fonts.load('40px "SVG CSS URL TTF"'),
		]).then(() => continueRender(handle));
	}, [handle]);
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`@font-face {font-family:"SVG CSS URL WOFF2";src:url("${bangers}") format("woff2");}@font-face {font-family:"SVG CSS URL TTF";src:url("${roboto}") format("truetype");}.svg-css-woff2 {font-family:"SVG CSS URL WOFF2";font-size:${40 + frame * 2}px}.svg-css-ttf {font-family:"SVG CSS URL TTF";font-size:${32 + frame * 2}px}`}</style>
			<svg width={640} height={220}>
				<text className="svg-css-woff2" x={12} y={52}>
					CSS URL WOFF2 selection
				</text>
				<g className="svg-css-woff2">
					<text x={12} y={112}>
						Inherited URL font
					</text>
				</g>
				<text className="svg-css-ttf" x={12} y={174}>
					TrueType URL <tspan>nested selection</tspan>
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const svgCssUrlFont = {
	component: Component,
	id: 'svg-css-url-font',
	width: 640,
	height: 220,
	fps: 30,
	durationInFrames: 2,
} as const;
