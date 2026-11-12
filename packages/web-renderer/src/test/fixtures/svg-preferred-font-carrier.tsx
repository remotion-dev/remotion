import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgExternalFontReady} from './svg-external-font-selection';

export const svgPreferredFontModes = [
	'empty-first',
	'whitespace-first',
	'multiple-empty',
	'empty-only',
	'empty-selector',
	'cssom-empty',
	'wildcard-media',
	'wildcard-value',
	'namespaced-media',
	'null-namespace',
	'escaped-media',
] as const;
const fontData = fetch(
	new URL('../../../../example/public/bangers.woff2', import.meta.url),
)
	.then((r) => r.blob())
	.then(
		(blob) =>
			new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(blob);
			}),
	);
export const svgPreferredFontCarrier = ({
	mode,
	literal,
	fallback,
}: {
	mode: (typeof svgPreferredFontModes)[number];
	literal: boolean;
	fallback: boolean;
}) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const style = useRef<HTMLStyleElement>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Loading preferred-set font'));
		const [data, setData] = useState<string | null>(null);
		useEffect(() => {
			let active = true;
			Promise.all([svgExternalFontReady, fontData])
				.then(([, url]) => {
					if (active) setData(url);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		const wildcard =
			mode === 'wildcard-media' ||
			mode === 'wildcard-value' ||
			mode === 'namespaced-media' ||
			mode === 'null-namespace' ||
			mode === 'escaped-media';
		useLayoutEffect(() => {
			if (!data) return;
			const element = style.current!;
			if (mode === 'namespaced-media')
				element.setAttributeNS('urn:media', 'probe:media', 'authored');
			if (mode === 'cssom-empty')
				element.sheet!.insertRule(
					'style[title="a"]:empty ~ rect.marker{fill:#c83126}',
					0,
				);
			continueRender(handle);
			return () => {
				if (mode === 'namespaced-media')
					element.removeAttributeNS('urn:media', 'media');
				if (mode === 'cssom-empty')
					while (element.sheet?.cssRules.length) element.sheet.deleteRule(0);
			};
		}, [data, handle, continueRender]);
		if (!data) return null;
		const selectors =
			mode === 'wildcard-value'
				? 'style[*|media="screen"] + rect.marker'
				: mode === 'namespaced-media'
					? 'style[*|media="authored"] + rect.marker'
					: mode === 'null-namespace'
						? 'style[|media="screen"] + rect.marker'
						: mode === 'escaped-media'
							? 'style[m\\65 dia] + rect.marker'
							: 'style[*|media] + rect.marker';
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style title="a">
					{'/* Owning document preferred stylesheet set. */'}
				</style>
				<svg width={360} height={120}>
					{literal ? (
						<style>{`@font-face{font-family:"External SVG, class font";src:url("${data}") format("woff2")}`}</style>
					) : null}
					{wildcard ? (
						<>
							<text
								x={8 + frame * 3}
								y={46}
								style={{
									fontFamily: fallback
										? 'monospace'
										: '"External SVG, class font"',
									fontSize: 32,
								}}
							>
								Preferred font
							</text>
							<style
								ref={style}
								media="screen"
							>{`${selectors}{fill:#c83126}`}</style>
							<rect
								className="marker"
								x={12}
								y={72}
								width={120 + frame * 8}
								height={22}
								fill="#1373ab"
							/>
						</>
					) : (
						<>
							{mode === 'empty-selector' ? (
								<style>
									{'style[title="a"]:empty ~ rect.marker{fill:#c83126}'}
								</style>
							) : null}
							<style ref={style} title="a">
								{mode === 'whitespace-first' ? ' ' : ''}
							</style>
							{mode === 'multiple-empty' ? <style title="a" /> : null}
							{mode === 'empty-only' ? null : (
								<style title="b">{'rect.marker{fill:green}'}</style>
							)}
							<text
								x={8 + frame * 3}
								y={46}
								style={{
									fontFamily: fallback
										? 'monospace'
										: '"External SVG, class font"',
									fontSize: 32,
								}}
							>
								Preferred font
							</text>
							<rect
								className="marker"
								x={12}
								y={72}
								width={120 + frame * 8}
								height={22}
								fill="#1373ab"
							/>
						</>
					)}
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-preferred-font-${mode}${literal ? '-literal' : ''}${fallback ? '-fallback' : ''}`,
		width: 360,
		height: 120,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
