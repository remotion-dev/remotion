import {loadFont} from '@remotion/fonts';
import {useLayoutEffect} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const svgFontFamilyLifetimeFamily = 'SVG font family lifetime';
export const svgFontFamilyLifetimeUrl = new URL(
	'../../../../example/public/bangers.woff2',
	import.meta.url,
).href;
export const svgFontFamilyLifetimeReady = loadFont({
	family: svgFontFamilyLifetimeFamily,
	url: svgFontFamilyLifetimeUrl,
	format: 'woff2',
}).then(async () => {
	const [face] = await document.fonts.load(
		`32px "${svgFontFamilyLifetimeFamily}"`,
	);
	if (!face) throw new Error('Expected the loaded lifetime fixture font');
	return face;
});

export const SvgFontFamilyLifetimeScene = ({
	family,
}: {
	readonly family: string | null;
}) => (
	<svg width={680} height={100}>
		<rect width={680} height={100} fill="white" />
		<text
			x={12}
			y={72}
			style={{
				fontFamily:
					family === null ? 'serif' : `${JSON.stringify(family)},serif`,
				fontSize: 32,
			}}
		>
			Font ownership follows the native document
		</text>
	</svg>
);

const Component = () => {
	const frame = useCurrentFrame();
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	useLayoutEffect(() => {
		const handle = delayRender('Updating SVG font-family membership');
		let active = true;
		let ownedFace: FontFace | null = null;
		svgFontFamilyLifetimeReady
			.then((face) => {
				ownedFace = face;
				if (!active) return;
				if (frame === 1) document.fonts.delete(face);
				else document.fonts.add(face);
				continueRender(handle);
			})
			.catch((error) => {
				if (active) cancelRender(error);
			});
		return () => {
			active = false;
			if (ownedFace) document.fonts.add(ownedFace);
			continueRender(handle);
		};
	}, [frame, delayRender, continueRender, cancelRender]);
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<SvgFontFamilyLifetimeScene family={svgFontFamilyLifetimeFamily} />
		</AbsoluteFill>
	);
};

export const svgFontFamilyLifetime = {
	component: Component,
	id: 'svg-font-family-lifetime',
	width: 680,
	height: 100,
	fps: 30,
	durationInFrames: 3,
} as const;
