import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgLocalFontDataReady} from './svg-local-font-order';

export const svgLayerFontModes = [
	'anonymous-named',
	'named-anonymous',
	'anonymous-anonymous',
	'named-named',
	'nested-anonymous',
	'media-anonymous',
	'supports-anonymous',
	'mixed-unlayered',
	'split-sheets',
	'cssom-face',
	'cssom-insert',
	'cssom-order',
	'cache',
] as const;

export const svgLayerFontIdentity = ({
	mode,
	literal,
}: {
	mode: (typeof svgLayerFontModes)[number];
	literal: boolean;
}) => {
	const Fixture = () => {
		const frame = useCurrentFrame();
		const [urls, setUrls] = useState<string[] | null>(null);
		const svg = useRef<SVGSVGElement>(null);
		const leading = useRef<HTMLStyleElement>(null);
		const middle = useRef<HTMLStyleElement>(null);
		const main = useRef<HTMLStyleElement>(null);
		const markup = useRef<string | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [initial] = useState(() =>
			delayRender('Loading layer identity fonts'),
		);
		const family = `SVG layer ${mode} ${literal ? 'literal' : 'source'}`;
		const named = `identity-last-${mode}`;
		const leadingId = `identity-empty-${mode}-${literal ? 'literal' : 'source'}`;
		const size = mode === 'cache' ? 34 : 34 + frame;
		const expectedFirst =
			mode === 'cssom-face' ||
			mode === 'cssom-insert' ||
			mode === 'cssom-order' ||
			(mode === 'cache' && frame === 0);
		useEffect(() => {
			let active = true;
			svgLocalFontDataReady
				.then((data) => {
					if (active) setUrls(data);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(initial);
			};
		}, [initial, continueRender, cancelRender]);
		useLayoutEffect(() => {
			if (!urls) return;
			const pending = delayRender('Waiting for CSSOM layer font');
			let active = true;
			const sheets = [
				leading.current!.sheet!,
				middle.current!.sheet!,
				main.current!.sheet!,
			];
			const original = sheets.map((sheet) =>
				Array.from(sheet.cssRules, (rule) => rule.cssText),
			);
			if (!literal) {
				if (mode === 'cssom-order') sheets[0].insertRule(`@layer ${named};`, 0);
				if (mode === 'cssom-insert')
					sheets[2].insertRule(
						`@layer identity-inserted{ @font-face{font-family:"${family}";src:url("${urls[0]}") format("woff2")} }`,
						sheets[2].cssRules.length,
					);
				if (mode === 'cssom-face' || mode === 'cache') {
					const layer = Array.from(sheets[2].cssRules).find(
						(rule) => 'name' in rule && rule.name === named,
					) as CSSGroupingRule;
					const index = Array.from(layer.cssRules).findIndex(
						(rule) => rule instanceof CSSFontFaceRule,
					);
					const useFirstSource = mode === 'cssom-face' || frame === 0;
					layer.deleteRule(index);
					layer.insertRule(
						`@font-face{font-family:"${family}";src:url("${urls[useFirstSource ? 0 : 1]}") format("${useFirstSource ? 'woff2' : 'truetype'}")}`,
						index,
					);
				}

				if (mode === 'cache') {
					svg.current!.setAttribute('style', '');
					const raw = new XMLSerializer().serializeToString(svg.current!);
					if (markup.current !== null && markup.current !== raw)
						throw new Error('Layer cache frames must differ only in CSSOM');
					markup.current = raw;
				}
			}

			continueRender(initial);
			document.fonts
				.load(`${size}px "${family}"`)
				.then((faces) => {
					if (!active) return;
					if (
						!faces.length ||
						faces.some((candidate) => candidate.status !== 'loaded')
					)
						throw new Error('Layer identity font did not load');
					continueRender(pending);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				if (!literal)
					sheets.forEach((sheet, index) => {
						while (sheet.cssRules.length) sheet.deleteRule(0);
						original[index].forEach((rule, position) =>
							sheet.insertRule(rule, position),
						);
					});
				continueRender(pending);
			};
		}, [
			urls,
			frame,
			size,
			family,
			named,
			initial,
			delayRender,
			continueRender,
			cancelRender,
		]);
		if (!urls) return null;
		const face = (index: number, weight: string | null) =>
			`@font-face{font-family:"${family}";src:url("${urls[index]}") format("${index === 0 ? 'woff2' : 'truetype'}");${weight ? `font-weight:${weight};` : ''}}`;
		const first = face(0, null);
		const second = face(1, null);
		const before = `@layer{${first}rect{fill:red}}`;
		const after = `@layer ${named}{${second}rect{fill:red}}`;
		const rules = literal
			? face(expectedFirst ? 0 : 1, null)
			: mode === 'named-anonymous'
				? `@layer identity-first{${first}}@layer{${second}}`
				: mode === 'anonymous-anonymous'
					? `${before}@layer{${second}}`
					: mode === 'named-named' || mode === 'cssom-face' || mode === 'cache'
						? `@layer identity-first{${first}}${after}`
						: mode === 'nested-anonymous'
							? `@layer identity-outer{${before}${after}}`
							: mode === 'media-anonymous'
								? `@media all{${before}}${after}`
								: mode === 'supports-anonymous'
									? `@supports(display:grid){${before}}${after}`
									: mode === 'mixed-unlayered'
										? `@supports(display:grid){${face(0, '700')}${before}rect{fill:red}}${after}`
										: mode === 'split-sheets'
											? after
											: `${before}${after}`;
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg ref={svg} width={380} height={100}>
					<style ref={leading} id={leadingId} />
					<rect
						className="empty-marker"
						x={10}
						y={65}
						width={120}
						height={20}
					/>
					<style ref={middle}>
						{!literal && mode === 'split-sheets' ? before : ''}
					</style>
					<style
						ref={main}
					>{`${rules}rect{fill:blue}.empty-marker{fill:red}#${leadingId}:empty+.empty-marker{fill:blue}`}</style>
					<text
						x={8}
						y={48}
						style={{fontFamily: JSON.stringify(family), fontSize: size}}
					>
						Layer identity font
					</text>
					<rect x={160} y={65} width={120} height={20} />
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-layer-identity-${mode}${literal ? '-literal' : ''}`,
		width: 380,
		height: 100,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
