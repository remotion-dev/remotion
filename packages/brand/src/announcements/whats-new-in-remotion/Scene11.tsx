import {Video} from '@remotion/media';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
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
		<AbsoluteFill name={'Video'}>
			<AbsoluteFill
				style={{transform: `translateX(${videoX}%)`}}
				name={'Container'}
			>
				<Video
					src={assetUrl(FILE)}
					trimBefore={trimBefore}
					trimAfter={trimAfter}
				/>
			</AbsoluteFill>
			<SlideInOverlay startAt={overlayStartAt} holdDuration={9999}>
				<EndCard platform={platform} />
			</SlideInOverlay>
		</AbsoluteFill>
	);
};
