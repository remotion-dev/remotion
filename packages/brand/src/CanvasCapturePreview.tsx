import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Composition,
	Easing,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

export const CanvasCapturePreview = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				width: 3026,
				height: 1386,
			}}
		>
			<Video
				src={staticFile('remotion-capture-editor-starter.mp4')}
				style={{
					position: 'absolute',
				}}
			/>
			<MacOSCursor
				cursor={interpolate(
					frame,
					[6, 64, 68, 99, 164, 166],
					['default', 'auto', 'pointer', 'e-resize', 'auto', 'default'],
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
						[0, 79, 82, 110, 161],
						[6, 5.4, 6, 5.4, 6],
						{
							easing: Easing.step1,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					translate: interpolate(
						frame,
						[
							6, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 83,
							84, 85, 86, 87, 88, 89, 90, 91, 92, 97, 98, 99, 100, 114, 115,
							116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128,
							131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143,
							144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163,
							164, 165, 166, 167,
						],
						[
							'-2016.9375px -1677.375px',
							'-2016.9375px -1677.375px',
							'1813.96875px 948.3515625px',
							'1784.15625px 916.828125px',
							'1703.2734375px 833.9765625px',
							'1571.3203125px 718.875px',
							'1540.0546875px 674.390625px',
							'1537.40625px 647.2734375px',
							'1528.7109375px 533.8125px',
							'1505.953125px 496.6875px',
							'1500.46875px 484.7109375px',
							'1498.0078125px 481.359375px',
							'1498.0078125px 481.359375px',
							'1497.7734375px 478.7109375px',
							'1496.4609375px 473.90625px',
							'1496.2734375px 473.53125px',
							'1496.2734375px 473.53125px',
							'1487.0625px 472.4296875px',
							'1450.828125px 469.546875px',
							'1429.9453125px 468.4453125px',
							'1414.171875px 468.4453125px',
							'1367.4609375px 469.2421875px',
							'1335.4921875px 471.3984375px',
							'1313.53125px 472.171875px',
							'1299.140625px 472.171875px',
							'1297.828125px 472.453125px',
							'1297.828125px 472.453125px',
							'1290.65625px 472.453125px',
							'1270.8515625px 473.296875px',
							'1266px 473.296875px',
							'1266px 473.296875px',
							'1233.421875px 470.6953125px',
							'1222.7578125px 470.15625px',
							'1147.1953125px 470.15625px',
							'1139.8125px 470.15625px',
							'1118.4375px 470.15625px',
							'1096.40625px 470.15625px',
							'1049.6484375px 470.15625px',
							'1002.8203125px 470.15625px',
							'971.859375px 470.0390625px',
							'954.140625px 469.3359375px',
							'937.21875px 469.0546875px',
							'926.34375px 468.609375px',
							'916.6171875px 468.609375px',
							'910.875px 468.0234375px',
							'910.875px 468.0234375px',
							'916.4296875px 468.796875px',
							'934.125px 469.640625px',
							'978.328125px 471.1640625px',
							'1022.765625px 473.6015625px',
							'1069.78125px 474.5390625px',
							'1087.546875px 474.609375px',
							'1142.390625px 475.59375px',
							'1149.4453125px 475.0546875px',
							'1203px 473.5546875px',
							'1244.15625px 473.625px',
							'1274.4609375px 474.9609375px',
							'1297.2421875px 474.9609375px',
							'1332px 474.9609375px',
							'1379.3203125px 473.90625px',
							'1419.75px 473.90625px',
							'1432.2421875px 473.90625px',
							'1452.796875px 473.90625px',
							'1488.3046875px 474.6796875px',
							'1499.2265625px 474.6796875px',
							'1515.0703125px 475.9453125px',
							'1544.1796875px 477.234375px',
							'1553.53125px 477.5390625px',
							'1555.2421875px 477.5390625px',
							'1555.2421875px 477.5390625px',
							'1550.8125px 477.5390625px',
							'1473.4453125px 451.6171875px',
							'1317.140625px 374.5078125px',
							'-4.3828125px -360.3046875px',
							'-2614.3125px -2067.7265625px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
		</AbsoluteFill>
	);
};

export const CanvasCaptureComposition = () => {
	return (
		<Composition
			id="canvas-capture-promo"
			component={CanvasCapturePreview}
			width={1920}
			height={1080}
			fps={60}
			durationInFrames={500}
		/>
	);
};
