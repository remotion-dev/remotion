import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgExternalFontReady} from './svg-external-font-selection';

export const svgPrecomposeFontSources = ['registered', 'import'] as const;
export const svgPrecomposeFontEffects = [
	'none',
	'drop-shadow',
	'isolation',
	'blend',
	'mask',
] as const;

export const svgPrecomposePaintKinds = [
	'stroke',
	'text-shadow',
	'text-stroke',
	'text-stroke-tspan',
	'text-stroke-class',
	'marker',
	'filter',
	'css-filter',
	'transform',
	'view-box',
] as const;

export const svgPrecomposeFont = ({
	source,
	effect,
	literal,
	fontStep,
	paint,
}: {
	source: (typeof svgPrecomposeFontSources)[number];
	effect: (typeof svgPrecomposeFontEffects)[number];
	literal: boolean;
	fontStep: number | null;
	paint: (typeof svgPrecomposePaintKinds)[number] | null;
}) => {
	const step = fontStep ?? 3;
	const factor = paint === 'view-box' ? 2 : 1;
	const family =
		source === 'registered'
			? 'External SVG, class font'
			: 'SVG precompose imported font';
	const Component = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading precomposed SVG font'),
		);
		useEffect(() => {
			let active = true;
			let style: HTMLStyleElement | null = null;
			let url: string | null = null;
			const ready =
				source === 'registered'
					? svgExternalFontReady
					: new Promise<void>((resolve, reject) => {
							const font = new URL(
								'../../../../example/public/bangers.woff2',
								import.meta.url,
							).href;
							url = URL.createObjectURL(
								new Blob(
									[
										`@font-face{font-family:"${family}";src:url("${font}") format("woff2")}`,
									],
									{type: 'text/css'},
								),
							);
							style = document.createElement('style');
							style.textContent = `@import url("${url}");`;
							style.onload = () => {
								document.fonts
									.load(`40px "${family}"`)
									.then((faces) => {
										if (faces.length !== 1 || faces[0].status !== 'loaded')
											reject(
												new Error('Imported precompose font was not loaded'),
											);
										else resolve();
									})
									.catch(reject);
							};

							style.onerror = () =>
								reject(new Error('Precompose font import failed'));
							document.head.appendChild(style);
						});
			ready
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				style?.remove();
				if (url) URL.revokeObjectURL(url);
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);

		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{`
			.svg-precompose-font {font-family:monospace;font-size:20px}
			.svg-precompose-font:not([style]) text {font-family:"${family}";font-size:${(40 + frame * step) * factor}px}
			.svg-precompose-drop-shadow {filter:drop-shadow(3px 2px 0px #222)}
			.svg-precompose-isolation {isolation:isolate}
			.svg-precompose-blend {mix-blend-mode:multiply}
			.svg-precompose-mask {mask-image:linear-gradient(black,black)}
			.svg-precompose-paint-transform {transform:translate(7px,9px);transform-origin:0 0}
			.svg-precompose-paint-css-filter {filter:drop-shadow(3px 2px 0px #222)}
			`}</style>
				<svg
					className={`svg-precompose-font svg-precompose-${effect} svg-precompose-paint-${paint ?? 'none'}`}
					viewBox={paint === 'view-box' ? '0 0 640 200' : undefined}
					width={320}
					height={100}
				>
					{paint === 'text-stroke-class' ? (
						<style>
							{
								'.svg-precompose-paint-text-stroke-class text {-webkit-text-stroke:3px #1373ab}'
							}
						</style>
					) : null}
					{paint === 'marker' ? (
						<>
							<defs>
								<marker
									id="precompose-font-marker"
									markerUnits="userSpaceOnUse"
									markerWidth="30"
									markerHeight="20"
									refX="0"
									refY="10"
									orient="auto"
								>
									<path d="M0 0L30 10L0 20Z" fill="#1373ab" />
								</marker>
							</defs>
							<path
								d="M20 82L280 82"
								fill="none"
								markerEnd="url(#precompose-font-marker)"
							/>
						</>
					) : null}
					{paint === 'filter' ? (
						<defs>
							<filter
								id="precompose-font-filter"
								filterUnits="userSpaceOnUse"
								x="0"
								y="0"
								width="320"
								height="100"
							>
								<feOffset dx="8" dy="4" />
							</filter>
						</defs>
					) : null}
					<text
						x={12 * factor}
						y={62 * factor}
						stroke={paint === 'stroke' ? '#1373ab' : undefined}
						strokeWidth={paint === 'stroke' ? 6 : undefined}
						filter={
							paint === 'filter' ? 'url(#precompose-font-filter)' : undefined
						}
						style={
							literal || paint === 'text-shadow' || paint === 'text-stroke'
								? {
										...(literal
											? {
													fontFamily: `"${family}"`,
													fontSize: (40 + frame * step) * factor,
												}
											: {}),
										...(paint === 'text-shadow'
											? {textShadow: '3px 2px 0px #222'}
											: {}),
										...(paint === 'text-stroke'
											? {WebkitTextStroke: '3px #1373ab'}
											: {}),
									}
								: undefined
						}
					>
						{paint === 'text-stroke-tspan' ? (
							<tspan style={{WebkitTextStroke: '3px #1373ab'}}>
								SVG font capture
							</tspan>
						) : (
							'SVG font capture'
						)}
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-precompose-font-${source}-${effect}-step${step}-paint${paint ?? 'none'}${literal ? '-literal' : ''}`,
		width: 320,
		height: 100,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
