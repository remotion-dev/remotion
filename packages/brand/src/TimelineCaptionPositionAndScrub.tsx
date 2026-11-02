import {Interactive, useVideoConfig} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from './HomepageAssets/ExploreRemotion/camera-angle';
import {TimelineCaptionReorderAndScrubComposition} from './TimelineCaptionReorderAndScrubComposition';

const TimelineCaptionPositionContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<Interactive.Div
			name="Caption alignment - wider angled camera"
			style={{
				position: 'absolute',
				width: 2084,
				height: 1440,
				left: '50%',
				top: '50%',
				translate: '-760px -625px',
				transformOrigin: '760px 625px',
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: Math.min(width / 2560, height / 1600) * 1.85,
			}}
		>
			<TimelineCaptionReorderAndScrubComposition
				name="Drag captions down across the pink guide"
				trimBefore={(38 / 30) * fps}
				durationInFrames={(34 / 30) * fps}
				playbackRate={34 / 24}
			/>
		</Interactive.Div>
	);
};

const TimelinePlayheadScrubContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<Interactive.Div
			name="Timeline playhead and caption editor - angled camera"
			style={{
				position: 'absolute',
				width: 2084,
				height: 1440,
				left: '50%',
				top: '50%',
				translate: '-1150px -780px',
				transformOrigin: '1150px 780px',
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: Math.min(width / 2560, height / 1600) * 1.4,
			}}
		>
			<TimelineCaptionReorderAndScrubComposition
				name="Scrub the playhead across the captioned timeline"
				trimBefore={(100 / 30) * fps}
				durationInFrames={(60 / 30) * fps}
				playbackRate={60 / 38}
			/>
		</Interactive.Div>
	);
};

export const TimelineCaptionPosition = Interactive.create({
	Component: TimelineCaptionPositionContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const TimelinePlayheadScrub = Interactive.create({
	Component: TimelinePlayheadScrubContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
