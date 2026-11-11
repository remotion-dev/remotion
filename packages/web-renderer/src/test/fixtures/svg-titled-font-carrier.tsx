import {loadFont} from '@remotion/fonts';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgFontMediaCache} from './svg-font-media-cache';

export const svgTitledFontModes = [
	'ab',
	'ba',
	'same-title',
	'trailing-empty',
	'media-active',
	'media-inactive',
	'media-all-inactive',
] as const;
export const svgTitledFontSources = ['registered', 'data'] as const;
const url = new URL('../../../../example/public/bangers.woff2', import.meta.url)
	.href;
const registered = loadFont({
	family: 'SVG titled registered font',
	url,
	format: 'woff2',
});
const dataFont = fetch(url)
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

export const svgTitledFontCarrier = (
	mode: (typeof svgTitledFontModes)[number],
	source: (typeof svgTitledFontSources)[number],
	literal: boolean,
	fallback: boolean,
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Loading titled SVG font'));
		const [data, setData] = useState<string | null>(null);
		const family = `SVG titled ${source} font`;
		useEffect(() => {
			let active = true;
			Promise.all([registered, dataFont])
				.then(([, font]) => {
					if (active) setData(font);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		useEffect(() => {
			if (data === null) return;
			let active = true;
			document.fonts
				.load(`34px "${family}"`)
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
			};
		}, [data, family, handle, continueRender, cancelRender]);
		const rule = data
			? `@font-face{font-family:"${family}";src:url("${data}") format("woff2")}`
			: '';
		const mediaMode = mode === 'media-active' || mode === 'media-inactive';
		const first = mode === 'ba' ? 'B' : 'A';
		const last = mode === 'same-title' ? first : first === 'A' ? 'B' : 'A';
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				{source === 'data' ? <style>{rule}</style> : null}
				<svg width={260} height={90}>
					{literal ? <style>{rule}</style> : null}
					<style
						title={first}
						media={
							mode === 'media-active'
								? '(min-width: 500px)'
								: mode === 'media-inactive' || mode === 'media-all-inactive'
									? '(max-width: 500px)'
									: undefined
						}
					>
						{'rect{fill:blue}style[title] ~ rect{stroke:green;stroke-width:2}'}
					</style>
					{mediaMode ? null : (
						<style
							title={last}
							media={
								mode === 'media-all-inactive'
									? '(max-width: 500px)'
									: frame === 0
										? ''
										: 'all'
							}
						>
							{
								'rect{fill:red}style[media="all"] ~ rect{stroke:purple;stroke-width:2}'
							}
						</style>
					)}
					{mode === 'trailing-empty' ? <style /> : null}
					<rect x={8} y={62} width={20 + frame * 8} height={16} />
					<text
						x={8 + frame * 4}
						y={44}
						style={{
							fontFamily: fallback ? 'monospace' : `"${family}"`,
							fontSize: 34,
						}}
					>
						Titled font
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-titled-${mode}-${source}${literal ? '-literal' : ''}${fallback ? '-fallback' : ''}`,
		width: 260,
		height: 90,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

export const svgTitledFontMediaCache = ({active}: {active: boolean | null}) => {
	const fixture = svgFontMediaCache({active});
	const Component = () => {
		const host = useRef<HTMLDivElement>(null);
		useLayoutEffect(() => {
			host.current!.querySelector('svg > style')?.setAttribute('title', 'A');
		}, []);
		return (
			<div ref={host}>
				<fixture.component />
			</div>
		);
	};

	return {
		...fixture,
		component: Component,
		id: `svg-titled-font-media-cache-${active === null ? 'query' : active ? 'active' : 'inactive'}`,
	} as const;
};
