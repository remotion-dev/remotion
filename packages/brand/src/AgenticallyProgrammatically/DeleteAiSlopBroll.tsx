import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {HtmlInCanvas, Interactive, Sequence} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {DeleteAiSlopCaptureComposition} from './DeleteAiSlopCaptureComposition';

const DeleteAiSlopBrollContent = () => {
	return (
		<HtmlInCanvas
			name="Delete badge close-up with progressive blur"
			width={1920}
			height={1080}
			style={{backgroundColor: '#1f2427'}}
			effects={[
				linearProgressiveBlur({
					start: [0.48, 0.35],
					end: [0.9, 0.95],
					endBlur: 16,
				}),
			]}
		>
			<Interactive.Div
				name="Tight view of the deleted AI badge"
				style={{
					position: 'absolute',
					left: '50%',
					top: '40%',
					width: 2302,
					height: 1440,
					translate: '-1285px -655px',
					transformOrigin: '1285px 655px',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: 2.3,
				}}
			>
				<Sequence
					name="Select and delete the generated badge"
					trimBefore={56}
					durationInFrames={120}
					layout="none"
				>
					<DeleteAiSlopCaptureComposition />
				</Sequence>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const DeleteAiSlopBroll = Interactive.create({
	Component: DeleteAiSlopBrollContent,
	layout: 'absolute-fill',
	schema: {},
});
