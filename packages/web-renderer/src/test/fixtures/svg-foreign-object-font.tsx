import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const svgForeignObjectFontReady = loadFont({
	family: 'Foreign object registered font',
	url: new URL('../../../../example/public/bangers.woff2', import.meta.url)
		.href,
	format: 'woff2',
});
const Component = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<svg width={720} height={200}>
				<foreignObject x={12} y={12} width={696} height={176}>
					<div
						style={{
							fontFamily: 'Foreign object registered font',
							fontSize: 38 + frame * 2,
							lineHeight: '48px',
							color: 'black',
						}}
					>
						Foreign object registered font
						<div>Nested HTML text</div>
					</div>
				</foreignObject>
			</svg>
		</AbsoluteFill>
	);
};

export const svgForeignObjectFont = {
	component: Component,
	id: 'svg-foreign-object-font',
	width: 720,
	height: 200,
	fps: 30,
	durationInFrames: 2,
} as const;
