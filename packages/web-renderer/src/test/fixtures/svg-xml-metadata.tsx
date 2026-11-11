import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const svgXmlMetadataModes = ['foreign-only', 'mixed'] as const;

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
			const xml = new DOMParser().parseFromString(
				`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:m="urn:metadata" xmlns:s="http://www.w3.org/2000/svg" width="100" height="60">
     ${literal ? '' : '<metadata><m:text>Description</m:text><m:tspan>Span metadata</m:tspan><m:textPath>Path metadata</m:textPath></metadata>'}
     ${mode === 'mixed' ? '<text font-size="0">Real SVG text<tspan>Span</tspan></text><s:text font-size="0">Prefixed SVG text</s:text>' : ''}
     <rect x="${10 + frame}" y="10" width="70" height="40" fill="blue" />
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
