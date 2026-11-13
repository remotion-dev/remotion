import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgDefinitionModes = [
	'unused',
	'pattern',
	'mask',
	'clip-path',
	'pattern-chain',
	'root-mask',
	'root-clip-path',
	'filter-image',
	'missing-resource',
	'foreign-resource',
	'unused-pattern',
	'hidden-pattern',
	'dead-use',
	'direct',
	'use-target',
	'nested',
	'symbol',
	'cycle',
	'hidden-defs',
	'hidden-source-group',
	'hidden-target',
	'hidden-target-ancestor',
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
			mode === 'symbol' ||
			mode === 'hidden-defs' ||
			mode === 'hidden-source-group';
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{`@font-face{font-family:"Definition review font";src:url("${fontUrl}") format("woff2")}`}</style>
				{[
					'pattern',
					'mask',
					'clip-path',
					'pattern-chain',
					'root-mask',
					'root-clip-path',
					'filter-image',
					'missing-resource',
					'foreign-resource',
					'unused-pattern',
					'hidden-pattern',
				].includes(mode) ? (
					<svg
						width={320}
						height={100}
						mask={
							mode === 'root-mask'
								? 'url(#definition-resource-mask)'
								: undefined
						}
						clipPath={
							mode === 'root-clip-path'
								? 'url(#definition-resource-clip)'
								: undefined
						}
					>
						<defs>
							<pattern
								id="definition-resource-pattern"
								width={320}
								height={100}
								patternUnits="userSpaceOnUse"
							>
								<text
									x={8}
									y={35}
									style={{
										fontFamily: '"Definition review font"',
										fontSize: 24 + frame,
									}}
								>
									Definition font
								</text>
							</pattern>
							<pattern
								id="definition-resource-chain"
								href="#definition-resource-pattern"
							/>
							<filter
								id="definition-resource-filter"
								x="0"
								y="0"
								width="320"
								height="100"
								filterUnits="userSpaceOnUse"
							>
								<feImage
									href="#definition-resource-image-text"
									x="0"
									y="0"
									width="320"
									height="100"
								/>
							</filter>
							<text
								id="definition-resource-image-text"
								x={8}
								y={35}
								style={{
									fontFamily: '"Definition review font"',
									fontSize: 24 + frame,
								}}
							>
								Definition font
							</text>
							<mask
								id="definition-resource-mask"
								maskUnits="userSpaceOnUse"
								x={0}
								y={0}
								width={320}
								height={100}
							>
								<text
									x={8}
									y={35}
									fill="white"
									style={{
										fontFamily: '"Definition review font"',
										fontSize: 24 + frame,
									}}
								>
									Definition font
								</text>
							</mask>
							<clipPath id="definition-resource-clip">
								<text
									x={8}
									y={35}
									style={{
										fontFamily: '"Definition review font"',
										fontSize: 24 + frame,
									}}
								>
									Definition font
								</text>
							</clipPath>
						</defs>
						<rect
							width={300}
							height={50}
							fill={
								mode === 'pattern' || mode === 'hidden-pattern'
									? 'url(#definition-resource-pattern)'
									: mode === 'pattern-chain'
										? 'url(#definition-resource-chain)'
										: mode === 'missing-resource'
											? 'url(#missing-definition-resource)'
											: mode === 'foreign-resource'
												? 'url("data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22/%3E#definition-resource-pattern")'
												: '#1373ab'
							}
							filter={
								mode === 'filter-image'
									? 'url(#definition-resource-filter)'
									: undefined
							}
							mask={
								mode === 'mask' ? 'url(#definition-resource-mask)' : undefined
							}
							clipPath={
								mode === 'clip-path'
									? 'url(#definition-resource-clip)'
									: undefined
							}
							style={{display: mode === 'hidden-pattern' ? 'none' : undefined}}
						/>
						<rect
							x={10 + frame}
							y={60}
							width={120}
							height={20}
							fill="#1373ab"
						/>
					</svg>
				) : (
					<svg width={320} height={100}>
						<defs display={mode === 'hidden-defs' ? 'none' : undefined}>
							<g
								style={{
									display: mode === 'hidden-source-group' ? 'none' : undefined,
								}}
							>
								<text
									id="definition-review-text"
									x={8}
									y={35}
									style={{
										fontFamily: '"Definition review font"',
										fontSize: 24 + frame,
										display: mode === 'hidden-target' ? 'none' : undefined,
									}}
								>
									Definition font
								</text>
							</g>
							<use id="definition-review-use" href="#definition-review-text" />
							<g
								id="definition-review-group"
								style={{
									display:
										mode === 'hidden-target-ancestor' ? 'none' : undefined,
								}}
							>
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
						{used ||
						mode === 'hidden-target' ||
						mode === 'hidden-target-ancestor' ? (
							<use
								href={
									mode === 'direct' ||
									mode === 'hidden-defs' ||
									mode === 'hidden-source-group' ||
									mode === 'hidden-target'
										? '#definition-review-text'
										: mode === 'use-target'
											? '#definition-review-use'
											: mode === 'nested' || mode === 'hidden-target-ancestor'
												? '#definition-review-group'
												: '#definition-review-symbol'
								}
							/>
						) : null}
						<rect
							x={10 + frame}
							y={60}
							width={120}
							height={20}
							fill="#1373ab"
						/>
					</svg>
				)}
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
