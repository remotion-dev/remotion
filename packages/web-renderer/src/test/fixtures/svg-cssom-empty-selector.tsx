import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgCssomEmptyModes = [
	'negative',
	'positive',
	'nested',
	'cache',
	'attribute-negative',
	'attribute-positive',
	'attribute-value',
] as const;
const url = new URL('../../../../example/public/bangers.woff2', import.meta.url)
	.href;
export const svgCssomEmptySelector = (
	mode: (typeof svgCssomEmptyModes)[number],
	literal: boolean,
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const svg = useRef<SVGSVGElement>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading CSSOM empty-selector font'),
		);
		useLayoutEffect(() => {
			if (mode === 'attribute-value')
				svg.current!.setAttribute('style', '--marker:ready');
			const style = svg.current!.querySelector('style')!;
			const sheet = style.sheet!;
			if (!literal) {
				const rule =
					mode === 'attribute-negative'
						? 'svg[style] > rect{fill:red}'
						: mode === 'attribute-positive'
							? 'svg:not([style]) > rect{fill:blue}'
							: mode === 'attribute-value'
								? `svg[style=${JSON.stringify(svg.current!.getAttribute('style'))}] > rect{fill:blue}`
								: mode === 'positive'
									? 'style:empty + rect{fill:blue}'
									: mode === 'cache'
										? `style:empty + rect{fill:${frame % 2 ? 'green' : 'blue'}}`
										: 'style:not(:empty) + rect{fill:red}';
				sheet.insertRule(
					mode === 'nested' ? `@supports(display:grid){${rule}}` : rule,
				);
				if (!style.matches(':empty'))
					throw new Error('CSSOM insertion changed authored DOM emptiness');
			}

			return () => {
				while (sheet.cssRules.length) sheet.deleteRule(0);
			};
		}, [frame]);
		useEffect(() => {
			let active = true;
			document.fonts
				.load('20px "SVG CSSOM empty-selector font"')
				.then((faces) => {
					if (!active) return;
					if (faces.length !== 1 || faces[0].status !== 'loaded')
						throw new Error('CSSOM selector font not loaded');
					continueRender(handle);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		const color = literal
			? mode === 'cache' && frame % 2
				? 'green'
				: 'blue'
			: mode === 'positive' ||
				  mode === 'attribute-positive' ||
				  mode === 'attribute-value'
				? 'red'
				: 'blue';
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{`@font-face{font-family:"SVG CSSOM empty-selector font";src:url("${url}") format("woff2")}`}</style>
				<svg ref={svg} width={120} height={60}>
					<style />
					<rect width={20} height={20} fill={color} />
					<style>{'/* Separate nonempty font carrier. */'}</style>
					<text
						x={4}
						y={48}
						style={{
							fontFamily: '"SVG CSSOM empty-selector font"',
							fontSize: 20,
						}}
					>
						Font
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-cssom-empty-${mode}${literal ? '-literal' : ''}`,
		width: 120,
		height: 60,
		fps: 30,
		durationInFrames: 3,
	} as const;
};
