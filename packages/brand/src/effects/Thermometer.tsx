import {wave} from '@remotion/effects/wave';
import {waves} from '@remotion/effects/waves';
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {
	CanvasImage,
	Interactive,
	interpolate,
	Solid,
	staticFile,
	useCurrentFrame,
} from 'remotion';

import {chromaticAberration} from '@remotion/effects/chromatic-aberration';

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
				width={1280}
				height={720}
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
			<Interactive.Div
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
			>
				{'Rufus\nOyemade'}
			</Interactive.Div>
			<CanvasImage
				src={staticFile('image 1.png')}
				style={{
					position: 'absolute',
					translate: '716.4px 152.2px',
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
			/>
		</>
	);
};
