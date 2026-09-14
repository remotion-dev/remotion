import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {AnimatedList} from './AnimatedList';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import {NumberedChapter} from './NumberedChapter';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';

const FILE = 'whats5.mov';

const SKILLS_LIST = [
	{label: 'Voiceovers with ElevenLabs', appearFrame: 255},
	{label: 'Working with FFmpeg', appearFrame: 330},
	{label: 'Audio visualization', appearFrame: 420},
	{label: 'Exporting transparent videos', appearFrame: 520},
];

const FADE_START = 185;
const FADE_DURATION = 8;

const OverlayContent: React.FC = () => {
	const frame = useCurrentFrame();

	const chapterOpacity = interpolate(
		frame,
		[FADE_START, FADE_START + FADE_DURATION],
		[1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const listOpacity = interpolate(
		frame,
		[FADE_START + FADE_DURATION, FADE_START + FADE_DURATION * 2],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill style={{opacity: chapterOpacity}}>
				<NumberedChapter chapterNumber={4} chapterTitle="New Skills" />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: listOpacity}}>
				<AnimatedList title="New Skills" items={SKILLS_LIST} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const Scene5: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);
	const sceneDuration = silence.trailingStart - silence.leadingEnd;

	const overlayProgress = useSlideInProgress({
		startAt: 0.5,
		holdDuration: sceneDuration - 0.5 - 1 - 1,
	});
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
			<SlideInOverlay startAt={0.5} holdDuration={sceneDuration - 0.5 - 1 - 1}>
				<OverlayContent />
			</SlideInOverlay>
		</AbsoluteFill>
	);
};
