import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {Interactive, Easing, interpolate, useCurrentFrame} from 'remotion';

const MotionBlurSelectCaptureContent = () => {
	const frame = useCurrentFrame();
	const clickScale = interpolate(
		frame,
		[122.3, 122.85, 123.4, 124.2],
		[1, 0.78, 0.78, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	return (
		<>
			<Video
				name="Canvas selection recording"
				src="https://remotion.media/motion-blur-2026-11-17/selection-capture-6481a1ca544b.mp4"
				muted
				durationInFrames={206}
				style={{
					position: 'absolute',
					width: 1572,
					height: 1440,
				}}
			/>
			<MacOSCursor
				cursor={interpolate(
					frame,
					[4, 15, 16, 65, 66, 93, 94, 172, 173],
					[
						'auto',
						'ns-resize',
						'auto',
						'ns-resize',
						'auto',
						'ns-resize',
						'auto',
						'ns-resize',
						'auto',
					],
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
					scale:
						interpolate(
							frame,
							[0, 33, 37, 194, 196],
							[
								3.4407317528467427, 3.0966585775620685, 3.4407317528467427,
								3.0966585775620685, 3.4407317528467427,
							],
							{
								easing: Easing.step1,
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						) * clickScale,
					translate: interpolate(
						frame,
						[
							4, 5, 6, 7, 8, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
							27, 28, 29, 30, 82, 94, 102, 107, 110, 112, 114, 116, 116.2,
							117.4, 118.7, 120, 121, 121.5, 122.3, 170, 171, 172, 173, 174,
							175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187,
							188, 189, 190,
						],
						[
							'481.04386783647567px 2412.611536307635px',
							'481.04386783647567px 2412.611536307635px',
							'1148.1157364196379px 1582.427478066082px',
							'1255.4235579615456px 1449.2469665857757px',
							'1256.8885570281875px 1447.351876050028px',
							'1256.8885570281875px 1447.351876050028px',
							'1263.5818555161472px 1464.945305208139px',
							'1273.3798767967146px 1497.1752846742581px',
							'1288.5540414411053px 1557.2805674817996px',
							'1290.381930184805px 1570.9225312675005px',
							'1288.043307821542px 1585.5053201418705px',
							'1284.1993653164084px 1611.3376890050401px',
							'1284.8310621616577px 1626.5521747246594px',
							'1302.3976106029495px 1665.878663431025px',
							'1311.6580175471347px 1681.6038827702073px',
							'1311.832742206459px 1681.8323688631697px',
							'1312.7870076535376px 1681.3485159604256px',
							'1320.2464065708418px 1675.3944371849916px',
							'1322.2355796154566px 1673.7278327422066px',
							'1335.7565801754713px 1668.365129736793px',
							'1342.6380436811648px 1667.6393503826769px',
							'1343.4310248273289px 1667.760313608363px',
							'1343.4310248273289px 1667.760313608363px',
							'1340px 1280px',
							'1322px 989px',
							'1305px 922px',
							'1287px 890px',
							'1261px 858px',
							'1214px 818px',
							'1156px 795px',
							'1144px 793px',
							'1103px 765px',
							'1059px 751px',
							'1010px 753px',
							'984px 762px',
							'981px 765px',
							'983px 763px',
							'983px 763px',
							'986px 785px',
							'990px 965px',
							'880px 1280px',
							'569.2663804368117px 1968.824341982453px',
							'557.9361582975546px 2086.548441291768px',
							'552.7750606682845px 2208.022400597349px',
							'552.7750606682845px 2417.0334142243796px',
							'543.8506626843383px 2515.1614709725595px',
							'537.0767220459212px 2545.81892850476px',
							'526.7142057121523px 2580.5084935598284px',
							'525.5852156057495px 2587.712525667351px',
							'525.5852156057495px 2587.712525667351px',
							'519.9671457905545px 2588.854956132164px',
							'505.22307261526976px 2591.610229606123px',
							'493.12675004666795px 2590.5081202165393px',
							'488.3957438865037px 2580.911704312115px',
							'486.40657084188916px 2553.2514467052456px',
							'487.60276274033976px 2507.769273847303px',
							'484.9012507000187px 2483.5094269180513px',
							'481.6352436064962px 2476.3053948105285px',
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

export const MotionBlurSelectCaptureComposition = Interactive.create({
	Component: MotionBlurSelectCaptureContent,
	layout: 'absolute-fill',
	schema: {},
});
