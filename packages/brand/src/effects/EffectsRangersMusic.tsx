import {Audio} from '@remotion/media';
import {interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';

export const rangersMusicSchema = z
	.enum(['Dialogue only', 'Enough This Time', 'Inferadise + servo'])
	.describe('Power Rangers soundtrack');

export const EffectsRangersMusic = ({
	music,
}: {
	readonly music: z.infer<typeof rangersMusicSchema>;
}) => {
	const frame = useCurrentFrame();

	if (music === 'Dialogue only') {
		return null;
	}

	if (music === 'Enough This Time') {
		return (
			<Audio
				name="Enough This Time — Rockin’ For Decades"
				src="https://remotion.media/effects-promo-2026-11-27/power-rangers/enough-this-time-587e074ab1f1.flac"
				durationInFrames={226}
				volume={interpolate(
					frame,
					[0, 10, 176, 197, 225],
					[0.17, 0.145, 0.145, 0.19, 0.19],
				)}
			/>
		);
	}

	return (
		<>
			<Audio
				name="Inferadise — Lupus Nocte"
				src="https://remotion.media/effects-promo-2026-11-27/power-rangers/inferadise-3e535e8bc394.flac"
				from={38}
				durationInFrames={188}
				volume={interpolate(
					frame,
					[38, 95, 102, 121, 132, 176, 197],
					[0.145, 0.145, 0.1, 0.1, 0.145, 0.145, 0.19],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
			/>
			<Audio
				name="Transformer servo"
				src="https://remotion.media/effects-promo-2026-11-27/power-rangers/transformer-servo-7bebeb2f81d7.flac"
				from={101}
				durationInFrames={25}
			/>
		</>
	);
};
