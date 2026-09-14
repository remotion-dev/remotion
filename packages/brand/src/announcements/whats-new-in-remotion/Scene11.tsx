import {Video} from '@remotion/media';
import {interpolate, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import type {EndCardPlatform} from './EndCard';
import {EndCard} from './EndCard';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';

const FILE = 'whats11.mov';

export const Scene11: React.FC<{platform: EndCardPlatform}> = ({platform}) => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);
	const sceneDuration = silence.trailingStart - silence.leadingEnd;

	const overlayStartAt = sceneDuration - 7 - 1;
	const overlayProgress = useSlideInProgress({
		startAt: overlayStartAt,
		holdDuration: 9999,
	});
	const videoX = interpolate(overlayProgress, [0, 1], [0, -20]);

	return (
		<>
			<Video
				style={{transform: `translateX(${videoX}%)`}}
				src={assetUrl(FILE)}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
			/>
			<SlideInOverlay startAt={overlayStartAt} holdDuration={9999}>
				<EndCard platform={platform} />
			</SlideInOverlay>
		</>
	);
};
