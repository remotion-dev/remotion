import {EXPLORE_CAMERA_ANGLE} from './camera-angle';
import {AbsoluteFill, HtmlInCanvas, Sequence} from 'remotion';
import {CaptionsRecordingComposition} from '../../CaptionsRecordingComposition';

const captionsStartFrame = 136;
export const captionsDuration = 612 - captionsStartFrame;

export const ExploreRemotionCaptions = () => {
	const scale = 1080 / 880;

	return (
		<HtmlInCanvas width={1080} height={1080}>
			<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#1f2428'}}>
				<AbsoluteFill
					name="Scrolling captions sidebar"
					style={{
						width: 1902,
						height: 1440,
						left: -1022 * scale,
						top: -155 * scale,
						transform: `scale(${scale})`,
						transformOrigin: 'top left',
						rotate: EXPLORE_CAMERA_ANGLE,
						translate: '-973.1px -61px',
						scale: 1.402,
					}}
				>
					<Sequence from={-captionsStartFrame} layout="none">
						<CaptionsRecordingComposition />
					</Sequence>
				</AbsoluteFill>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};
