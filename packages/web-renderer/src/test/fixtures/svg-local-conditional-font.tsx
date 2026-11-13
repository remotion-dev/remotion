import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgUseFontData} from './svg-use-data-font';

export const svgLocalConditionalFontGroups = [
	{
		name: 'media-active',
		prefix: '@media(min-width:0px){',
		suffix: '}',
		active: true,
		topPrefix: '',
		topSuffix: '',
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'media-inactive',
		prefix: '@media(min-width:100000px){',
		suffix: '}',
		active: false,
		topPrefix: '',
		topSuffix: '',
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'supports-active',
		prefix: '@supports(display:block){',
		suffix: '}',
		active: true,
		topPrefix: '',
		topSuffix: '',
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'supports-inactive',
		prefix: '@supports(display:no-such-value){',
		suffix: '}',
		active: false,
		topPrefix: '',
		topSuffix: '',
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'nested-media-supports',
		prefix: '@media(min-width:0px){@supports(display:block){',
		suffix: '}}',
		active: true,
		topPrefix: '',
		topSuffix: '',
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'nested-supports-media',
		prefix: '@supports(display:block){@media(min-width:0px){',
		suffix: '}}',
		active: true,
		topPrefix: '',
		topSuffix: '',
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'nested-inactive-outer',
		prefix: '@media(min-width:100000px){@supports(display:block){',
		suffix: '}}',
		active: false,
		topPrefix: '',
		topSuffix: '',
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'nested-inactive-inner',
		prefix: '@media(min-width:0px){@supports(display:no-such-value){',
		suffix: '}}',
		active: false,
		topPrefix: '',
		topSuffix: '',
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'media-all',
		prefix: '@media all{',
		suffix: '}',
		active: true,
		topPrefix: '',
		topSuffix: '',
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'layer-named',
		prefix: '@layer localB{',
		suffix: '}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'A-only',
	},
	{
		name: 'layer-anonymous',
		prefix: '@layer{',
		suffix: '}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'A-only',
	},
	{
		name: 'layer-media',
		prefix: '@layer localB{@media(min-width:0px){',
		suffix: '}}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'A-only',
	},
	{
		name: 'media-layer',
		prefix: '@media(min-width:0px){@layer localB{',
		suffix: '}}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'A-only',
	},
	{
		name: 'layer-supports',
		prefix: '@layer localB{@supports(display:block){',
		suffix: '}}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'A-only',
	},
	{
		name: 'supports-layer',
		prefix: '@supports(display:block){@layer localB{',
		suffix: '}}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'A-only',
	},
	{
		name: 'layer-predeclared-low-high',
		prefix: '@layer second{',
		suffix: '}',
		topPrefix: '@layer first,second;@layer first{',
		topSuffix: '}',
		active: true,
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'none',
	},
	{
		name: 'layer-predeclared-high-low',
		prefix: '@layer first{',
		suffix: '}',
		topPrefix: '@layer first,second;@layer second{',
		topSuffix: '}',
		active: true,
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'none',
	},
	{
		name: 'scope-matched',
		prefix: '@scope(svg){',
		suffix: '}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'scope-unmatched',
		prefix: '@scope(.never-matches){',
		suffix: '}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'container-match',
		prefix: '@container(min-width:0px){',
		suffix: '}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'container-no-match',
		prefix: '@container(min-width:100000px){',
		suffix: '}',
		topPrefix: '',
		topSuffix: '',
		active: true,
		expectedTopThenGroup: 'B',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
	{
		name: 'container-inactive-media',
		prefix: '@container(min-width:0px){@media(min-width:100000px){',
		suffix: '}}',
		topPrefix: '',
		topSuffix: '',
		active: false,
		expectedTopThenGroup: 'A',
		expectedGroupThenTop: 'A',
		snapshot: 'active-order',
	},
] as const;

export const svgLocalConditionalFontOrders = [
	'top-then-group',
	'group-then-top',
] as const;
export const getLocalConditionalFontRules = ({
	family,
	urls,
	group,
	order,
	literal,
}: {
	family: string;
	urls: string[];
	group: (typeof svgLocalConditionalFontGroups)[number];
	order: (typeof svgLocalConditionalFontOrders)[number];
	literal: 'A' | 'B' | null;
}) => {
	const face = (index: number) =>
		`@font-face{font-family:${JSON.stringify(family)};src:url("${urls[literal === null ? index : literal === 'A' ? 0 : 1]}");font-style:normal;font-weight:400}`;
	const top = group.topPrefix + face(0) + group.topSuffix;
	const grouped = group.prefix + face(1) + group.suffix;
	return order === 'top-then-group' ? top + grouped : grouped + top;
};

let instance = 0;
export const svgLocalConditionalFont = (
	group: (typeof svgLocalConditionalFontGroups)[number],
	order: (typeof svgLocalConditionalFontOrders)[number],
	literal: 'A' | 'B' | null,
) => {
	const family = `SVG local conditional ${++instance}`;
	const Component = () => {
		const frame = useCurrentFrame();
		const size = 38 + frame * 2;
		const [urls, setUrls] = useState<string[] | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading local conditional SVG fonts'),
		);
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
				.load(`${size}px ${JSON.stringify(family)}`, 'Review font')
				.then(() => document.fonts.ready)
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch(cancelRender);
			return () => {
				active = false;
			};
		}, [urls, size, continueRender, cancelRender, handle]);
		if (!urls) return null;
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg
					width={300}
					height={90}
					style={{display: 'block', backgroundColor: 'white'}}
				>
					<style>
						{getLocalConditionalFontRules({
							family,
							urls,
							group,
							order,
							literal,
						})}
					</style>
					<rect width={300} height={90} fill="white" />
					<text
						x={6 + frame * 3}
						y={56}
						style={{font: `${size}px ${JSON.stringify(family)}`, fill: 'black'}}
					>
						Review font
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		id: `svg-local-conditional-${group.name}-${order}`,
		component: Component,
		width: 300,
		height: 90,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
