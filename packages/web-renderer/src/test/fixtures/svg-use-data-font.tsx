import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
export const svgUseDataFontModes = [
	'inline',
	'attribute',
	'ancestor',
	'nested',
	'override',
	'explicit-target',
	'cache',
	'pattern',
	'mask',
	'hidden-defs',
] as const;
export const svgUseFontFamilies = [
	'SVG use data primary',
	'SVG use data override',
] as const;
export const svgUseFontData = Promise.all(
	['bangers.woff2', 'Roboto-Medium.ttf'].map(async (file) => {
		const blob = await (
			await fetch(
				new URL(`../../../../example/public/${file}`, import.meta.url),
			)
		).blob();
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(blob);
		});
	}),
);
export const svgUseDataFont = (
	mode: (typeof svgUseDataFontModes)[number],
	literal: boolean,
	fallback: boolean,
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Loading SVG use data fonts'));
		const [urls, setUrls] = useState<string[] | null>(null);
		useEffect(() => {
			let active = true;
			svgUseFontData
				.then((value) => {
					if (active) setUrls(value);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		useEffect(() => {
			if (!urls) return;
			let active = true;
			Promise.all(
				svgUseFontFamilies.map((family) =>
					document.fonts.load(`32px "${family}"`),
				),
			)
				.then((groups) => {
					if (!active) return;
					if (
						groups.some(
							(faces) =>
								!faces.length || faces.some((face) => face.status !== 'loaded'),
						)
					)
						throw new Error('SVG use font not loaded');
					continueRender(handle);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
			};
		}, [urls, handle, continueRender, cancelRender]);
		const primary = fallback
			? 'monospace'
			: svgUseFontFamilies[mode === 'cache' && frame % 2 ? 1 : 0];
		const override = fallback ? 'monospace' : svgUseFontFamilies[1];
		const rules = urls
			? svgUseFontFamilies
					.map(
						(family, index) =>
							`@font-face{font-family:"${family}";src:url("${urls[index]}")}`,
					)
					.join('')
			: '';
		const instance = (
			<use
				href={
					mode === 'nested' || mode === 'override'
						? '#use-font-chain'
						: '#use-font-label'
				}
				x={frame * 4}
				fontFamily={mode === 'attribute' ? primary : undefined}
				style={
					mode === 'attribute' || mode === 'ancestor'
						? undefined
						: {fontFamily: primary}
				}
			/>
		);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<style>{rules}</style>
				<svg width={260} height={90}>
					<defs display={mode === 'hidden-defs' ? 'none' : undefined}>
						<text
							id="use-font-label"
							x={4}
							y={44}
							style={{
								fontSize: 32,
								fontFamily: mode === 'explicit-target' ? override : undefined,
							}}
						>
							Use font
						</text>
						<g id="use-font-chain">
							<use
								href="#use-font-label"
								style={mode === 'override' ? {fontFamily: override} : undefined}
							/>
						</g>
						<pattern
							id="use-font-pattern"
							patternUnits="userSpaceOnUse"
							width={260}
							height={60}
						>
							<use
								href="#use-font-label"
								x={frame * 4}
								style={{fontFamily: primary}}
							/>
						</pattern>
						<mask
							id="use-font-mask"
							maskUnits="userSpaceOnUse"
							x={0}
							y={0}
							width={260}
							height={60}
						>
							<use
								href="#use-font-label"
								x={frame * 4}
								fill="white"
								style={{fontFamily: primary}}
							/>
						</mask>
					</defs>
					{mode === 'pattern' ? (
						<rect width={260} height={60} fill="url(#use-font-pattern)" />
					) : mode === 'mask' ? (
						<rect
							width={260}
							height={60}
							fill="blue"
							mask="url(#use-font-mask)"
						/>
					) : mode === 'ancestor' ? (
						<g style={{fontFamily: primary}}>{instance}</g>
					) : (
						instance
					)}
					<rect x={8 + frame} y={66} width={24} height={12} fill="#1373ab" />
					<style>{literal ? rules : '/* Local font carrier. */'}</style>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-use-font-${mode}${literal ? '-literal' : ''}${fallback ? '-fallback' : ''}`,
		width: 260,
		height: 90,
		fps: 30,
		durationInFrames: 3,
	} as const;
};
