import {loadFont} from '@remotion/fonts';
import {useEffect, useState, useLayoutEffect, useRef} from 'react';
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

const Component: React.FC<{styleType?: string}> = ({styleType}) => {
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
					style={{fontFamily: 'monospace', fontSize: 30}}
				/>
				<style type={styleType ?? (frame === 0 ? 'text/css' : 'text/plain')}>
					{'/* Non-CSS style elements cannot carry font definitions. */'}
				</style>
			</svg>
		</AbsoluteFill>
	);
};

export const svgExternalFontSelection = {
	component: Component,
	id: 'svg-external-font-selection',
	width: 600,
	height: 320,
	fps: 30,
	durationInFrames: 2,
} as const;

// Reuse the loaded SVG fixture font while isolating the authored media selector.
export const svgUnconditionalMediaFixture = ({
	media,
	literal = false,
	cssSource = false,
	literalFill = '#1373ab',
}: {
	media?: string;
	literal?: boolean;
	cssSource?: boolean;
	literalFill?: string;
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
						media={literal ? undefined : media}
					>{`${selector}{fill:${literal ? literalFill : '#1373ab'}}`}</style>
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
