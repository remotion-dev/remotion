import {loadFont} from '@remotion/fonts';
import {useLayoutEffect} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

let nextFamily = 0;
export const svgFontCaptureReadiness = () => {
	const family = `SVG capture readiness f${++nextFamily}`;
	const fontUrl =
		new URL('../../../../example/public/bangers.woff2', import.meta.url).href +
		`?capture-readiness=${nextFamily}`;
	let loading: Promise<void> | null = null;
	const Component = () => {
		const frame = useCurrentFrame();
		useLayoutEffect(() => {
			// The incumbent loader owns delayRender. No extra fixture delay can mask it.
			loading ??= loadFont({family, url: fontUrl, format: 'woff2'});
		}, []);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg data-capture-readiness={family} width={320} height={100}>
					<text
						x={12}
						y={55}
						fill="#1572ab"
						style={{
							fontFamily: `"${family}",monospace`,
							fontSize: 28 + frame * 6,
						}}
					>
						Review font
					</text>
					<rect
						x={12 + frame * 3}
						y={80}
						width={50}
						height={8}
						fill="#c34922"
					/>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		family,
		fontUrl,
		composition: {
			component: Component,
			id: `svg-capture-readiness-${nextFamily}`,
			width: 320,
			height: 100,
			fps: 30,
			durationInFrames: 3,
		} as const,
	};
};
