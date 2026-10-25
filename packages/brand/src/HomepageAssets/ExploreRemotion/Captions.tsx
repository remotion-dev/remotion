import {colorCorrection} from '@remotion/effects/color-correction';
import {grayscale} from '@remotion/effects/grayscale';
import {AbsoluteFill, HtmlInCanvas} from 'remotion';
import {CaptionsRecordingComposition} from '../../CaptionsRecordingComposition';

export const ExploreRemotionCaptions = () => {
	const scale = 1080 / 880;

	return (
		<HtmlInCanvas
			width={1080}
			height={1080}
			effects={[
				grayscale({}),
				colorCorrection({
					pivot: 0,
					shadows: 1,
					whites: 0.26,
					blacks: -1,
					temperature: -1,
				}),
			]}
		>
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
						rotate: '-0.148338 -0.987665 0.050137 37.783391deg',
						translate: '105.4px -284.7px',
						scale: 1.201,
					}}
				>
					<CaptionsRecordingComposition />
				</AbsoluteFill>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};
