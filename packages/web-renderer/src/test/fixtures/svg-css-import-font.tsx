import {useEffect, useState} from 'react';
import {AbsoluteFill, useDelayRender, useCurrentFrame} from 'remotion';

const bangers = new URL(
	'../../../../example/public/bangers.woff2',
	import.meta.url,
).href;
const roboto = new URL(
	'../../../../example/public/Roboto-Medium.ttf',
	import.meta.url,
).href;
const family = 'SVG imported WOFF2';
const nestedFamily = 'SVG nested imported TrueType';
const face = (name: string, url: string, format: string) =>
	`@font-face{font-family:"${name}";src:url("${url}") format("${format}")}`;

const Component = () => {
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [handle] = useState(() => delayRender('Loading imported CSS fonts'));
	const frame = useCurrentFrame();
	useEffect(() => {
		const urls: string[] = [];
		const cssUrl = (css: string) => {
			const url = URL.createObjectURL(new Blob([css], {type: 'text/css'}));
			urls.push(url);
			return url;
		};

		const nested = cssUrl(
			`@supports(display:grid){${face(nestedFamily, roboto, 'truetype')}}`,
		);
		const outer = cssUrl(
			`@import url("${nested}");${face(family, bangers, 'woff2')}`,
		);
		const inactive = cssUrl(
			face('SVG inactive imported face', roboto, 'truetype'),
		);
		const style = document.createElement('style');
		let active = true;
		style.textContent = `@import url("${outer}") (min-width:1000px);@import url("${inactive}") (max-width:1px);`;
		style.onload = () => {
			Promise.all([
				document.fonts.load(`36px "${family}"`),
				document.fonts.load(`36px "${nestedFamily}"`),
			])
				.then((faces) => {
					if (!active) return;
					if (
						faces.some(
							(list) => list.length !== 1 || list[0].status !== 'loaded',
						)
					) {
						cancelRender(new Error('Imported CSS font was not loaded'));
						return;
					}

					continueRender(handle);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
		};

		style.onerror = () => {
			if (active) cancelRender(new Error('Imported stylesheet failed to load'));
		};

		document.head.appendChild(style);

		return () => {
			active = false;
			style.remove();
			urls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [handle, continueRender, cancelRender]);
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<svg width={640} height={160}>
				<text
					x={12}
					y={54}
					style={{fontFamily: `"${family}"`, fontSize: 36 + frame * 2}}
				>
					Imported WOFF2 font
				</text>
				<text
					x={12}
					y={116}
					style={{fontFamily: `"${nestedFamily}"`, fontSize: 32 + frame * 2}}
				>
					Nested imported TrueType
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const svgCssImportFont = {
	component: Component,
	id: 'svg-css-import-font',
	width: 640,
	height: 160,
	fps: 30,
	durationInFrames: 2,
} as const;
