import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

const fontUrl = new URL(
	'../../../../example/public/bangers.woff2',
	import.meta.url,
).href;
const Component = () => {
	const frame = useCurrentFrame();
	const container = useRef<HTMLDivElement>(null);
	const {delayRender, continueRender} = useDelayRender();
	const [handle] = useState(() => delayRender('Loading CSS-only CDATA font'));
	useLayoutEffect(() => {
		const xml = new DOMParser().parseFromString(
			`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="140">
<rect width="360" height="140" fill="white"/>
<style title="a">/* Preferred carrier. */</style>
<text x="12" y="54" class="css-cdata-preview" style="font-size:${34 + frame}px"><a><![CDATA[CSS-only CDATA]]></a></text>
<text x="12" y="110" class="css-cdata-preview" style="font-size:${34 + frame}px">CSS-only text</text>
<style title="b">/* Inactive carrier. */</style>
</svg>`,
			'image/svg+xml',
		);
		const svg = document.importNode(xml.documentElement, true);
		container.current!.appendChild(svg);
		return () => svg.remove();
	}, [frame]);
	useEffect(() => {
		document.fonts
			.load('34px "CSS-only CDATA preview"')
			.then(() => continueRender(handle));
	}, [continueRender, handle]);
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`@font-face{font-family:"CSS-only CDATA preview";src:url("${fontUrl}") format("woff2")} .css-cdata-preview{font-family:"CSS-only CDATA preview";fill:#123456}`}</style>
			<div ref={container} />
		</AbsoluteFill>
	);
};

export const svgCssFontTextNodes = {
	component: Component,
	id: 'svg-css-font-text-nodes',
	width: 360,
	height: 140,
	fps: 30,
	durationInFrames: 2,
} as const;
