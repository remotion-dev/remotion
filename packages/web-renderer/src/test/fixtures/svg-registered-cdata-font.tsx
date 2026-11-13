import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {
	svgFontFamilyLifetimeFamily,
	svgFontFamilyLifetimeReady,
	svgFontFamilyLifetimeUrl,
} from './svg-font-family-lifetime';

export const registeredCdataWrappers = ['direct', 'anchor', 'tspan'] as const;
export const registeredCdataNodes = ['text', 'cdata', 'mixed'] as const;
let literalFont = '';
export const registeredCdataReady = Promise.all([
	svgFontFamilyLifetimeReady,
	fetch(svgFontFamilyLifetimeUrl).then(async (response) => {
		const bytes = new Uint8Array(await response.arrayBuffer());
		let binary = '';
		for (const byte of bytes) binary += String.fromCharCode(byte);
		literalFont = `data:font/woff2;base64,${btoa(binary)}`;
	}),
]);

export const registeredCdataMarkup = (
	wrapper: (typeof registeredCdataWrappers)[number],
	nodes: (typeof registeredCdataNodes)[number],
	frame: number,
	mode: 'registered' | 'literal' | 'fallback',
) => {
	const label = frame === 0 ? 'Label' : 'Wave';
	const characters =
		nodes === 'text'
			? label
			: nodes === 'cdata'
				? `<![CDATA[${label}]]>`
				: `${label.slice(0, 2)}<![CDATA[${label.slice(2)}]]>`;
	const family =
		mode === 'fallback' ? 'monospace' : svgFontFamilyLifetimeFamily;
	const style = `font-family:&quot;${family}&quot;;font-size:${32 + frame * 2}px;fill:#1373ab`;
	const content =
		wrapper === 'direct'
			? characters
			: `<${wrapper === 'anchor' ? 'a' : 'tspan'} style="${style}">${characters}</${wrapper === 'anchor' ? 'a' : 'tspan'}>`;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="90">${mode === 'literal' ? `<style>@font-face{font-family:"${family}";src:url(${literalFont}) format("woff2")}</style>` : ''}<text x="${20 + frame * 3}" y="60" style="${style}">${content}</text></svg>`;
};

export const svgRegisteredCdataFont = (
	wrapper: (typeof registeredCdataWrappers)[number],
	nodes: (typeof registeredCdataNodes)[number],
	mode: 'registered' | 'literal' | 'fallback',
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const host = useRef<HTMLDivElement>(null);
		const [ready, setReady] = useState(false);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading registered CDATA font'),
		);
		useEffect(() => {
			let active = true;
			registeredCdataReady
				.then(() => {
					if (active) {
						setReady(true);
					}
				})
				.catch(cancelRender);
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [cancelRender, continueRender, handle]);
		useLayoutEffect(() => {
			if (!ready) return;
			const svg = new DOMParser().parseFromString(
				registeredCdataMarkup(wrapper, nodes, frame, mode),
				'image/svg+xml',
			).documentElement;
			const container = host.current!;
			container.replaceChildren(document.adoptNode(svg));
			continueRender(handle);
			return () => container.replaceChildren();
		}, [continueRender, frame, handle, ready]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div ref={host} />
			</AbsoluteFill>
		);
	};

	return {
		id: `svg-registered-cdata-${wrapper}-${nodes}-${mode}`,
		component: Component,
		width: 220,
		height: 90,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
