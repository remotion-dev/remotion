import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {Interactive, Easing, interpolate, useCurrentFrame} from 'remotion';

const MotionBlurTransitionCaptureContent = () => {
	const frame = useCurrentFrame();

	return (
		<>
			<Video
				name="Transition demo recording"
				src="https://remotion.media/motion-blur-2026-11-17/transition-motion-blur-capture-5eaa49b89d97.mp4"
				muted
				durationInFrames={353}
				style={{
					position: 'absolute',
					width: 2348,
					height: 1688,
				}}
			/>
			<MacOSCursor
				cursor={interpolate(
					frame,
					[8, 330, 331, 333, 334],
					['auto', 'row-resize', 'auto', 'default', 'auto'],
					{
						easing: Easing.step1,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				)}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					scale: interpolate(
						frame,
						[0, 36, 39],
						[2.6, 2.3400000000000003, 2.6],
						{
							easing: Easing.step1,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					translate: interpolate(
						frame,
						[
							8, 13, 14, 15, 19, 20, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
							34, 35, 328, 329, 330, 331, 332, 333, 334, 335,
						],
						[
							'1527.1140625px 1757.52890625px',
							'1527.1140625px 1757.52890625px',
							'1812.8500000000001px 1622.6640625px',
							'1826.36796875px 1593.8203125px',
							'1826.36796875px 1593.8203125px',
							'1844.090625px 1564.2046875px',
							'1844.090625px 1564.2046875px',
							'1846.09140625px 1564.2046875px',
							'1871.2992187500001px 1548.7671875px',
							'1912.1273437500001px 1522.10703125px',
							'1934.0953125px 1505.30859375px',
							'1948.24296875px 1491.1203125px',
							'1955.67734375px 1483.6453125px',
							'1958.6328125px 1481.6546875000001px',
							'1962.4007812500001px 1478.84140625px',
							'1966.34140625px 1477.8460937500001px',
							'1973.0140625000001px 1473.4890625px',
							'1980.4484375px 1470.1273437500001px',
							'1983.40390625px 1469.13203125px',
							'1983.40390625px 1469.13203125px',
							'1957.85078125px 1471.6203125px',
							'1883.42578125px 1495.3148437500001px',
							'1749.91171875px 1546.72578125px',
							'1681.6515625px 1582.8515625px',
							'1519.821875px 1718.2445312500001px',
							'1441.8015625px 1792.2125px',
							'1399.328125px 1841.15546875px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
		</>
	);
};

export const MotionBlurTransitionCaptureComposition = Interactive.create({
	Component: MotionBlurTransitionCaptureContent,
	layout: 'absolute-fill',
	schema: {},
});
