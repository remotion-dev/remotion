import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgPaintFontModes = [
	'pattern',
	'mask',
	'nested-mask',
	'href-pattern',
	'css-pattern',
	'stroke-pattern',
] as const;
const fontUrl = new URL(
	'../../../../example/public/bangers.woff2',
	import.meta.url,
).href;
export const svgPaintResourceFont = (
	mode: (typeof svgPaintFontModes)[number],
	literal: boolean,
	fallback: boolean,
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading SVG paint resource font'),
		);
		const [dataUrl, setDataUrl] = useState<string | null>(null);
		useEffect(() => {
			let active = true;
			Promise.all([
				document.fonts.load('36px "SVG paint resource font"'),
				fetch(fontUrl)
					.then((response) => response.blob())
					.then(
						(blob) =>
							new Promise<string>((resolve, reject) => {
								const reader = new FileReader();
								reader.onload = () => resolve(reader.result as string);
								reader.onerror = () => reject(reader.error);
								reader.readAsDataURL(blob);
							}),
					),
			])
				.then(([faces, data]) => {
					if (!active) return;
					if (faces.length !== 1 || faces[0].status !== 'loaded')
						throw new Error('Paint resource font not loaded');
					setDataUrl(data);
					continueRender(handle);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		const label = (
			<text
				x={6 + frame * 4}
				y={44}
				style={{
					fontFamily: fallback ? 'monospace' : '"SVG paint resource font"',
					fontSize: 36,
				}}
				fill={mode === 'mask' ? 'white' : 'blue'}
			>
				Paint font
			</text>
		);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{`@font-face{font-family:"SVG paint resource font";src:url("${fontUrl}") format("woff2")}`}</style>
				<svg width={240} height={80}>
					{literal && dataUrl ? (
						<style>{`@font-face{font-family:"SVG paint resource font";src:url("${dataUrl}") format("woff2")}`}</style>
					) : null}
					<defs>
						<pattern
							id="paint-font-pattern"
							patternUnits="userSpaceOnUse"
							width={240}
							height={80}
						>
							{label}
						</pattern>
						<pattern id="paint-font-alias" href="#paint-font-pattern" />
						<mask
							id="paint-font-mask"
							maskUnits="userSpaceOnUse"
							x={0}
							y={0}
							width={240}
							height={80}
						>
							{mode === 'nested-mask' ? (
								<rect width={240} height={80} fill="url(#paint-font-pattern)" />
							) : (
								label
							)}
						</mask>
					</defs>
					{mode === 'css-pattern' ? (
						<style>{'.paint-font-rect{fill:url("#paint-font-pattern")}'}</style>
					) : null}
					{mode === 'stroke-pattern' ? (
						<path
							d="M0 40H240"
							strokeWidth={80}
							stroke="url(#paint-font-pattern)"
						/>
					) : (
						<rect
							className="paint-font-rect"
							width={240}
							height={80}
							fill={
								mode === 'mask' ||
								mode === 'nested-mask' ||
								mode === 'css-pattern'
									? 'blue'
									: mode === 'href-pattern'
										? 'url(#paint-font-alias)'
										: 'url(#paint-font-pattern)'
							}
							mask={
								mode === 'mask' || mode === 'nested-mask'
									? 'url(#paint-font-mask)'
									: undefined
							}
						/>
					)}
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-paint-font-${mode}${literal ? '-literal' : ''}${fallback ? '-fallback' : ''}`,
		width: 240,
		height: 80,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
