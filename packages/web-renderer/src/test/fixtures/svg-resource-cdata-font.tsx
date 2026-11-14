import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgExternalFontReady} from './svg-external-font-selection';
import {svgUseFontData} from './svg-use-data-font';

export const svgResourceCdataModes = [
	'pattern-class',
	'mask-class',
	'cdata-direct',
	'cdata-anchor',
	'cdata-use',
	'cdata-registered',
] as const;
let instance = 0;

export const svgResourceCdataFont = (
	mode: (typeof svgResourceCdataModes)[number],
	literal: boolean,
	fallback: boolean,
) => {
	const family =
		mode === 'cdata-registered'
			? 'External SVG, class font'
			: `SVG review font ${mode} ${++instance}`;
	const Component = () => {
		const frame = useCurrentFrame();
		const host = useRef<HTMLDivElement>(null);
		const [urls, setUrls] = useState<string[] | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Loading SVG review fonts'));
		const selectedFamily = fallback ? 'monospace' : family;
		const size = 36 + frame * 2;

		useEffect(() => {
			let active = true;
			Promise.all([svgUseFontData, svgExternalFontReady])
				.then(([data]) => {
					if (active) setUrls(data);
				})
				.catch(cancelRender);
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		useLayoutEffect(() => {
			if (!mode.startsWith('cdata-') || !urls) return;
			const characters = literal ? 'Review font' : '<![CDATA[Review font]]>';
			const text =
				mode === 'cdata-anchor'
					? `<text x="${6 + frame * 4}" y="44"><a class="svg-review-font">${characters}</a></text>`
					: `<text x="${6 + frame * 4}" y="44" ${mode === 'cdata-use' ? `font-size="${size}"` : 'class="svg-review-font"'}>${characters}</text>`;
			const xml = new DOMParser().parseFromString(
				`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80">${mode === 'cdata-use' ? `<defs><g id="review-cdata-target">${text}</g></defs><use href="#review-cdata-target" style="font-family:&quot;${selectedFamily}&quot;"/>` : text}</svg>`,
				'image/svg+xml',
			);
			const container = host.current!;
			container.replaceChildren(xml.documentElement);
			return () => container.replaceChildren();
		}, [frame, selectedFamily, size, urls]);
		useEffect(() => {
			if (!urls) return;
			let active = true;
			document.fonts
				.load(`${size}px ${JSON.stringify(selectedFamily)}`)
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch(cancelRender);
			return () => {
				active = false;
			};
		}, [urls, handle, size, selectedFamily, continueRender, cancelRender]);
		if (!urls) return null;
		const face = (index: number) =>
			`@font-face{font-family:${JSON.stringify(family)};src:url("${urls[index]}")}`;

		const label = (
			<text
				x={6 + frame * 4}
				y={44}
				className={literal ? undefined : 'svg-review-font'}
				style={
					literal
						? {fontFamily: JSON.stringify(selectedFamily), fontSize: size}
						: undefined
				}
				fill={mode === 'mask-class' ? 'white' : 'blue'}
			>
				Review font
			</text>
		);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				{null}
				<style>{`${mode === 'cdata-registered' ? '' : face(0)}.svg-review-font{font-family:${JSON.stringify(selectedFamily)};font-size:${size}px}`}</style>
				{mode.startsWith('cdata-') ? (
					<div ref={host} />
				) : (
					<svg width={240} height={80}>
						{
							<>
								<defs>
									{mode === 'mask-class' ? (
										<mask
											id="review-font-mask"
											maskUnits="userSpaceOnUse"
											x={0}
											y={0}
											width={240}
											height={80}
										>
											{label}
										</mask>
									) : (
										<pattern
											id="review-font-pattern"
											patternUnits="userSpaceOnUse"
											width={240}
											height={80}
										>
											{label}
										</pattern>
									)}
								</defs>
								<rect
									width={240}
									height={80}
									fill={
										mode === 'mask-class' ? 'blue' : 'url(#review-font-pattern)'
									}
									mask={
										mode === 'mask-class' ? 'url(#review-font-mask)' : undefined
									}
								/>
							</>
						}
					</svg>
				)}
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-font-review-${mode}${literal ? '-literal' : ''}${fallback ? '-fallback' : ''}`,
		width: 240,
		height: 80,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
