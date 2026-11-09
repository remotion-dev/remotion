import {loadFont} from '@remotion/fonts';
import {useEffect, useState} from 'react';
import {AbsoluteFill, useDelayRender, useCurrentFrame} from 'remotion';

const dataFont = Promise.all(
	['bangers.woff2', 'Roboto-Medium.ttf'].map(async (file) => {
		const blob = await (
			await fetch(
				new URL(`../../../../example/public/${file}`, import.meta.url),
			)
		).blob();
		return new Promise<string>((resolve) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.readAsDataURL(blob);
		});
	}),
);
const registeredFont = loadFont({
	family: 'SVG mixed registered face',
	url: new URL('../../../../example/public/bangers.woff2', import.meta.url)
		.href,
	format: 'woff2',
});
let fontUrls: string[] | null = null;
export const svgCssDataFontReady = Promise.all([dataFont, registeredFont]).then(
	([urls]) => {
		fontUrls = urls;
	},
);

const family = 'SVG, CSS "data" font';
const Component = () => {
	const {delayRender, continueRender} = useDelayRender();
	const [urls, setUrls] = useState(fontUrls);
	const [handle] = useState(() => delayRender('Loading CSS data font'));
	const frame = useCurrentFrame();
	useEffect(() => {
		dataFont.then(setUrls);
	}, []);
	useEffect(() => {
		if (!urls) return;
		Promise.all([
			document.fonts.load(`40px ${JSON.stringify(family)}`),
			document.fonts.load('26px "SVG template-only data face"'),
			document.fonts.load('40px "SVG selector font"'),
			document.fonts.load('26px "SVG ordered data face"'),
			registeredFont,
		]).then(() => continueRender(handle));
	}, [handle, urls, continueRender]);
	if (!urls) return null;
	const url = urls[0];
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`@font-face {font-family: ${JSON.stringify(family)}; src:url("${url}") format("woff2");}@font-face{font-family:"SVG template-only data face";src:url("${url}") format("woff2")} .svg-data-font {font-family:${JSON.stringify(family)}, serif;font-size:${40 + frame * 2}px;}`}</style>
			<svg width={600} height={280}>
				<style media={frame === 0 ? 'print' : 'screen'}>
					{
						'@namespace svg url("http://www.w3.org/2000/svg");svg|rect{fill:yellow}'
					}
				</style>
				<style>{`@font-face{font-family:"SVG selector font";src:url("${url}") format("woff2")} @font-face{font-family:"SVG ordered data face";src:url("${url}")}@font-face{font-family:"SVG mixed registered face";src:url("${urls[1]}")}rect:nth-child(3){fill:red}`}</style>
				<rect width={20} height={20} />
				<defs>
					<text
						id="template-only-data-font"
						x={12}
						y={180}
						style={{
							fontFamily: '"SVG template-only data face"',
							fontSize: 26 + frame * 2,
						}}
					>
						Template own data font
					</text>
				</defs>
				<use href="#template-only-data-font" />
				<text x={12} y={54} className="svg-data-font">
					CSS data font selection
				</text>
				<g
					className="svg-data-font"
					style={{fontFamily: '"SVG selector font"'}}
				>
					<text x={12} y={114}>
						Inherited data font
					</text>
				</g>
				<text
					x={12}
					y={212}
					style={{
						fontFamily: '"SVG ordered data face"',
						fontSize: 26 + frame * 2,
					}}
				>
					Later document font wins
				</text>
				<text
					x={12}
					y={266}
					style={{
						fontFamily: '"SVG mixed registered face"',
						fontSize: 26 + frame * 2,
					}}
				>
					Registered face after CSS face
				</text>
			</svg>
			<style>{`@font-face{font-family:"SVG ordered data face";src:url("${urls[1]}")}`}</style>
		</AbsoluteFill>
	);
};

export const svgCssDataFont = {
	component: Component,
	id: 'svg-css-data-font',
	width: 600,
	height: 280,
	fps: 30,
	durationInFrames: 2,
} as const;
