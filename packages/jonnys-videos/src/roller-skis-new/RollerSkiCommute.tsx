import {Audio} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {pushCut} from '@remotion/transitions/push-cut';
import React from 'react';
import {
	Interactive,
	Track,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {LightLeakOverlay} from './elements/LightLeakOverlay';
import {Arrival} from './scenes/Arrival';
import {BestCommute} from './scenes/BestCommute';
import {EndCard} from './scenes/EndCard';
import {GearUp} from './scenes/GearUp';
import {Intro} from './scenes/Intro';
import {Office} from './scenes/Office';
import {OffWeGo} from './scenes/OffWeGo';
import {RideMontage} from './scenes/RideMontage';
import {TheDecline} from './scenes/TheDecline';
import {Uphill} from './scenes/Uphill';

const RollerSkiCommuteInner: React.FC = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<>
			<TransitionSeries name="Roller ski commute">
				<TransitionSeries.Sequence
					name="Intro"
					durationInFrames={529}
					premountFor={fps}
				>
					<Intro />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Gear up"
					durationInFrames={332}
					premountFor={fps}
				>
					<GearUp />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Off we go"
					durationInFrames={108}
					premountFor={fps}
				>
					<OffWeGo />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Uphill"
					durationInFrames={1517}
					premountFor={fps}
				>
					<Uphill />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={40} premountFor={fps}>
					<LightLeakOverlay />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Best commute"
					durationInFrames={512}
					premountFor={fps}
				>
					<BestCommute />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="The decline"
					durationInFrames={1054}
					premountFor={fps}
				>
					<TheDecline />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={pushCut()}
					timing={linearTiming({durationInFrames: 10})}
				/>
				<TransitionSeries.Sequence
					name="Ride montage"
					durationInFrames={221}
					premountFor={fps}
				>
					<RideMontage />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Arrival"
					durationInFrames={426}
					premountFor={fps}
				>
					<Arrival />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Office"
					durationInFrames={1081}
					premountFor={fps}
				>
					<Office />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={fade()}
					timing={linearTiming({durationInFrames: 20})}
				/>
				<TransitionSeries.Sequence
					name="End card"
					durationInFrames={120}
					premountFor={fps}
				>
					<EndCard />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Track name="Music">
				<Audio
					name="Music"
					src={
						'https://remotion.media/jonnys-videos/roller-skis-new/music/sunset-render-deja-vu.mp3'
					}
					trimBefore={1207}
					durationInFrames={4042}
					premountFor={fps}
					volume={interpolate(
						frame,
						[
							0, 20, 520, 529, 611, 617, 656, 662, 722, 728, 786, 792, 969, 984,
							2000, 2006, 2052, 2058, 2480, 2492, 2990, 3002, 3238, 3242, 3281,
							3300, 4036, 4042,
						],
						[
							0, 0.07, 0.07, 0.5, 0.5, 0.14, 0.14, 0.5, 0.5, 0.14, 0.14, 0.5,
							0.5, 0.08, 0.08, 0.22, 0.22, 0.08, 0.08, 0.11, 0.11, 0.08, 0.08,
							0, 0, 0.08, 0.08, 0,
						],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)}
				/>
				<Audio
					name="Music (drop)"
					src={
						'https://remotion.media/jonnys-videos/roller-skis-new/music/sunset-render-deja-vu.mp3'
					}
					from={4042}
					trimBefore={3468}
					durationInFrames={1708}
					premountFor={fps}
					volume={interpolate(
						frame,
						[4042, 4046, 4392, 4404, 4689, 4699, 5740, 5750],
						[0, 0.55, 0.55, 0.1, 0.1, 0.07, 0.07, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)}
				/>
				<Audio
					name="Music (outro)"
					src={
						'https://remotion.media/jonnys-videos/roller-skis-new/music/sunset-render-deja-vu.mp3'
					}
					from={5750}
					trimBefore={6067}
					durationInFrames={120}
					premountFor={fps}
					volume={interpolate(
						frame,
						[5750, 5762, 5840, 5870],
						[0, 0.45, 0.45, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)}
				/>
			</Track>
		</>
	);
};

export const RollerSkiCommute = Interactive.withSchema({
	Component: RollerSkiCommuteInner,
	componentName: '<RollerSkiCommute>',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
