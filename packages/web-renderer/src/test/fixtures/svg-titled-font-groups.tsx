import {useEffect, useState} from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame, useDelayRender} from 'remotion';
import {svgUseFontData} from './svg-use-data-font';
export const svgTitledFontGroupModes = ['local-ab', 'local-ba'] as const;
let instance = 0;
export const svgTitledFontGroup = (
	mode: (typeof svgTitledFontGroupModes)[number],
	literal: boolean,
	fallback: boolean,
) => {
	const family = `SVG titled font group ${++instance}`;
	const Component = () => {
		const frame = useCurrentFrame();
		const size = 36 + frame * 2;
		const [urls, setUrls] = useState<string[] | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Loading titled SVG font'));
		const selected = fallback ? 'monospace' : family;
		useEffect(() => {
			let active = true;
			svgUseFontData
				.then((data) => {
					if (active) setUrls(data);
				})
				.catch(cancelRender);
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [cancelRender, continueRender, handle]);
		useEffect(() => {
			if (!urls) return;
			let active = true;
			document.fonts
				.load(`${size}px ${JSON.stringify(selected)}`)
				.then(() => document.fonts.ready)
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch(cancelRender);
			return () => {
				active = false;
			};
		}, [urls, size, selected, continueRender, cancelRender, handle]);
		if (!urls) return null;
		const titles = mode === 'local-ab' ? ['A', 'B'] : ['B', 'A'];
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style title="A">{'/* Preferred stylesheet set. */'}</style>
				<svg width={240} height={80}>
					{titles.map((title) => (
						<style
							key={title}
							title={title}
						>{`@font-face{font-family:${JSON.stringify(family)};src:url("${urls[literal || title === 'A' ? 0 : 1]}")}`}</style>
					))}
					<text
						x={6 + frame * 4}
						y={44}
						style={{fontFamily: JSON.stringify(selected), fontSize: size}}
					>
						Review font
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		id: `svg-titled-font-group-${mode}`,
		component: Component,
		width: 240,
		height: 80,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

export const svgTitledFontCache = (literal: boolean, fallback: boolean) => {
	const fixture = svgTitledFontGroup('local-ab', literal, fallback);
	const Source = fixture.component;
	const Component = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender} = useDelayRender();
		useEffect(() => {
			const handle = delayRender('Separating cached SVG font frames');
			const id = requestAnimationFrame(() => {
				Promise.resolve().then(() => continueRender(handle));
			});
			return () => {
				cancelAnimationFrame(id);
				continueRender(handle);
			};
		}, [frame, delayRender, continueRender]);
		return (
			<AbsoluteFill data-svg-font-cache-frame={frame}>
				<Freeze frame={0}>
					<Source />
				</Freeze>
			</AbsoluteFill>
		);
	};

	return {
		...fixture,
		id: 'svg-titled-font-cache',
		component: Component,
		durationInFrames: 3,
	};
};
