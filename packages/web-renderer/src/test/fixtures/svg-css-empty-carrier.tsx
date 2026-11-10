import {loadFont} from '@remotion/fonts';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgCssEmptyCarrierModes = [
	'empty',
	'disabled-empty',
	'cache',
	'malformed-comment',
] as const;

const registeredFamily = 'SVG registered empty carrier font';
const url = new URL('../../../../example/public/bangers.woff2', import.meta.url)
	.href;
const registeredFontReady = loadFont({
	family: registeredFamily,
	url,
	format: 'woff2',
});

export const svgCssEmptyCarrierFixture = ({
	mode,
	literal,
	registered,
}: {
	mode: (typeof svgCssEmptyCarrierModes)[number];
	literal: boolean;
	registered: boolean;
}) => {
	const family = registered ? registeredFamily : 'SVG CSS empty carrier font';
	const Component = () => {
		const frame = useCurrentFrame();
		const first = useRef<HTMLStyleElement>(null);
		const markup = useRef<string | null>(null);
		const carrier = useRef<HTMLStyleElement>(null);
		const marker = useRef<SVGRectElement>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading SVG empty-carrier font'),
		);
		useLayoutEffect(() => {
			const sheet = carrier.current!.sheet!;
			if (registered && mode === 'cache') {
				const style = first.current!;
				style.closest('svg')!.setAttribute('style', '');
				style.textContent = Array.from(
					style.sheet!.cssRules,
					(rule) => rule.cssText,
				).join('');
			}

			if (mode === 'disabled-empty') sheet.disabled = true;
			if (mode === 'cache' && frame === 1)
				sheet.insertRule('@media not all {.unused-carrier {fill:red}}');
			if (registered && mode === 'cache') {
				const style = first.current!;
				const serialized = new XMLSerializer().serializeToString(
					style.closest('svg')!,
				);
				if (
					style.sheet!.cssRules.length !== 1 ||
					style.textContent !==
						Array.from(style.sheet!.cssRules, (rule) => rule.cssText).join(
							'',
						) ||
					sheet.cssRules.length !== (frame === 1 ? 1 : 0) ||
					(markup.current !== null && markup.current !== serialized)
				) {
					throw new Error(
						'Canonical carrier markup must stay unchanged when CSSOM rules change',
					);
				}

				markup.current = serialized;
			}

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
			(registered
				? registeredFontReady
				: document.fonts.load(`32px "${family}"`)
			)
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
				{registered ? null : (
					<style>{`@font-face{font-family:"${family}";src:url("${url}") format("woff2")}`}</style>
				)}
				<svg width={300} height={100}>
					<style
						ref={first}
					>{`${literal ? 'rect' : 'style:empty + rect'}{fill:#1373ab}${mode === 'malformed-comment' ? (literal ? '/**/' : '/*') : ''}`}</style>
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
		id: `svg-${registered ? 'registered' : 'css'}-empty-carrier-${mode}${literal ? '-literal' : ''}`,
		width: 300,
		height: 100,
		fps: 30,
		durationInFrames: 3,
	} as const;
};
