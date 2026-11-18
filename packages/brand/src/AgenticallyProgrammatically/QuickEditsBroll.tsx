import {Interactive, Track} from 'remotion';
import {TimelineRightTrimComposition} from '../TimelineRightTrimComposition';

const QuickEditsBrollContent = () => {
	return (
		<Track name="Quick edits cutaways">
			<TimelineRightTrimComposition
				name="Trim a clip directly in the timeline"
				from={0}
				trimBefore={120}
				durationInFrames={200}
				playbackRate={1.25}
				style={{backgroundColor: '#1c1e23', overflow: 'hidden'}}
			/>
		</Track>
	);
};

export const QuickEditsBroll = Interactive.create({
	Component: QuickEditsBrollContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
