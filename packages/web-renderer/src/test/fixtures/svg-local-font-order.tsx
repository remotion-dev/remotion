import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgLocalFontOrderModes = [
	'later-multiple',
	'earlier-multiple',
	'grouped',
	'split-sheet',
	'cssom',
	'cache',
] as const;
const dataFonts = Promise.all(
	['bangers.woff2', 'Roboto-Medium.ttf'].map(async (name) => {
		const blob = await (
			await fetch(
				new URL(`../../../../example/public/${name}`, import.meta.url),
			)
		).blob();
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(blob);
		});
	}),
);
let instance = 0;

export const svgLocalFontOrder = ({
	literal,
	mode,
	fallback,
}: {
	literal: boolean;
	mode: (typeof svgLocalFontOrderModes)[number];
	fallback: boolean;
}) => {
	const family = `SVG retained local data fallback ${mode} ${++instance}`;
	const Component = () => {
		const [urls, setUrls] = useState<string[] | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading local fallback fonts'),
		);
		const frame = useCurrentFrame();
		const style = useRef<HTMLStyleElement>(null);
		const earlier = urls
			? `@font-face{font-family:"${family}";src:url("${urls[0]}") format("woff2")${mode === 'earlier-multiple' ? `,url("${urls[1]}") format("truetype")` : ''}}`
			: '';
		const last = mode === 'cache' && frame === 1 ? 0 : 1;
		const format = last === 0 ? 'woff2' : 'truetype';
		const laterSource = urls
			? `url("${urls[last]}") format("${format}")${literal || mode === 'earlier-multiple' ? '' : `,url("${urls[0]}") format("woff2")`}`
			: '';
		const later = urls
			? `@font-face{font-family:"${family}";src:${laterSource}}`
			: '';
		useEffect(() => {
			let active = true;
			dataFonts
				.then((loaded) => {
					if (active) setUrls(loaded);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		useLayoutEffect(() => {
			if (mode !== 'cssom' || !urls) return;
			const sheet = style.current!.sheet!;
			if (!literal) sheet.insertRule(earlier, 0);
			sheet.insertRule(later, sheet.cssRules.length);
			return () => {
				while (sheet.cssRules.length) sheet.deleteRule(0);
			};
		}, [urls, earlier, later]);
		useEffect(() => {
			if (!urls) return;
			let active = true;
			const fontHandle = delayRender('Selecting local fallback face');
			document.fonts
				.load(`32px "${family}"`)
				.then(() => {
					if (active) {
						continueRender(fontHandle);
						continueRender(handle);
					}
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(fontHandle);
			};
		}, [urls, frame, handle, delayRender, continueRender, cancelRender]);
		if (!urls) return null;
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg width={380} height={80}>
					{mode === 'split-sheet' && !literal ? <style>{earlier}</style> : null}
					<style ref={style}>
						{mode === 'cssom'
							? ''
							: `${literal || mode === 'split-sheet' ? '' : earlier}${mode === 'grouped' ? `@media all{${later}}` : later}`}
					</style>
					<text
						x={12}
						y={52}
						style={{
							fontFamily: fallback ? 'monospace' : `"${family}"`,
							fontSize: 32 + frame * 2,
						}}
					>
						Retained fallback order
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-local-font-order-${mode}${literal ? '-literal' : ''}${fallback ? '-fallback' : ''}`,
		width: 380,
		height: 80,
		fps: 30,
		durationInFrames: 3,
	} as const;
};
