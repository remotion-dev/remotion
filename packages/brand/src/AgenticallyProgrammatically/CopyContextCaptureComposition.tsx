import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const CopyContextCaptureComposition = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			name="Canvas Capture"
			durationInFrames={185}
			style={{
				width: 1604,
				height: 1440,
			}}
		>
			<Video
				src="https://remotion.media/agentically-programmatically/copy-context-2026-11-04-61c48a5eb5e6.mp4"
				muted
				durationInFrames={185}
				style={{
					position: 'absolute',
				}}
			/>
			<MacOSCursor
				cursor={interpolate(
					frame,
					[6, 31, 33, 74, 78, 82, 86, 88, 149, 156, 158],
					[
						'auto',
						'custom',
						'auto',
						'default',
						'default',
						'default',
						'auto',
						'default',
						'auto',
						'custom',
						'auto',
					],
					{
						easing: Easing.step1,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				)}
				customCursor={interpolate(
					frame,
					[31, 32, 156, 157],
					[
						'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20filter%3D%22url(%23shadow)%22%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22black%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fg%3E%0A%3Cdefs%3E%0A%3Cfilter%20id%3D%22shadow%22%20x%3D%220%22%20y%3D%220%22%20width%3D%2232%22%20height%3D%2232%22%20filterUnits%3D%22userSpaceOnUse%22%3E%0A%3CfeDropShadow%20dx%3D%220%22%20dy%3D%221.5%22%20stdDeviation%3D%221%22%20flood-color%3D%22black%22%20flood-opacity%3D%220.35%22%2F%3E%0A%3C%2Ffilter%3E%0A%3C%2Fdefs%3E%0A%3C%2Fsvg%3E") 12 12, e-resize',
						'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20transform%3D%22translate(32%200)%20scale(-1%201)%22%20filter%3D%22url(%23shadow)%22%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22black%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fg%3E%0A%3Cdefs%3E%0A%3Cfilter%20id%3D%22shadow%22%20x%3D%220%22%20y%3D%220%22%20width%3D%2232%22%20height%3D%2232%22%20filterUnits%3D%22userSpaceOnUse%22%3E%0A%3CfeDropShadow%20dx%3D%220%22%20dy%3D%221.5%22%20stdDeviation%3D%221%22%20flood-color%3D%22black%22%20flood-opacity%3D%220.35%22%2F%3E%0A%3C%2Ffilter%3E%0A%3C%2Fdefs%3E%0A%3C%2Fsvg%3E") 12 12, ew-resize',
						'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M5%206H3V26H5M27%206H29V26H27M8%2016H24M8%2016L12%2012M8%2016L12%2020M24%2016L20%2012M24%2016L20%2020%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M5%206H3V26H5M27%206H29V26H27M8%2016H24M8%2016L12%2012M8%2016L12%2020M24%2016L20%2012M24%2016L20%2020%22%20stroke%3D%22black%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fsvg%3E") 2 12, ew-resize',
						'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20filter%3D%22url(%23shadow)%22%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22black%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fg%3E%0A%3Cdefs%3E%0A%3Cfilter%20id%3D%22shadow%22%20x%3D%220%22%20y%3D%220%22%20width%3D%2232%22%20height%3D%2232%22%20filterUnits%3D%22userSpaceOnUse%22%3E%0A%3CfeDropShadow%20dx%3D%220%22%20dy%3D%221.5%22%20stdDeviation%3D%221%22%20flood-color%3D%22black%22%20flood-opacity%3D%220.35%22%2F%3E%0A%3C%2Ffilter%3E%0A%3C%2Fdefs%3E%0A%3C%2Fsvg%3E") 12 12, e-resize',
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
					scale: interpolate(
						frame,
						[0, 59, 64, 111, 116, 168, 171],
						[
							2.299429883107324, 2.069486894796592, 2.299429883107324,
							2.069486894796592, 2.299429883107324, 2.069486894796592,
							2.299429883107324,
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
							6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 25, 26, 27, 28, 29, 30, 31,
							32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
							48, 49, 50, 51, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82,
							83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 148, 149, 150,
							151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163,
							164, 165, 166, 167, 168,
						],
						[
							'409.514090744645px 1338.3759777442333px',
							'492.84147756334283px 1331.6034381666439px',
							'766.985616088025px 1322.7739867014309px',
							'946.4219863022242px 1322.7739867014309px',
							'1171.4697039633727px 1331.729188238376px',
							'1213.3265135543108px 1333.9298144936938px',
							'1227.3656108484388px 1333.9298144936938px',
							'1237.0304020758742px 1331.504634538854px',
							'1247.3419079579335px 1327.8668646065944px',
							'1249.955713020372px 1326.9866141044672px',
							'1249.955713020372px 1326.9866141044672px',
							'1239.92265372572px 1326.9866141044672px',
							'1225.8386456916878px 1320.2589852667822px',
							'1185.8950336206788px 1290.204718122731px',
							'1185.8950336206788px 1290.204718122731px',
							'1165.433700520216px 1272.815279631732px',
							'1114.6486358362754px 1232.3956137177358px',
							'1109.0347933482203px 1226.781771229681px',
							'1091.2142117541387px 1208.961189635599px',
							'1074.5882558415149px 1189.2633391135118px',
							'1069.0821991292305px 1182.2213350964957px',
							'1054.8814231714466px 1164.9486645292482px',
							'1041.3363440162677px 1149.867638069337px',
							'1028.1325864843623px 1135.1279332327px',
							'1010.0784690427774px 1115.5378684863833px',
							'1005.228109133098px 1110.6875085767037px',
							'997.6202297932858px 1098.795144650008px',
							'987.8117241981561px 1080.0943125537992px',
							'976.359485522524px 1058.7617110991903px',
							'966.4431941516236px 1037.4291096445813px',
							'954.6496338527177px 1018.9258848039522px',
							'954.6496338527177px 1018.9258848039522px',
							'952.8891328484636px 1016.2851332975711px',
							'951.496899911426px 1015.404882795444px',
							'951.496899911426px 1014.6773288089921px',
							'950.859167404783px 1014.6773288089921px',
							'950.859167404783px 1014.0126498584063px',
							'950.859167404783px 1014.0126498584063px',
							'950.859167404783px 1013.4557566835913px',
							'950.859167404783px 1008.3718609264088px',
							'950.859167404783px 989.2309035791365px',
							'956.7963672201499px 954.4160980052146px',
							'956.7963672201499px 954.4160980052146px',
							'993.8477276413129px 836.2379770206713px',
							'1016.8420264723861px 762.7909529809504px',
							'1030.7194451028581px 714.4939432877156px',
							'1040.7255579535672px 681.026459910927px',
							'1050.7316708042765px 647.5589765341384px',
							'1059.7407652291072px 613.0136353996431px',
							'1065.2198754974488px 598.9296273656108px',
							'1065.2198754974488px 598.9296273656108px',
							'1068.498359510473px 584.162976085031px',
							'1069.3696278646191px 577.5521151710974px',
							'1069.3696278646191px 570.9412542571639px',
							'1072.10918299879px 558.1686398283412px',
							'1072.10918299879px 550.8930999638219px',
							'1072.10918299879px 550.8930999638219px',
							'1074.5163986576679px 536.1264486832421px',
							'1075.387667011814px 532.0934642398233px',
							'1075.387667011814px 530.5485347871106px',
							'1075.387667011814px 529.9287665764293px',
							'1075.387667011814px 529.9287665764293px',
							'1075.387667011814px 531.5904639528936px',
							'993.5064060180391px 654.9872129143328px',
							'845.7770181763744px 867.3521376264673px',
							'743.8476028892576px 1033.1536072056788px',
							'694.2751281827368px 1131.5620204842874px',
							'694.2751281827368px 1131.5620204842874px',
							'672.1071869659053px 1190.7274292343966px',
							'653.3614441297921px 1217.4583016255192px',
							'640.777454808568px 1232.557292381392px',
							'581.6569567983632px 1279.2464975860478px',
							'531.3479459574096px 1310.5403011514613px',
							'498.28465923976097px 1330.3459374493195px',
							'459.93986950935016px 1353.8881473072267px',
							'428.67301238787906px 1371.6997467533276px',
							'410.2057161391734px 1382.4513778864507px',
							'403.26251574994694px 1388.1460597063335px',
							'398.1965842887261px 1391.963472598211px',
							'393.79533177809105px 1395.4485460147955px',
							'392.3402238051872px 1395.4485460147955px',
							'391.67554485460147px 1395.4485460147955px',
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
