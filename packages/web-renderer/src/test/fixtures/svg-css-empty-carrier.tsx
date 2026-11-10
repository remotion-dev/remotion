import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgCssEmptyCarrierModes = [
	'empty',
	'disabled-empty',
	'cache',
] as const;

export const svgCssEmptyCarrierFixture = ({
	mode,
	literal,
}: {
	mode: (typeof svgCssEmptyCarrierModes)[number];
	literal: boolean;
}) => {
	const family = 'SVG CSS empty carrier font';
	const url = new URL(
		'../../../../example/public/bangers.woff2',
		import.meta.url,
	).href;
	const Component = () => {
		const frame = useCurrentFrame();
		const carrier = useRef<HTMLStyleElement>(null);
		const marker = useRef<SVGRectElement>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading SVG empty-carrier font'),
		);
		useLayoutEffect(() => {
			const sheet = carrier.current!.sheet!;
			if (mode === 'disabled-empty') sheet.disabled = true;
			if (mode === 'cache' && frame === 1)
				sheet.insertRule('@media not all {.unused-carrier {fill:red}}');
			if (
				!carrier.current!.matches(':empty') ||
				getComputedStyle(marker.current!).fill !== 'rgb(19, 115, 171)'
			) {
				throw new Error(
					'Authored empty stylesheet must match the native CSS marker selector',
				);
			}

			return () => {
				while (sheet.cssRules.length) sheet.deleteRule(0);
				sheet.disabled = false;
			};
		}, [frame]);
		useEffect(() => {
			let active = true;
			document.fonts
				.load(`32px "${family}"`)
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{`@font-face{font-family:"${family}";src:url("${url}") format("woff2")}`}</style>
				<svg width={300} height={100}>
					<style>{`${literal ? 'rect' : 'style:empty + rect'}{fill:#1373ab}`}</style>
					<style ref={carrier} />
					<rect ref={marker} width={20} height={20} />
					<text x={12} y={72} style={{fontFamily: `"${family}"`, fontSize: 32}}>
						Carried font
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-css-empty-carrier-${mode}${literal ? '-literal' : ''}`,
		width: 300,
		height: 100,
		fps: 30,
		durationInFrames: 3,
	} as const;
};
