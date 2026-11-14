import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

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

export const svgLocalFontOrder = ({literal}: {literal: boolean}) => {
	const Component = () => {
		const [urls, setUrls] = useState<string[] | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading local fallback fonts'),
		);
		const frame = useCurrentFrame();
		useEffect(() => {
			let active = true;
			dataFonts
				.then((loaded) => {
					if (!active) return;
					setUrls(loaded);
				})
				.catch(cancelRender);
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		useEffect(() => {
			if (!urls) return;
			document.fonts
				.load('32px "SVG retained local fallback"')
				.then(() => continueRender(handle))
				.catch(cancelRender);
		}, [urls, handle, continueRender, cancelRender]);
		if (!urls) return null;
		const earlier = `@font-face{font-family:"SVG retained local fallback";src:url("${urls[0]}") format("woff2")}`;
		const laterSource = literal
			? `url("${urls[1]}") format("truetype")`
			: `url("${urls[1]}") format("truetype"),url("${urls[0]}") format("woff2")`;
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg width={380} height={80}>
					<style>{`${literal ? '' : earlier}@font-face{font-family:"SVG retained local fallback";src:${laterSource}}`}</style>
					<text
						x={12}
						y={52}
						style={{
							fontFamily: '"SVG retained local fallback"',
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
		id: literal ? 'svg-local-font-order-literal' : 'svg-local-font-order',
		width: 380,
		height: 80,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

export {dataFonts as svgLocalFontDataReady};
