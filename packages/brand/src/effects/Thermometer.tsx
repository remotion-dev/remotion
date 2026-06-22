import {wave} from '@remotion/effects/wave';
import {waves} from '@remotion/effects/waves';
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {
	CanvasImage,
	HtmlInCanvas,
	Interactive,
	interpolate,
	Solid,
	staticFile,
	useCurrentFrame,
} from 'remotion';

import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {noise} from '@remotion/effects/noise';
import {shine} from '@remotion/effects/shine';

const fontFamily = 'GTPlanar';

loadFont({
	family: fontFamily,
	url: staticFile('GT Planar/GT-Planar-Bold.woff2'),
	weight: '700',
});

export const Thermometer: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Solid
				width={1080}
				height={1080}
				style={{
					position: 'absolute',
				}}
				color={'#ebebeb'}
				effects={[
					waves({
						colors: ['rgba(255, 255, 255, 0.31)', 'rgba(255, 255, 255, 0)'],
						thickness: 63.9,
						angle: 131,
					}),
					wave({}),
				]}
			/>
			<HtmlInCanvas
				style={{
					position: 'absolute',
					left: 72,
					top: 96,
					fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
					fontSize: 112,
					fontWeight: 700,
					lineHeight: 0.92,
					letterSpacing: '-0.04em',
					color: '#111111',
					whiteSpace: 'pre-line',
					transformOrigin: '0% 0%',
					scale: interpolate(frame, [0, 199], [1.08, 1.17], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
				width={500}
				height={220}
				pixelDensity={2}
				effects={[
					noise({
						amount: 0.23,
					}),
					shine({}),
				]}
			>
				<Interactive.Div
					style={{
						scale: 0.892,
						translate: '-23.7px -23.5px',
					}}
				>
					{'Rufus\nOyemade'}
				</Interactive.Div>
			</HtmlInCanvas>
			<CanvasImage
				src={staticFile('image 1.png')}
				style={{
					position: 'absolute',
					translate: '527.8px 205.3px',
					scale: interpolate(frame, [0, 199], [1.15, 1.32], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					transformOrigin: interpolate(
						frame,
						[0, 199],
						['50% 50%', '50% 50%'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
				width={445}
				height={819}
				effects={[
					chromaticAberration({
						amount: interpolate(frame, [34, 45, 76], [0, 17, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}),
				]}
			/>
		</>
	);
};
