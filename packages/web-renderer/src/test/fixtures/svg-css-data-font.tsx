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

const Component = () => {
	const [url, setUrl] = useState(fontUrl);
	const [handle] = useState(() => delayRender('Loading CSS data font'));
	const frame = useCurrentFrame();
	useEffect(() => {
		dataFont.then(setUrl);
	}, []);
	useEffect(() => {
		if (!url) return;
		document.fonts
			.load('40px "SVG CSS data font"')
			.then(() => continueRender(handle));
	}, [handle, url]);
	if (!url) return null;
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`@font-face {font-family: "SVG CSS data font"; src:url("${url}") format("woff2");} .svg-data-font {font-family:"SVG CSS data font";font-size:${40 + frame * 2}px;}`}</style>
			<svg width={600} height={160}>
				<text x={12} y={54} className="svg-data-font">
					CSS data font selection
				</text>
				<g className="svg-data-font">
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
	height: 160,
	fps: 30,
	durationInFrames: 2,
} as const;
