import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const DoubleClickCodeCaptureComposition = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			name="Canvas Capture"
			durationInFrames={322}
			style={{
				width: 2004,
				height: 1440,
			}}
		>
			<Video
				src="https://remotion.media/agentically-programmatically/double-click-code-3ee5881d2f85.mp4"
				muted
				durationInFrames={322}
				style={{
					position: 'absolute',
				}}
			/>
			<MacOSCursor
				cursor={interpolate(frame, [5, 37, 39], ['auto', 'custom', 'auto'], {
					easing: Easing.step1,
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				customCursor={
					'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20transform%3D%22translate(32%200)%20scale(-1%201)%22%20filter%3D%22url(%23shadow)%22%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22black%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fg%3E%0A%3Cdefs%3E%0A%3Cfilter%20id%3D%22shadow%22%20x%3D%220%22%20y%3D%220%22%20width%3D%2232%22%20height%3D%2232%22%20filterUnits%3D%22userSpaceOnUse%22%3E%0A%3CfeDropShadow%20dx%3D%220%22%20dy%3D%221.5%22%20stdDeviation%3D%221%22%20flood-color%3D%22black%22%20flood-opacity%3D%220.35%22%2F%3E%0A%3C%2Ffilter%3E%0A%3C%2Fdefs%3E%0A%3C%2Fsvg%3E") 12 12, ew-resize'
				}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					scale: interpolate(
						frame,
						[0, 20, 23, 61, 64, 66, 70, 189, 192],
						[
							4.771421175252395, 4.294279057727156, 4.771421175252395,
							4.294279057727156, 4.771421175252395, 4.294279057727156,
							4.771421175252395, 4.294279057727156, 4.771421175252395,
						],
						{
							easing: Easing.step1,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					translate: interpolate(
						frame,
						[
							5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 30, 31, 32,
							33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
							49, 50, 51, 52, 54, 55, 179, 180, 181, 182, 183, 184, 185, 186,
						],
						[
							'398.69324359306245px 2075.8105099663476px',
							'588.7672793165934px 2036.5022003624129px',
							'750.1009578048149px 1997.8835102252137px',
							'1085.5355940978516px 1837.314004659591px',
							'1208.381050996635px 1735.138493398913px',
							'1330.1268444214343px 1586.6280093191822px',
							'1423.2254724307534px 1477.668133574942px',
							'1478.4695832254727px 1417.7644317887653px',
							'1510.1734403313487px 1378.2324618172406px',
							'1567.4118560704117px 1317.6950556562258px',
							'1592.0144965053069px 1296.2050220036242px',
							'1611.603417033394px 1279.7473466217966px',
							'1638.7035982397101px 1253.224954698421px',
							'1652.3468806626975px 1242.0232979549573px',
							'1657.770644576754px 1242.0232979549573px',
							'1657.770644576754px 1242.0232979549573px',
							'1652.9619466735699px 1240.8118042971785px',
							'1581.1483303132281px 1182.0077659849858px',
							'1489.5034946932437px 1090.3629303650014px',
							'1489.5034946932437px 1090.3629303650014px',
							'1315.588920528087px 894.0077659849859px',
							'1315.588920528087px 894.0077659849859px',
							'1213.2270256277507px 805.792389334714px',
							'1213.2270256277507px 805.792389334714px',
							'1153.6028993010614px 749.3554232461818px',
							'1134.1630856847012px 727.3994304944345px',
							'1109.4672534299768px 688.1097592544655px',
							'1094.8361377168005px 658.8848045560446px',
							'1082.7212011390113px 634.6922081283976px',
							'1077.6888428682373px 624.6274915868496px',
							'1066.4871861247736px 599.0183794977997px',
							'1062.8340667874709px 591.7121408231944px',
							'1059.1809474501683px 584.4059021485892px',
							'1053.0116489774787px 572.06730520321px',
							'1051.1850893088274px 566.9044783846751px',
							'1049.3585296401761px 563.2513590473726px',
							'1047.9792907067047px 561.8721201139011px',
							'1047.9792907067047px 560.4928811804298px',
							'1047.9792907067047px 560.4928811804298px',
							'1047.9792907067047px 559.262749158685px',
							'1047.9792907067047px 559.262749158685px',
							'214.69531452239195px 2170.735697644318px',
							'222.61661920786955px 2181.1731814651826px',
							'229.84830442661146px 2186.596945379239px',
							'231.33937354387783px 2188.0880144965054px',
							'232.58814392958843px 2188.0880144965054px',
							'232.58814392958843px 2188.0880144965054px',
							'233.8182759513332px 2188.0880144965054px',
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
