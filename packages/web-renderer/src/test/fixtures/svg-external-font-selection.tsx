import {loadFont} from '@remotion/fonts';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgExternalFontReady = Promise.all([
	loadFont({
		family: 'External SVG, class font',
		url: new URL('../../../../example/public/bangers.woff2', import.meta.url)
			.href,
		format: 'woff2',
	}),
	loadFont({
		family: 'Template-only registered face',
		url: new URL('../../../../example/public/bangers.woff2', import.meta.url)
			.href,
		format: 'woff2',
	}),
]);

export const SvgExternalFontSelection: React.FC<{styleType: string | null}> = ({
	styleType,
}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`.svg-font-from-external-css { font-family: "External SVG, class font"; font-size: ${40 + frame * 2}px; }`}</style>
			<svg width={600} height={320} viewBox="0 0 600 320">
				<style media={frame === 0 ? 'print' : 'screen'}>
					{
						'@namespace svg url("http://www.w3.org/2000/svg");svg|rect{fill:yellow}'
					}
				</style>
				<style>
					{
						'@namespace svg url("http://www.w3.org/2000/svg");svg|rect:nth-child(3){fill:red}'
					}
				</style>
				<rect width={20} height={20} />
				<defs>
					<path id="external-svg-text-path" d="M 12 194 L 580 194" />
					<text id="external-svg-use-template">Template inheritance</text>
					<text
						id="external-svg-explicit-template"
						style={{
							fontFamily: '"Template-only registered face"',
							fontSize: 24,
						}}
					>
						Template own font
					</text>
				</defs>
				<text className="svg-font-from-external-css" x={12} y={44}>
					External class selection
				</text>
				<g className="svg-font-from-external-css">
					<text x={12} y={94}>
						Inherited font selection
					</text>
				</g>
				<text x={12} y={144} style={{fontFamily: 'serif', fontSize: 30}}>
					Base{' '}
					<tspan className="svg-font-from-external-css">nested tspan</tspan>
				</text>
				<text>
					<textPath
						className="svg-font-from-external-css"
						href="#external-svg-text-path"
					>
						Text path selection
					</textPath>
				</text>
				<use
					href="#external-svg-use-template"
					x={12}
					y={250}
					style={{fontFamily: 'serif', fontSize: 30}}
				/>
				<use href="#external-svg-explicit-template" x={360} y={250} />
				<g style={{fontFamily: 'serif', fontSize: 24}}>
					<text id="external-svg-visible-template" x={12} y={300}>
						Visible template
					</text>
				</g>
				<use
					href="#external-svg-visible-template"
					x={270}
					y={0}
					style={{fontFamily: '"External SVG, class font"', fontSize: 30}}
				/>
				<style type={styleType ?? (frame === 0 ? 'text/css' : 'text/plain')}>
					{'/* Non-CSS style elements cannot carry font definitions. */'}
				</style>
			</svg>
		</AbsoluteFill>
	);
};

export const svgExternalFontSelection = {
	component: () => <SvgExternalFontSelection styleType={null} />,
	id: 'svg-external-font-selection',
	width: 600,
	height: 320,
	fps: 30,
	durationInFrames: 2,
} as const;

export const svgExternalCarrierModes = [
	'empty',
	'disabled-empty',
	'malformed-comment',
	'malformed-final-comment',
	'titled',
	'titled-empty',
	'cache',
	'media-empty',
	'media-all',
	'media-whitespace-all',
] as const;

export const svgExternalEmptyCarrier = ({
	mode,
	literal,
}: {
	mode: (typeof svgExternalCarrierModes)[number];
	literal: boolean;
}) => {
	const media =
		mode === 'media-empty'
			? ''
			: mode === 'media-all'
				? 'all'
				: mode === 'media-whitespace-all'
					? ' all '
					: undefined;
	const hasMediaOwner = media !== undefined;
	const titled = mode === 'titled' || mode === 'titled-empty';
	const Carrier = () => {
		const frame = useCurrentFrame();
		const first = useRef<HTMLStyleElement>(null);
		const last = useRef<HTMLStyleElement>(null);
		const markup = useRef<string | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading external SVG carrier font'),
		);
		useLayoutEffect(() => {
			const sheet = last.current?.sheet;
			if (!sheet) return;
			if (mode === 'disabled-empty') sheet.disabled = true;
			if (mode === 'cache') {
				const style = first.current!;
				style.closest('svg')!.setAttribute('style', '');
				style.textContent = Array.from(
					style.sheet!.cssRules,
					(rule) => rule.cssText,
				).join('');
				if (frame === 1)
					sheet.insertRule('@media not all {.unused-carrier {fill:red}}');
				const serialized = new XMLSerializer().serializeToString(
					style.closest('svg')!,
				);
				if (markup.current !== null && markup.current !== serialized) {
					throw new Error(
						'Only CSSOM state may change between carrier cache frames',
					);
				}

				markup.current = serialized;
			}

			return () => {
				while (sheet.cssRules.length) sheet.deleteRule(0);
				sheet.disabled = false;
			};
		}, [frame]);
		useEffect(() => {
			let active = true;
			svgExternalFontReady
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
				<svg width={300} height={100}>
					<style
						ref={first}
						media={media}
						title={titled && !literal ? 'a' : undefined}
					>
						{hasMediaOwner
							? 'rect{fill:red} style:empty + .empty-marker{fill:#1373ab} style[media] ~ .media-marker{fill:#1373ab}'
							: `${mode === 'titled' && !literal ? 'style[title="b"] + rect' : literal || mode === 'malformed-final-comment' || mode === 'titled' ? 'rect' : 'style:empty + rect'}{fill:#1373ab}${mode === 'malformed-comment' || mode === 'malformed-final-comment' ? (literal ? '/**/' : '/*') : ''}`}
					</style>
					{mode === 'malformed-final-comment' ? null : (
						<style
							ref={last}
							title={titled && !literal ? 'b' : undefined}
							media={titled && literal ? 'not all' : undefined}
						>
							{mode === 'titled' ? 'rect{fill:red}' : null}
						</style>
					)}
					<rect
						className={hasMediaOwner ? 'empty-marker' : undefined}
						width={20}
						height={20}
						style={hasMediaOwner && literal ? {fill: '#1373ab'} : undefined}
					/>
					{hasMediaOwner ? (
						<rect
							className="media-marker"
							x={40}
							width={20}
							height={20}
							style={literal ? {fill: '#1373ab'} : undefined}
						/>
					) : null}
					<text
						x={12}
						y={72}
						style={{fontFamily: '"External SVG, class font"', fontSize: 32}}
					>
						Carried font
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Carrier,
		id: `svg-external-carrier-${mode}${literal ? '-literal' : ''}`,
		width: 300,
		height: 100,
		fps: 30,
		durationInFrames: 3,
	} as const;
};

// Reuse the loaded SVG fixture font while isolating the authored media selector.
export const svgUnconditionalMediaFixture = ({
	media,
	literal,
	cssSource,
	literalFill,
}: {
	media: string | null;
	literal: boolean;
	cssSource: boolean;
	literalFill: string | null;
}) => {
	const family = cssSource
		? 'SVG unconditional CSS font'
		: 'External SVG, class font';
	const MediaComponent = () => {
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading unconditional SVG font'),
		);
		useEffect(() => {
			let active = true;
			document.fonts
				.load(`32px ${JSON.stringify(family)}`)
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
		}, [handle, delayRender, continueRender, cancelRender]);
		const frame = useCurrentFrame();
		const attributeSelector = `style[media="${CSS.escape(media ?? '')}"]`;
		const selector = literal ? 'rect' : `${attributeSelector} + rect`;
		const authoredStyle = useRef<HTMLStyleElement>(null);
		useLayoutEffect(() => {
			if (!literal && !authoredStyle.current!.matches(attributeSelector)) {
				throw new Error(
					'Authored media selector did not match its style element',
				);
			}
		}, [attributeSelector]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				{cssSource ? (
					<style>{`@font-face{font-family:${JSON.stringify(family)};src:url("${new URL('../../../../example/public/bangers.woff2', import.meta.url).href}") format("woff2")}`}</style>
				) : null}
				<svg width={300} height={100}>
					<style
						ref={authoredStyle}
						media={literal ? undefined : (media ?? undefined)}
					>{`${selector}{fill:${literal ? (literalFill ?? '#1373ab') : '#1373ab'}}`}</style>
					<rect width={20} height={20} />
					<text
						x={12}
						y={72}
						style={{fontFamily: JSON.stringify(family), fontSize: 32 + frame}}
					>
						Carried font
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: MediaComponent,
		id: `svg-unconditional-${cssSource ? 'css' : 'registered'}-${literal ? 'literal' : encodeURIComponent(media ?? 'omitted').replaceAll('%', '-') || 'empty'}`,
		width: 300,
		height: 100,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

export const svgExternalStyleSelectors = ({literal}: {literal: boolean}) => {
	const Fixture = () => {
		const frame = useCurrentFrame();
		const plain = '#1373ab';
		const styled = '#9a315d';
		const sibling = '#167547';
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{`.external-font-with-local-paint {font-family:"External SVG, class font";font-size:${34 + frame * 2}px}`}</style>
				<svg width={340} height={140}>
					{literal ? null : (
						<style>{`
							@namespace svg url("http://www.w3.org/2000/svg");
							svg|text:not([st\\79 le]) {fill:${plain}}
							text[data-remotion-authored-style] {fill:red}
							@media all {
								text[style*="letter-spacing"] {fill:${styled}}
								text[style*="font-family"] {fill:red}
							}
							text[style] + rect {fill:${sibling}}
							text[data-label="[style]"] {stroke:#000;stroke-width:1}
						`}</style>
					)}
					<text
						x={12}
						y={44}
						className="external-font-with-local-paint"
						fill={literal ? plain : undefined}
						data-label="[style]"
						stroke={literal ? '#000' : undefined}
						strokeWidth={literal ? 1 : undefined}
					>
						Unstyled font
					</text>
					<text
						x={12}
						y={98}
						className="external-font-with-local-paint"
						style={{letterSpacing: 1}}
						fill={literal ? styled : undefined}
					>
						Styled font
					</text>
					<rect
						x={8}
						y={112}
						width={24}
						height={16}
						fill={literal ? sibling : undefined}
					/>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: literal
			? 'svg-external-style-selectors-literal'
			: 'svg-external-style-selectors',
		width: 340,
		height: 140,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
