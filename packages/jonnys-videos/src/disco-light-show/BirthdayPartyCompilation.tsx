import {lut} from '@remotion/effects/lut';
import {Video} from '@remotion/media';
import React from 'react';
import {
	Interactive,
	Track,
	interpolate,
	useCurrentFrame,
	Easing,
} from 'remotion';
import {asset} from './assets';
import {GetThemToDance} from './GetThemToDance';
import {DAY_FOR_NIGHT_LUT} from './luts/day-for-night-lut';
import {GreenLaserVertical} from './selects/GreenLaserVertical';

const BirthdayPartyCompilationInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Track name="Party footage">
				<GreenLaserVertical
					name="Green laser over the crowd"
					width={1080}
					height={1920}
					durationInFrames={56}
					trimBefore={49}
					style={{
						position: 'absolute',
					}}
					from={37}
				/>
				<GetThemToDance
					name="Get them to dance"
					from={93}
					durationInFrames={85}
					width={1080}
					height={1920}
					style={{
						translate: interpolate(
							frame,
							[163, 177],
							['0px 0px', '0px 1920px'],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.inOut(Easing.cubic),
							},
						),
					}}
				/>
				<Video
					name="DJ setup"
					src={asset('Setup.mp4')}
					style={{
						position: 'absolute',
						width: 1080,
						height: 1920,
					}}
					from={4}
					durationInFrames={33}
					trimBefore={11}
					muted
					// Subtle day-for-night LUT, matched to the party footage (see luts/)
					effects={[lut({content: DAY_FOR_NIGHT_LUT})]}
				/>
			</Track>
		</>
	);
};

export const BirthdayPartyCompilation = Interactive.create({
	Component: BirthdayPartyCompilationInner,
	layout: 'absolute-fill',
});
