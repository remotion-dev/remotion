import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgDefinitionModes = [
	'unused',
	'dead-use',
	'direct',
	'use-target',
	'nested',
	'symbol',
	'cycle',
] as const;
export const svgDefinitionFontUrl = new URL(
	'../../../../example/public/bangers.woff2',
	import.meta.url,
).href;
export const svgDefinitionFont = ({
	mode,
	fontUrl,
}: {
	mode: (typeof svgDefinitionModes)[number];
	fontUrl: string;
}) => {
	const Fixture = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Loading definition font'));
		useEffect(() => {
			let active = true;
			document.fonts
				.load('24px "Definition review font"')
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
		const used =
			mode === 'direct' ||
			mode === 'use-target' ||
			mode === 'nested' ||
			mode === 'symbol';
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{`@font-face{font-family:"Definition review font";src:url("${fontUrl}") format("woff2")}`}</style>
				<svg width={320} height={100}>
					<defs>
						<text
							id="definition-review-text"
							x={8}
							y={35}
							style={{
								fontFamily: '"Definition review font"',
								fontSize: 24 + frame,
							}}
						>
							Definition font
						</text>
						<use id="definition-review-use" href="#definition-review-text" />
						<g id="definition-review-group">
							<use href="#definition-review-text" />
						</g>
						<symbol id="definition-review-symbol">
							<use href="#definition-review-group" />
						</symbol>
						{mode === 'dead-use' ? (
							<g>
								<use href="#definition-review-text" />
							</g>
						) : null}
						{mode === 'cycle' ? (
							<>
								<g id="definition-review-cycle-a">
									<use href="#definition-review-cycle-b" />
								</g>
								<g id="definition-review-cycle-b">
									<use href="#definition-review-cycle-a" />
									<use href="#definition-review-text" />
								</g>
							</>
						) : null}
					</defs>
					{used ? (
						<use
							href={
								mode === 'direct'
									? '#definition-review-text'
									: mode === 'use-target'
										? '#definition-review-use'
										: mode === 'nested'
											? '#definition-review-group'
											: '#definition-review-symbol'
							}
						/>
					) : null}
					<rect x={10 + frame} y={60} width={120} height={20} fill="#1373ab" />
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-definition-${mode}`,
		width: 320,
		height: 100,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

export const svgWildcardStyleModes = [
	'absent',
	'present',
	'value',
	'namespaced',
	'multiple-namespaces',
] as const;
export const svgWildcardStyle = ({
	mode,
	literal,
}: {
	mode: (typeof svgWildcardStyleModes)[number];
	literal: boolean;
}) => {
	const Fixture = () => {
		const host = useRef<HTMLDivElement>(null);
		const frame = useCurrentFrame();
		useLayoutEffect(() => {
			const attributes =
				mode === 'absent'
					? ''
					: mode === 'namespaced'
						? 'm:style="flag"'
						: mode === 'multiple-namespaces'
							? 'm:style="first" n:style="flag"'
							: 'style="letter-spacing:1px"';
			const selector =
				mode === 'absent'
					? 'text:not([*|style]) + rect'
					: mode === 'value'
						? 'text[*|style*="spacing"] + rect'
						: mode === 'namespaced' || mode === 'multiple-namespaces'
							? 'text[*|style="flag"] + rect'
							: 'text[*|style] + rect';
			const xml = new DOMParser().parseFromString(
				`<svg xmlns="http://www.w3.org/2000/svg" xmlns:m="urn:review-one" xmlns:n="urn:review-two" width="100" height="60">${literal ? '' : `<style>${selector}{fill:blue}</style>`}<text ${attributes} font-size="0">Label</text><rect x="${10 + frame}" y="10" width="70" height="40" fill="${literal ? 'blue' : 'red'}" /></svg>`,
				'image/svg+xml',
			);
			const container = host.current!;
			container.replaceChildren(xml.documentElement);
			return () => container.replaceChildren();
		}, [frame]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div ref={host} />
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-wildcard-style-${mode}${literal ? '-literal' : ''}`,
		width: 100,
		height: 60,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

export const svgPaintResourceFontSize = ({
	kind,
	inDefs,
	literal,
}: {
	kind: 'pattern' | 'mask';
	inDefs: boolean;
	literal: boolean;
}) => {
	const Component = () => {
		const text = (
			<text
				x={8}
				y={45}
				className="paint-resource-font-label"
				fontFamily="serif"
				fill={kind === 'mask' ? 'white' : 'black'}
				style={literal ? {fontSize: 32} : {}}
			>
				Resource
			</text>
		);
		const resource =
			kind === 'pattern' ? (
				<pattern
					id="paint-resource-font"
					patternUnits="userSpaceOnUse"
					width={160}
					height={70}
				>
					{text}
				</pattern>
			) : (
				<mask
					id="paint-resource-font"
					maskUnits="userSpaceOnUse"
					x={0}
					y={0}
					width={160}
					height={70}
				>
					{text}
				</mask>
			);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{'.paint-resource-font-label {font-size:32px}'}</style>
				<svg width={160} height={70}>
					{inDefs ? <defs>{resource}</defs> : resource}
					<rect
						width={160}
						height={70}
						fill={kind === 'pattern' ? 'url(#paint-resource-font)' : 'red'}
						mask={kind === 'mask' ? 'url(#paint-resource-font)' : undefined}
					/>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-paint-resource-font-${kind}-${inDefs ? 'defs' : 'root'}-${literal ? 'literal' : 'external'}`,
		width: 160,
		height: 70,
		fps: 30,
		durationInFrames: 1,
	} as const;
};
