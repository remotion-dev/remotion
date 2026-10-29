import {EXPLORE_CAMERA_ANGLE} from './camera-angle';
import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {Video} from '@remotion/media';
import {HtmlInCanvas, Interactive, Sequence} from 'remotion';
import {ExploreNewRecording20261028Composition} from '../../ExploreNewRecording20261028Composition';

export const newRecordingDuration = 141;

const NewRecordingEditInner = () => {
	return (
		<Sequence from={-159} layout="none" name="Move down through the actions">
			<ExploreNewRecording20261028Composition />
		</Sequence>
	);
};

export const NewRecordingEdit = Interactive.create({
	Component: NewRecordingEditInner,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

const NewSquareEditInner = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'visible',
				rotate: EXPLORE_CAMERA_ANGLE,
			}}
		>
			<NewRecordingEdit
				name="Actions in remotion.new"
				durationInFrames={newRecordingDuration}
				style={{
					left: 40,
					top: -65,
					width: 2418,
					height: 1440,
					scale: 0.83,
					transformOrigin: 'top left',
					overflow: 'visible',
				}}
			/>
		</div>
	);
};

export const NewSquareEdit = Interactive.create({
	Component: NewSquareEditInner,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const ExploreRemotionNew = () => {
	return (
		<HtmlInCanvas
			name="Explore the actions in remotion.new"
			width={1080}
			height={1080}
			durationInFrames={newRecordingDuration}
			effects={[
				radialProgressiveBlur({
					center: [0.46, 0.52],
					width: 1.4,
					height: 1.6,
					start: 0.65,
					startBlur: 0,
					endBlur: 4,
				}),
				linearProgressiveBlur({
					start: [0.25, 0.1],
					end: [1.05, 1],
					startBlur: 0,
					endBlur: 16,
				}),
			]}
		>
			<Video
				name="Pre-composed actions panel"
				src="https://remotion.media/explore-remotion/new-actions-precomp-2026-10-28-c92256592ade.mp4"
				muted
				// The pre-composition already starts at frame 60 of the recording.
				trimBefore={99}
				durationInFrames={newRecordingDuration}
				style={{width: 1080, height: 1080}}
			/>
		</HtmlInCanvas>
	);
};
