import {lut} from '@remotion/effects/lut';
import {Video} from '@remotion/media';

// Apple Log decoding follows Apple's ACES input transform:
// https://github.com/ampas/aces-dev/blob/528c78fe2c0f4e7eb322581e98aba05de79466cb/transforms/ctl/idt/vendorSupplied/apple/IDT.Apple.AppleLog_BT2020.ctl
const appleLogToRec709 = [
	'TITLE "Apple Log to Rec.709 - soft highlights"',
	'LUT_3D_SIZE 33',
	...Array.from({length: 33 ** 3}, (_, index) => {
		const linear = [
			index % 33,
			Math.floor(index / 33) % 33,
			Math.floor(index / (33 * 33)),
		].map((channel) => {
			const value = channel / 32;
			return value >= 47.28711236 * (0.01 + 0.05641088) ** 2
				? 2 ** ((value - 0.69336945) / 0.08550479) - 0.00964052
				: Math.sqrt(value / 47.28711236) - 0.05641088;
		});
		// Linear BT.2020 to linear Rec.709, both with a D65 white point.
		const rgb = [
			1.660491 * linear[0] - 0.587641 * linear[1] - 0.07285 * linear[2],
			-0.12455 * linear[0] + 1.1329 * linear[1] - 0.008349 * linear[2],
			-0.018151 * linear[0] - 0.100579 * linear[1] + 1.11873 * linear[2],
		];
		const luminance = Math.max(
			0,
			0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2],
		);
		// A luminance-based shoulder preserves highlight color before SDR encoding.
		return rgb
			.map(
				(value) =>
					Math.min(1, Math.max(0, value / (1 + luminance))) ** (1 / 2.4),
			)
			.join(' ');
	}),
].join('\n');

export const AirDropFootage20261031 = () => {
	return (
		<Video
			name="IMG_0766"
			src="https://remotion.media/100gb-video.mov"
			effects={[lut({content: appleLogToRec709})]}
			style={{width: '100%', height: '100%', objectFit: 'contain'}}
		/>
	);
};
