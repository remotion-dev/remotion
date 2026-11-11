import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const svgXmlMetadataModes = [
	'foreign-only',
	'mixed',
	'registered-foreign',
	'registered-mixed',
	'registered-foreign-object',
] as const;

export const svgXmlMetadata = ({
	mode,
	literal,
}: {
	mode: (typeof svgXmlMetadataModes)[number];
	literal: boolean;
}) => {
	const Fixture = () => {
		const host = useRef<HTMLDivElement>(null);
		const frame = useCurrentFrame();
		useLayoutEffect(() => {
			const registered = mode.startsWith('registered-');
			const xml = new DOMParser().parseFromString(
				`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:m="urn:metadata" xmlns:s="http://www.w3.org/2000/svg" width="100" height="60" font-family="${registered && !literal ? '&quot;External SVG, class font&quot;' : 'serif'}">
     ${literal ? '' : '<metadata><m:text>Description</m:text><m:tspan>Span metadata</m:tspan><m:textPath>Path metadata</m:textPath></metadata>'}
     ${mode === 'mixed' || mode === 'registered-mixed' ? '<text font-size="0">Real SVG text<tspan>Span</tspan></text><s:text font-size="0">Prefixed SVG text</s:text>' : ''}
     ${mode === 'registered-foreign-object' ? '<foreignObject width="100" height="1"><div xmlns="http://www.w3.org/1999/xhtml"><text style="font-size:0">HTML label</text></div></foreignObject>' : ''}
     ${registered && !literal ? `<style media="${mode === 'registered-foreign-object' ? 'all' : 'screen'}">style[media] + rect{fill:red}</style>` : ''}
     <rect x="${10 + frame}" y="10" width="70" height="40" fill="${registered && literal ? 'red' : 'blue'}" />
    </svg>`,
				'image/svg+xml',
			);
			const container = host.current!;
			container.replaceChildren(xml.documentElement);
			return () => {
				container.replaceChildren();
			};
		}, [frame]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div ref={host} />
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-xml-metadata-${mode}${literal ? '-literal' : ''}`,
		width: 100,
		height: 60,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
