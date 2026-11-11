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

export const svgCssDataCarrierModes = [
	'empty',
	'disabled-empty',
	'malformed-comment',
	'malformed-final-comment',
	'local-order',
	'authored-root',
	'cache',
	'media-empty',
	'media-all',
	'media-whitespace-all',
] as const;
type DataCarrierMode = (typeof svgCssDataCarrierModes)[number];
const carrierFamily = 'SVG data carrier, selector';
const DataCarrier = ({
	mode,
	literal,
}: {
	readonly mode: DataCarrierMode;
	readonly literal: boolean;
}) => {
	const {delayRender, continueRender} = useDelayRender();
	const [urls, setUrls] = useState(fontUrls);
	const [handle] = useState(() => delayRender('Loading CSS data carrier font'));
	const frame = useCurrentFrame();
	useEffect(() => {
		dataFont.then(setUrls);
	}, []);
	useEffect(() => {
		if (!urls) return;
		document.fonts
			.load(`36px ${JSON.stringify(carrierFamily)}`)
			.then(() => continueRender(handle));
	}, [handle, urls, continueRender]);
	if (!urls) return null;
	const media =
		mode === 'media-empty'
			? ''
			: mode === 'media-all'
				? 'all'
				: mode === 'media-whitespace-all'
					? ' \tALL\n '
					: undefined;
	const localOrder = mode === 'local-order';
	const finalComment = mode === 'malformed-final-comment';
	const fontSelector =
		mode === 'authored-root' && !literal
			? '.css-data-carrier-root:not([style]) .css-data-carrier-font'
			: '.css-data-carrier-font';
	const firstFace = `@font-face{font-family:${JSON.stringify(carrierFamily)};src:url("${urls[0]}") format("woff2")}`;
	const laterFace = `@font-face{font-family:${JSON.stringify(carrierFamily)};src:url("${urls[1]}") format("truetype")}`;
	const localFaces = localOrder
		? literal
			? laterFace
			: `${firstFace}@media all{${laterFace}}`
		: '';
	const marker = finalComment ? '.empty-marker' : 'style:empty + .empty-marker';
	const comment =
		mode === 'malformed-comment' || (finalComment && !literal) ? '/*' : '';
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`${localOrder ? '' : firstFace} .css-data-carrier-font{font-size:${36 + frame * 2}px} ${fontSelector}{font-family:${JSON.stringify(carrierFamily)}}`}</style>
			<svg className="css-data-carrier-root" width={600} height={180}>
				<style
					media={media}
				>{`${localFaces}rect{fill:red}${marker}{fill:blue}style[media] ~ .media-marker{fill:blue}${comment}`}</style>
				{finalComment ? null : (
					<style
						ref={(style) => {
							const sheet = style?.sheet;
							if (!sheet) return;
							sheet.disabled = mode === 'disabled-empty';
							while (sheet.cssRules.length) sheet.deleteRule(0);
							if (mode === 'cache' && frame === 1)
								sheet.insertRule('@media print{.empty-marker{fill:purple}}');
						}}
					/>
				)}
				<rect
					className="empty-marker"
					width={20}
					height={20}
					style={literal ? {fill: 'blue'} : undefined}
				/>
				<rect
					className="media-marker"
					x={40}
					width={20}
					height={20}
					style={
						literal ? {fill: media === undefined ? 'red' : 'blue'} : undefined
					}
				/>
				<text className="css-data-carrier-font" x={12} y={80}>
					CSS data carrier selection
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const svgCssDataEmptyCarrier = ({
	mode,
	literal,
}: {
	mode: DataCarrierMode;
	literal: boolean;
}) => ({
	component: () => <DataCarrier mode={mode} literal={literal} />,
	id: `svg-css-data-carrier-${mode}${literal ? '-literal' : ''}`,
	width: 600,
	height: 180,
	fps: 30,
	durationInFrames: 3,
});
