import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Interactive,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const StudioRenderClickCapture = () => {
	const {fps} = useVideoConfig();
	const frame = (useCurrentFrame() * 30) / fps;

	return (
		<AbsoluteFill
			name="Canvas Capture"
			durationInFrames={16 * fps}
			style={{
				width: 2736,
				height: 1976,
			}}
		>
			<Video
				src="https://remotion.media/studio-close-ups/render-click-b2eb37ead3a2.mp4"
				muted
				durationInFrames={16 * fps}
				style={{
					position: 'absolute',
				}}
			/>
			<MacOSCursor
				cursor={interpolate(
					frame,
					[
						5, 9, 30, 89, 92, 95, 99, 149, 189, 197, 202, 207, 211, 249, 286,
						296, 300, 333, 360, 451, 455, 459,
					],
					[
						'custom',
						'auto',
						'default',
						'auto',
						'default',
						'auto',
						'default',
						'auto',
						'custom',
						'auto',
						'custom',
						'auto',
						'default',
						'auto',
						'default',
						'auto',
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
					[5, 189, 455],
					[
						'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20transform%3D%22translate(32%200)%20scale(-1%201)%22%20filter%3D%22url(%23shadow)%22%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22black%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fg%3E%0A%3Cdefs%3E%0A%3Cfilter%20id%3D%22shadow%22%20x%3D%220%22%20y%3D%220%22%20width%3D%2232%22%20height%3D%2232%22%20filterUnits%3D%22userSpaceOnUse%22%3E%0A%3CfeDropShadow%20dx%3D%220%22%20dy%3D%221.5%22%20stdDeviation%3D%221%22%20flood-color%3D%22black%22%20flood-opacity%3D%220.35%22%2F%3E%0A%3C%2Ffilter%3E%0A%3C%2Fdefs%3E%0A%3C%2Fsvg%3E") 12 12, ew-resize',
						'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20filter%3D%22url(%23shadow)%22%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M23%204.5H18C16.9%204.5%2016%205.4%2016%206.5V25.5C16%2026.6%2016.9%2027.5%2018%2027.5H23%22%20stroke%3D%22black%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fg%3E%0A%3Cdefs%3E%0A%3Cfilter%20id%3D%22shadow%22%20x%3D%220%22%20y%3D%220%22%20width%3D%2232%22%20height%3D%2232%22%20filterUnits%3D%22userSpaceOnUse%22%3E%0A%3CfeDropShadow%20dx%3D%220%22%20dy%3D%221.5%22%20stdDeviation%3D%221%22%20flood-color%3D%22black%22%20flood-opacity%3D%220.35%22%2F%3E%0A%3C%2Ffilter%3E%0A%3C%2Fdefs%3E%0A%3C%2Fsvg%3E") 12 12, e-resize',
						'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M5%206H3V26H5M27%206H29V26H27M8%2016H24M8%2016L12%2012M8%2016L12%2020M24%2016L20%2012M24%2016L20%2020%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M5%206H3V26H5M27%206H29V26H27M8%2016H24M8%2016L12%2012M8%2016L12%2020M24%2016L20%2012M24%2016L20%2020%22%20stroke%3D%22black%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fsvg%3E") 2 12, ew-resize',
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
						[0, 21, 49, 123, 223, 227, 377, 383, 472, 476],
						[4.6, 4.14, 4.6, 4.6, 4.14, 4.6, 4.14, 4.6, 4.14, 4.6],
						{
							easing: Easing.step1,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					translate: interpolate(
						frame,
						[
							5, 8, 9, 12, 13, 16, 17, 18, 20, 21, 22, 25, 26, 29, 30, 33, 34,
							37, 38, 88, 89, 90, 91, 92, 94, 95, 98, 99, 100, 101, 102, 104,
							105, 106, 107, 108, 111, 112, 113, 116, 117, 148, 149, 153, 154,
							168, 169, 173, 174, 178, 179, 184, 185, 188, 189, 196, 197, 201,
							202, 206, 207, 210, 211, 214, 215, 219, 220, 248, 249, 265, 266,
							269, 270, 272, 273, 274, 277, 278, 280, 281, 282, 285, 286, 288,
							289, 291, 292, 295, 296, 299, 300, 302, 303, 306, 307, 332, 333,
							334, 337, 338, 339, 342, 343, 359, 360, 361, 363, 364, 365, 367,
							368, 450, 451, 454, 455, 458, 459, 461, 462, 465, 466, 468, 469,
						],
						[
							'407.54921874999997px 3774.10234375px',
							'407.54921874999997px 3774.10234375px',
							'1128.0601562499999px 1658.4796875px',
							'1128.0601562499999px 1658.4796875px',
							'1228.8648437499999px 1522.72578125px',
							'1228.8648437499999px 1522.72578125px',
							'1624.4828125px 1405.1382812499999px',
							'1627.12421875px 1403.646875px',
							'1627.12421875px 1403.646875px',
							'1630.6101562499998px 1401.4187499999998px',
							'1630.4304687499998px 1401.4187499999998px',
							'1630.4304687499998px 1401.4187499999998px',
							'1399.60390625px 1485.8px',
							'1399.60390625px 1485.8px',
							'1325.1773437499999px 1519.1140624999998px',
							'1325.1773437499999px 1519.1140624999998px',
							'1268.86328125px 1538.6101562499998px',
							'1268.86328125px 1538.6101562499998px',
							'1268.3601562499998px 1538.68203125px',
							'1268.3601562499998px 1538.68203125px',
							'1631.76015625px 1669.31484375px',
							'1768.7898437499998px 1728.5757812499999px',
							'2176.5367187499996px 1904.52578125px',
							'2496.41640625px 2058.715625px',
							'2496.41640625px 2058.715625px',
							'3063.8335937499996px 2475.5187499999997px',
							'3063.8335937499996px 2475.5187499999997px',
							'3115.35px 2533.4140625px',
							'3136.0140625px 2555.084375px',
							'3186.9374999999995px 2590.86015625px',
							'3286.8257812499996px 2640.52578125px',
							'3286.8257812499996px 2640.52578125px',
							'3450.215625px 2728.0515625px',
							'3451.0421874999997px 2732.6695312499996px',
							'3452.4976562499996px 2738.9406249999997px',
							'3457.834375px 2753.4953124999997px',
							'3457.834375px 2753.4953124999997px',
							'3468.2203124999996px 2735.5265624999997px',
							'3475.89296875px 2720.325px',
							'3475.89296875px 2720.325px',
							'3477.1328124999995px 2714.19765625px',
							'3477.1328124999995px 2714.19765625px',
							'3517.8320312499995px 2813.6906249999997px',
							'3517.8320312499995px 2813.6906249999997px',
							'3516.5203125px 3099.3039062499997px',
							'3516.5203125px 3099.3039062499997px',
							'1045.2242187499999px 3495.04765625px',
							'1045.2242187499999px 3495.04765625px',
							'549.28671875px 3663.5765625px',
							'549.28671875px 3663.5765625px',
							'1215.28046875px 3037.6171874999995px',
							'1215.28046875px 3037.6171874999995px',
							'2521.7703125px 3131.8453124999996px',
							'2521.7703125px 3131.8453124999996px',
							'63.87890624999999px 3854.7101562499997px',
							'63.87890624999999px 3854.7101562499997px',
							'2455.6453125px 3316.5640624999996px',
							'2455.6453125px 3316.5640624999996px',
							'3214.5914062499996px 3105.0898437499995px',
							'3214.5914062499996px 3105.0898437499995px',
							'3183.0382812499997px 2773.153125px',
							'3183.0382812499997px 2773.153125px',
							'3323.3023437499996px 2688.484375px',
							'3323.3023437499996px 2688.484375px',
							'3354.9093749999997px 2732.5078125px',
							'3354.9093749999997px 2732.5078125px',
							'3382.4734375px 2710.13671875px',
							'3382.4734375px 2710.13671875px',
							'3381.3234374999997px 2709.45390625px',
							'3381.3234374999997px 2709.45390625px',
							'3382.00625px 2713.5328124999996px',
							'3382.00625px 2713.5328124999996px',
							'3387.77421875px 2771.7335937499997px',
							'3387.77421875px 2771.7335937499997px',
							'3371.1890624999996px 2741.528125px',
							'3359.1499999999996px 2722.8046875px',
							'3359.1499999999996px 2722.8046875px',
							'3236.6390625px 2560.1695312499996px',
							'3236.6390625px 2560.1695312499996px',
							'2834.7320312499996px 2161.58671875px',
							'2761.9046875px 2099.8820312499997px',
							'2761.9046875px 2099.8820312499997px',
							'1953.3289062499998px 1500.8398437499998px',
							'1953.3289062499998px 1500.8398437499998px',
							'1878.0398437499998px 1380.4671875px',
							'1878.0398437499998px 1380.4671875px',
							'1860.8437499999998px 1317.7203124999999px',
							'1860.8437499999998px 1317.7203124999999px',
							'1834.08828125px 1215.765625px',
							'1834.08828125px 1215.765625px',
							'1819.89296875px 1151.078125px',
							'1819.89296875px 1151.078125px',
							'1815.0593749999998px 1133.88203125px',
							'1815.0593749999998px 1133.88203125px',
							'1814.53828125px 1133.3609374999999px',
							'1814.53828125px 1133.3609374999999px',
							'1840.8265625px 1203.1335937499998px',
							'1841.63515625px 1206.5296875px',
							'1841.63515625px 1206.5296875px',
							'1854.1234375px 1240.76015625px',
							'1856.22578125px 1244.4617187499998px',
							'1856.22578125px 1244.4617187499998px',
							'1864.6890624999999px 1258.315625px',
							'1864.6890624999999px 1258.315625px',
							'1838.0054687499999px 1176.59375px',
							'1834.84296875px 1167.84296875px',
							'1834.84296875px 1167.84296875px',
							'1816.4968749999998px 1124.8257812499999px',
							'1815.58046875px 1122.0765625px',
							'1815.58046875px 1122.0765625px',
							'1813.190625px 1116.09296875px',
							'1813.190625px 1116.09296875px',
							'1736.69765625px 1280.4890624999998px',
							'1736.69765625px 1280.4890624999998px',
							'863.7937499999999px 3256.6921875px',
							'863.7937499999999px 3256.6921875px',
							'528.19140625px 3738.9015624999997px',
							'528.19140625px 3738.9015624999997px',
							'417.36015625px 3880.4414062499995px',
							'417.36015625px 3880.4414062499995px',
							'354.50546875px 3902.9742187499996px',
							'354.50546875px 3902.9742187499996px',
							'329.52890625px 3920.2062499999997px',
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

const StudioRenderClickContent = () => {
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: '#1f2427'}}>
			<AbsoluteFill
				name="Render button - centered close-up"
				style={{
					width: 2736,
					height: 1976,
					left: '50%',
					top: '50%',
					translate: '-1717.5px -1103.5px',
					transformOrigin: '1717.5px 1103.5px',
					scale: 2.4 * Math.min(width / 2560, height / 1600),
				}}
			>
				<StudioRenderClickCapture />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const StudioRenderClickComposition = Interactive.create({
	Component: StudioRenderClickContent,
	layout: 'absolute-fill',
	schema: Interactive.backgroundSchema,
});
