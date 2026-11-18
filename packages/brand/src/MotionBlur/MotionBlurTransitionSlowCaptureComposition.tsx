import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const MotionBlurTransitionSlowCaptureComposition = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			name="Canvas Capture"
			durationInFrames={468}
			style={{
				width: 2012,
				height: 1440,
			}}
		>
			<Video
				src="https://remotion.media/motion-blur-2026-11-17/transition-motion-blur-slow-capture-8dcc3e6d9fee.mp4"
				durationInFrames={468}
				style={{
					position: 'absolute',
				}}
			/>
			<MacOSCursor
				cursor={interpolate(
					frame,
					[4, 9, 11, 449, 451],
					['auto', 'default', 'auto', 'default', 'auto'],
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
					scale: 2.2889217281160357,
					translate: interpolate(
						frame,
						[
							4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 446, 447, 448, 449,
							450, 451, 452, 453, 454, 455, 456, 457, 458,
						],
						[
							'715.600978553777px 1407.3471009723446px',
							'820.1045612030748px 1371.6452866740349px',
							'896.8192034969637px 1355.6407167782236px',
							'965.0040359134204px 1341.3170737764974px',
							'1015.7179579519913px 1325.2856805791846px',
							'1055.183975560992px 1303.3442199510723px',
							'1087.0768810461088px 1275.8145715101768px',
							'1118.9697865312255px 1250.4844337923926px',
							'1132.9536677139345px 1240.7296931463982px',
							'1139.829373998783px 1235.9014988761535px',
							'1143.2985209929589px 1234.1490431780646px',
							'1143.2985209929589px 1234.1490431780646px',
							'1143.9065158269898px 1234.1490431780646px',
							'1143.9065158269898px 1234.1490431780646px',
							'1117.4855638481504px 1236.3396128006755px',
							'1063.8747252474325px 1255.205334856632px',
							'1015.1278453189614px 1275.599985098166px',
							'954.0780111018664px 1301.0374160219553px',
							'928.2114073540552px 1312.8575508835547px',
							'911.5720193227116px 1322.6927614340532px',
							'893.1891166937797px 1333.3952587330957px',
							'878.4094775665305px 1345.0902181876886px',
							'849.2614899350529px 1368.9361332223975px',
							'820.5247929265961px 1393.2380443826294px',
							'793.9876066412507px 1419.7394662659729px',
							'779.6192581370224px 1431.8904218460889px',
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
