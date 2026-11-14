import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgLocalFontDataReady} from './svg-local-font-order';

export const svgLocalFontGroups = [
	'media',
	'supports',
	'nested',
	'layer',
	'layer-anonymous',
	'layer-nested',
	'nested-layer',
	'inactive',
] as const;
export const svgGroupedFontOrder = ({
	group,
	literal,
}: {
	group: (typeof svgLocalFontGroups)[number];
	literal: boolean;
}) => {
	const Fixture = () => {
		const [urls, setUrls] = useState<string[] | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Loading grouped SVG fonts'));
		const frame = useCurrentFrame();
		const family = `SVG local ordered ${group}`;
		useEffect(() => {
			let active = true;
			svgLocalFontDataReady
				.then((data) => {
					if (active) setUrls(data);
				})
				.catch(cancelRender);
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		useEffect(() => {
			if (!urls) return;
			let active = true;
			document.fonts
				.load(`34px "${family}"`)
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch(cancelRender);
			return () => {
				active = false;
			};
		}, [urls, family, handle, continueRender, cancelRender]);
		if (!urls) return null;
		const earlier = `@font-face{font-family:"${family}";src:url("${urls[0]}") format("woff2")}`;
		const later = `@font-face{font-family:"${family}";src:url("${urls[1]}") format("truetype")}rect{fill:red}`;
		const wrapped =
			group === 'media'
				? `@media all{${later}}`
				: group === 'supports'
					? `@supports(display:grid){${later}}`
					: group === 'nested'
						? `@media all{@supports(display:grid){${later}}}`
						: group === 'layer-anonymous'
							? `@layer{${later}}`
							: group === 'layer-nested'
								? `@layer svg-font-order{@media all{${later}}}`
								: group === 'nested-layer'
									? `@media all{@layer svg-font-order{${later}}}`
									: group === 'inactive'
										? `@media not all{${later}}`
										: `@layer svg-font-order{${later}}`;
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg width={380} height={100}>
					<style>{`${literal && group !== 'inactive' && !group.includes('layer') ? '' : earlier}${literal && group.includes('layer') ? '' : wrapped}rect{fill:blue}`}</style>
					<text
						x={8}
						y={48}
						style={{
							fontFamily: JSON.stringify(family),
							fontSize: 34 + frame * 2,
						}}
					>
						Grouped local font
					</text>
					<rect x={10} y={65} width={120} height={20} />
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-grouped-font-order-${group}${literal ? '-literal' : ''}`,
		width: 380,
		height: 100,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

const url = new URL('../../../../example/public/bangers.woff2', import.meta.url)
	.href;
export const svgFontBeforeMutation = ({literal}: {literal: boolean}) => {
	const Fixture = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading root-selector URL font'),
		);
		useEffect(() => {
			let active = true;
			document.fonts
				.load('34px "SVG root predicate font"')
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch(cancelRender);
			return () => {
				active = false;
			};
		}, [handle, continueRender, cancelRender]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{`@font-face{font-family:"SVG root predicate font";src:url("${url}") format("woff2")}svg[data-root-font]:not([style]) text{font-family:"SVG root predicate font";font-size:${34 + frame * 2}px}`}</style>
				<svg data-root-font="true" width={380} height={80}>
					<text
						x={8}
						y={48}
						style={
							literal
								? {
										fontFamily: '"SVG root predicate font"',
										fontSize: 34 + frame * 2,
									}
								: undefined
						}
					>
						Before SVG mutations
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-font-before-mutation${literal ? '-literal' : ''}`,
		width: 380,
		height: 80,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
