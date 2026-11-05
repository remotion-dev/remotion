import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {Audio} from '@remotion/media';
import {
	HtmlInCanvas,
	Interactive,
	interpolate,
	Sequence,
	Track,
	useCurrentFrame,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {SoundtrackTimelineCaptureComposition} from './SoundtrackTimelineCaptureComposition';

const SoundtrackTimelineCamera = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="Tilted soundtrack timeline"
			width={1920}
			height={1080}
			style={{backgroundColor: '#1f2427'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.45],
					end: [0.5, 1],
					endBlur: 10,
				}),
			]}
		>
			<Interactive.Div
				name="Timeline close-up camera"
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 2378,
					height: 1440,
					translate: '-600px -800px',
					transformOrigin: '600px 800px',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: 2,
				}}
			>
				<Interactive.Div
					name="Follow the playing timeline"
					style={{
						position: 'absolute',
						inset: 0,
						translate: interpolate(
							frame,
							[0, 128],
							['0px 0px', '-1230px 0px'],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
					}}
				>
					<Sequence
						name="Playback from 20 - Next phrase"
						trimBefore={67}
						durationInFrames={211}
						layout="none"
					>
						<SoundtrackTimelineCaptureComposition />
					</Sequence>
				</Interactive.Div>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

const SoundtrackMusic = () => {
	const frame = useCurrentFrame();

	return (
		<Audio
			name="Takiti - match source frame 472"
			src="https://remotion.media/studio-update/takiti-instrumental-lawd-ito-adapted-2026-11-02-448ab724379d.wav"
			from={0}
			trimBefore={472}
			durationInFrames={211}
			volume={interpolate(frame, [0, 15, 192, 210], [0, 0.4, 0.4, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
		/>
	);
};

export const SoundtrackJCutMusic = () => {
	const frame = useCurrentFrame();

	return (
		<Audio
			name="Soundtrack fades in under the explanation"
			src="https://remotion.media/studio-update/takiti-instrumental-lawd-ito-adapted-2026-11-02-448ab724379d.wav"
			from={0}
			trimBefore={453}
			durationInFrames={230}
			volume={interpolate(
				frame,
				[0, 19, 34, 211, 229],
				[0, 0.18, 0.4, 0.4, 0],
				{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
			)}
		/>
	);
};

const SoundtrackTimelinePlaybackContent = ({
	withMusic,
}: {
	readonly withMusic: boolean;
}) => {
	return (
		<>
			<Track name="Timeline recording">
				<Interactive.Div
					name="Play from 20 - Next phrase"
					from={0}
					durationInFrames={211}
				>
					<SoundtrackTimelineCamera />
				</Interactive.Div>
			</Track>
			{withMusic ? (
				<Track name="Synchronized soundtrack">
					<SoundtrackMusic />
				</Track>
			) : null}
		</>
	);
};

export const SoundtrackTimelinePlayback = Interactive.create({
	Component: SoundtrackTimelinePlaybackContent,
	layout: 'absolute-fill',
	schema: {
		withMusic: {
			type: 'boolean',
			default: true,
			description: 'Include the synchronized music inside this composition',
		},
	},
});
