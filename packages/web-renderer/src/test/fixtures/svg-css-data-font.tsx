import {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	useCurrentFrame,
} from 'remotion';

const dataFont = fetch(
	new URL('../../../../example/public/bangers.woff2', import.meta.url),
)
	.then((response) => response.blob())
	.then(
		(blob) =>
			new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.readAsDataURL(blob);
			}),
	);

let fontUrl = '';
export const svgCssDataFontReady = dataFont.then((url) => {
	fontUrl = url;
});

const family = 'SVG, CSS "data" font';
const Component = () => {
	const [url, setUrl] = useState(fontUrl);
	const [handle] = useState(() => delayRender('Loading CSS data font'));
	const frame = useCurrentFrame();
	useEffect(() => {
		dataFont.then(setUrl);
	}, []);
	useEffect(() => {
		if (!url) return;
		Promise.all([
			document.fonts.load(`40px ${JSON.stringify(family)}`),
			document.fonts.load('26px "SVG template-only data face"'),
			document.fonts.load('40px "SVG selector font"'),
		]).then(() => continueRender(handle));
	}, [handle, url]);
	if (!url) return null;
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`@font-face {font-family: ${JSON.stringify(family)}; src:url("${url}") format("woff2");}@font-face{font-family:"SVG template-only data face";src:url("${url}") format("woff2")} .svg-data-font {font-family:${JSON.stringify(family)}, serif;font-size:${40 + frame * 2}px;}`}</style>
			<svg width={600} height={220}>
				<style media={frame === 0 ? 'print' : 'screen'}>
					{
						'@namespace svg url("http://www.w3.org/2000/svg");svg|rect{fill:yellow}'
					}
				</style>
				<style>{`@font-face{font-family:"SVG selector font";src:url("${url}") format("woff2")} rect:nth-child(3){fill:red}`}</style>
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
			</svg>
		</AbsoluteFill>
	);
};

export const svgCssDataFont = {
	component: Component,
	id: 'svg-css-data-font',
	width: 600,
	height: 220,
	fps: 30,
	durationInFrames: 2,
} as const;
