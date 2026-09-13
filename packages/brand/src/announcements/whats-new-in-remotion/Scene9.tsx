import {Video} from '@remotion/media';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import {NumberedChapter} from './NumberedChapter';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';

const FILE = 'whats9.mov';

export const Scene9: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	const overlayProgress = useSlideInProgress({startAt: 0.5, holdDuration: 2.5});
	const videoX = interpolate(overlayProgress, [0, 1], [0, -20]);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translateX(${videoX}%)`}}>
				<Video
					src={assetUrl(FILE)}
					trimBefore={trimBefore}
					trimAfter={trimAfter}
				/>
			</AbsoluteFill>
			<SlideInOverlay startAt={0.5} holdDuration={2.5}>
				<NumberedChapter
					chapterNumber={8}
					chapterTitle="Preview: Visual Mode"
				/>
			</SlideInOverlay>
		</AbsoluteFill>
	);
};
