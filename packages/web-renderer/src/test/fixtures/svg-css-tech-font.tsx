import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgFontTechModes = [
	'variations-format',
	'variations-only',
	'multiple-tech',
	'color-colrv1',
] as const;
export const svgFontTechQualifiers = {
	'variations-format': 'format("woff2") tech(variations)',
	'variations-only': 'tech(variations)',
	'multiple-tech': 'format("woff2") tech(variations, features-opentype)',
	'color-colrv1': 'format("woff2") tech(color-COLRv1)',
} as const;
let fontData: string | null = null;
export const svgCssTechFontReady = fetch(
	new URL('../../../../example/public/bangers.woff2', import.meta.url),
)
	.then((r) => r.blob())
	.then(
		(blob) =>
			new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(blob);
			}),
	)
	.then((data) => {
		fontData = data;
		return data;
	});
export const svgCssTechFont = ({
	mode,
	literal,
}: {
	mode: (typeof svgFontTechModes)[number];
	literal: 'self-contained' | 'fallback' | null;
}) => {
	const Fixture = () => {
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading qualified CSS data font'),
		);
		const [data, setData] = useState(fontData);
		const frame = useCurrentFrame();
		const family = literal === 'fallback' ? 'serif' : `SVG tech ${mode}`;
		const face = `@font-face{font-family:"${family}";src:url("${data}") ${svgFontTechQualifiers[mode]}}`;
		useEffect(() => {
			let active = true;
			svgCssTechFontReady
				.then((value) => {
					if (active) setData(value);
				})
				.catch(cancelRender);
			return () => {
				active = false;
			};
		}, [cancelRender]);
		useEffect(() => {
			if (!data) return;
			let active = true;
			document.fonts
				.load(`${34 + frame}px "${family}"`)
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch((error) => {
					if (!active) return;
					if (
						mode === 'color-colrv1' &&
						!CSS.supports('font-tech(color-COLRv1)')
					)
						continueRender(handle);
					else cancelRender(error);
				});
			return () => {
				active = false;
			};
		}, [data, family, frame, handle, continueRender, cancelRender]);
		if (!data) return null;
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				{literal === null ? (
					<style>
						{face +
							`.css-tech-label{font-family:"${family}";font-size:${34 + frame}px}`}
					</style>
				) : null}
				<svg width={300} height={70}>
					{literal === 'self-contained' ? <style>{face}</style> : null}
					<text
						x={8}
						y={48}
						className={literal === null ? 'css-tech-label' : undefined}
						style={
							literal !== null
								? {fontFamily: family, fontSize: 34 + frame}
								: undefined
						}
					>
						Qualified data font
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-css-tech-${mode}${literal ? '-' + literal : ''}`,
		width: 300,
		height: 70,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
