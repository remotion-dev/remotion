import {AbsoluteFill, Interactive, Track} from 'remotion';
import {CaptionsRecordingComposition} from '../CaptionsRecordingComposition';
import {CloseUp7Preview} from '../CloseUp7';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {LevelsStudioRecordingComposition} from '../LevelsStudioRecordingComposition';
import {ParameterizationRecordingComposition} from '../ParameterizationRecordingComposition';
import {TimelineCaptionReorderAndScrubComposition} from '../TimelineCaptionReorderAndScrubComposition';
import {TimelineKeyframeShiftComposition} from '../TimelineKeyframeShiftComposition';
import {TimelineRightTrimComposition} from '../TimelineRightTrimComposition';

const EditingCapabilitiesBrollContent = () => {
	return (
		<Track name="Editing demonstrations">
			<TimelineRightTrimComposition
				name="Trim and edit clips"
				from={0}
				trimBefore={120}
				durationInFrames={104}
				playbackRate={104 / 61}
				style={{backgroundColor: '#1c1e23', overflow: 'hidden'}}
			/>
			<TimelineKeyframeShiftComposition
				name="Move animation keyframes"
				from={61}
				trimBefore={45}
				durationInFrames={90}
				playbackRate={90 / 63}
			/>
			<TimelineCaptionReorderAndScrubComposition
				name="Drag a caption on the canvas"
				from={124}
				trimBefore={18}
				durationInFrames={61}
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 2084,
					height: 1440,
					translate: '-760px -840px',
					transformOrigin: '760px 840px',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: 2.3,
				}}
			/>
			<AbsoluteFill
				name="Change a composition parameter"
				from={185}
				trimBefore={208}
				durationInFrames={90}
				playbackRate={90 / 54}
				style={{backgroundColor: '#1f2427', overflow: 'hidden'}}
			>
				<Interactive.Div
					name="Parameter inspector close-up"
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: 2032,
						height: 1440,
						translate: '-1100px -875px',
						transformOrigin: '1100px 875px',
						scale: 2.1,
						rotate: EXPLORE_CAMERA_ANGLE,
					}}
				>
					<ParameterizationRecordingComposition />
				</Interactive.Div>
			</AbsoluteFill>
			<AbsoluteFill
				name="Apply color correction with Levels"
				from={239}
				trimBefore={30}
				durationInFrames={61}
				style={{backgroundColor: '#1f2427', overflow: 'hidden'}}
			>
				<Interactive.Div
					name="Levels histogram and image close-up"
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: 2558,
						height: 1440,
						translate: '-1980px -540px',
						transformOrigin: '1980px 540px',
						scale: 1.65,
						rotate: EXPLORE_CAMERA_ANGLE,
					}}
				>
					<LevelsStudioRecordingComposition />
				</Interactive.Div>
			</AbsoluteFill>
			<AbsoluteFill
				name="Add an effect"
				from={300}
				durationInFrames={45}
				playbackRate={45 / 28}
				style={{backgroundColor: '#1f2427', overflow: 'hidden'}}
			>
				<CloseUp7Preview blur={false} />
			</AbsoluteFill>
			<AbsoluteFill
				name="Edit subtitles in the inspector"
				from={328}
				trimBefore={120}
				durationInFrames={50}
				style={{backgroundColor: '#1f2427', overflow: 'hidden'}}
			>
				<Interactive.Div
					name="Subtitle editor close-up"
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: 1902,
						height: 1440,
						translate: '-1500px -650px',
						transformOrigin: '1500px 650px',
						scale: 1.8,
						rotate: EXPLORE_CAMERA_ANGLE,
					}}
				>
					<CaptionsRecordingComposition />
				</Interactive.Div>
			</AbsoluteFill>
		</Track>
	);
};

export const EditingCapabilitiesBroll = Interactive.create({
	Component: EditingCapabilitiesBrollContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
