import {Interactive, Track, useVideoConfig} from 'remotion';
import {TimelineCaptionReorderAndScrubComposition} from '../TimelineCaptionReorderAndScrubComposition';
import {TimelineRightTrimComposition} from '../TimelineRightTrimComposition';

const QuickEditsBrollContent = () => {
	const {width, height} = useVideoConfig();

	return (
		<Track name="Quick edits cutaways">
			<TimelineRightTrimComposition
				name="Trim a clip directly in the timeline"
				from={0}
				trimBefore={120}
				durationInFrames={104}
				playbackRate={104 / 83}
				style={{backgroundColor: '#1c1e23', overflow: 'hidden'}}
			/>
			<TimelineCaptionReorderAndScrubComposition
				name="Move captions and scrub to preview"
				from={83}
				trimBefore={18}
				durationInFrames={180}
				style={{
					position: 'absolute',
					left: (width - 2084 * (height / 1440)) / 2,
					top: 0,
					width: 2084,
					height: 1440,
					scale: height / 1440,
					transformOrigin: 'top left',
				}}
			/>
		</Track>
	);
};

export const QuickEditsBroll = Interactive.create({
	Component: QuickEditsBrollContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
