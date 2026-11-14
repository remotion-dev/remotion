import {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgAdoptedFontGroups = [
	'top',
	'media',
	'supports',
	'nested',
] as const;
const fontUrl = new URL(
	'../../../../example/public/bangers.woff2',
	import.meta.url,
).href;
const dataFont = fetch(fontUrl)
	.then((response) => response.blob())
	.then(
		(blob) =>
			new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(blob);
			}),
	);

export const svgAdoptedFont = ({
	group,
	literal,
}: {
	group: (typeof svgAdoptedFontGroups)[number];
	literal: boolean;
}) => {
	const Fixture = () => {
		const frame = useCurrentFrame();
		const svg = useRef<SVGSVGElement>(null);
		const family = `SVG adopted ${literal ? 'literal' : 'source'} ${group}`;
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Loading adopted SVG font'));
		useEffect(() => {
			const sheet = new CSSStyleSheet();
			let active = true;
			let local: SVGStyleElement | null = null;
			(async () => {
				const source = literal ? await dataFont : fontUrl;
				if (!active) return;
				const face = `@font-face{font-family:"${family}";src:url("${source}") format("woff2")}`;
				if (literal) {
					local = document.createElementNS(
						'http://www.w3.org/2000/svg',
						'style',
					);
					local.textContent = face;
					svg.current!.prepend(local);
				} else {
					const rules =
						group === 'media'
							? `@media all{${face}}`
							: group === 'supports'
								? `@supports(display:grid){${face}}`
								: group === 'nested'
									? `@media all{@supports(display:grid){${face}}}`
									: face;
					sheet.replaceSync(
						`${rules}.adopted-label-${group}{font-family:"${family}";font-size:${32 + frame}px}`,
					);
					document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
				}

				const faces = await document.fonts.load(`${32 + frame}px "${family}"`);
				if (!active) return;
				if (faces.length !== 1 || faces[0].status !== 'loaded')
					throw new Error('Adopted fixture font did not load');
				continueRender(handle);
			})().catch((error) => {
				if (active) cancelRender(error);
			});
			return () => {
				active = false;
				local?.remove();
				document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
					(candidate) => candidate !== sheet,
				);
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender, frame, family]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg ref={svg} width={340} height={100}>
					<text x={8} y={48}>
						<a
							className={`adopted-label-${group}`}
							style={
								literal
									? {fontFamily: JSON.stringify(family), fontSize: 32 + frame}
									: undefined
							}
						>
							Adopted font
						</a>
					</text>
					<rect x={10 + frame} y={65} width={120} height={20} fill="#1373ab" />
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-adopted-${group}${literal ? '-literal' : ''}`,
		width: 340,
		height: 100,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
