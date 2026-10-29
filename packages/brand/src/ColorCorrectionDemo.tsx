import {colorCorrection} from '@remotion/effects/color-correction';
import {lut} from '@remotion/effects/lut';
import {Video} from '@remotion/media';

const daylightLut = [
	'TITLE "Clear alpine daylight"',
	'LUT_3D_SIZE 17',
	...Array.from({length: 17 ** 3}, (_, index) => {
		const input = [
			index % 17,
			Math.floor(index / 17) % 17,
			Math.floor(index / 289),
		];
		const curved = input.map((channel) => {
			const value = channel / 16;
			return value + 0.13 * (value - 0.5) * 4 * value * (1 - value);
		});
		const luma = curved[0] * 0.2126 + curved[1] * 0.7152 + curved[2] * 0.0722;
		return curved
			.map((value, channel) =>
				Math.min(
					1,
					Math.max(
						0,
						luma +
							(value - luma) * 1.055 +
							[-0.004, 0.001, 0.006][channel] * 4 * luma * (1 - luma) ** 2 +
							[0.007, 0.003, -0.003][channel] * 4 * luma ** 2 * (1 - luma),
					),
				).toFixed(6),
			)
			.join(' ');
	}),
].join('\n');

export const ColorCorrectionDemo: React.FC = () => {
	return (
		<Video
			name="Alpine daylight"
			src="https://remotion.media/jonnys-videos/roller-skis/processed/IMG_0456-upright.MOV"
			muted
			durationInFrames={300}
			style={{width: '100%', height: '100%'}}
			objectFit="cover"
			effects={[lut({
				content: daylightLut
			}), colorCorrection({
				exposure: 0,
				contrast: 1,
				highlights: 0,
				temperature: 0,
				tint: 0,
				saturation: 1,
				vibrance: 0,
				shadows: 0.36
			})]}
		/>
	);
};
