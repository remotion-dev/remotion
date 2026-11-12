import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgUseFontData} from './svg-use-data-font';
export const svgPercentDataFontEncodings = [
	'percent-binary',
	'percent-base64',
] as const;
export const svgPercentDataFontUrls = (
	encoding: (typeof svgPercentDataFontEncodings)[number],
) =>
	svgUseFontData.then((urls) =>
		urls.map((url) => {
			const payload = url.slice(url.indexOf(',') + 1);
			if (encoding === 'percent-base64')
				return (
					url.slice(0, url.indexOf(',') + 1) +
					payload.replace(
						/[+/=]/g,
						(character) =>
							'%' + character.charCodeAt(0).toString(16).padStart(2, '0'),
					)
				);
			return (
				url.slice(0, url.indexOf(',')).replace(/;base64$/i, '') +
				',' +
				Array.from(
					atob(payload),
					(character) =>
						'%' + character.charCodeAt(0).toString(16).padStart(2, '0'),
				).join('')
			);
		}),
	);
let instance = 0;
export const svgPercentDataFont = (
	encoding: (typeof svgPercentDataFontEncodings)[number],
	preferred: 'A' | 'B',
	literalFont: 'A' | 'B' | null,
	fallback: boolean,
) => {
	const family = `SVG percent data font ${++instance}`;
	const Component = () => {
		const frame = useCurrentFrame();
		const size = 36 + frame * 2;
		const [urls, setUrls] = useState<string[] | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Loading titled SVG font'));
		const selected = fallback ? 'monospace' : family;
		useEffect(() => {
			let active = true;
			svgPercentDataFontUrls(encoding)
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
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch(cancelRender);
			return () => {
				active = false;
			};
		}, [urls, size, selected, continueRender, cancelRender, handle]);
		if (!urls) return null;
		const titles = ['A', 'B'];
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style title={preferred}>{'/* Preferred stylesheet set. */'}</style>
				<svg width={240} height={80}>
					{titles.map((title) => (
						<style
							key={title}
							title={title}
						>{`@font-face{font-family:${JSON.stringify(family)};src:url("${urls[(literalFont ?? title) === 'A' ? 0 : 1]}")}`}</style>
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
		id: `svg-percent-data-font-${encoding}-${preferred}`,
		component: Component,
		width: 240,
		height: 80,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
