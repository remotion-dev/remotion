import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {AnimatedList} from './AnimatedList';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import {NumberedChapter} from './NumberedChapter';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';

const FILE = 'whats7.mov';

const AgentsBRoll: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const duration = Math.round(5 * fps);
	const fade = 0.2 * fps;

	const opacity = interpolate(
		frame,
		[0, fade, duration - fade, duration],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const scale = interpolate(frame, [0, duration], [1, 1.08], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#141414',
				justifyContent: 'center',
				alignItems: 'center',
				opacity,
			}}
		>
			<Video
				src={assetUrl('agents-screen-recording.mov')}
				muted
				playbackRate={2}
				style={{
					height: '70%',
					objectFit: 'contain',
					transformOrigin: 'top center',
					transform: `scale(${scale})`,
				}}
			/>
		</AbsoluteFill>
	);
};

export const Scene7: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	const overlayProgress = useSlideInProgress({startAt: 0.5, holdDuration: 2.5});
	const listHoldDuration = (970 - 700) / fps;
	const overlay2Progress = useSlideInProgress({
		startAt: 700 / fps,
		holdDuration: listHoldDuration,
	});
	const combinedProgress = Math.max(overlayProgress, overlay2Progress);
	const videoX = interpolate(combinedProgress, [0, 1], [0, -20]);

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
					chapterNumber={6}
					chapterTitle="Work better with Agents"
				/>
			</SlideInOverlay>
			<Sequence from={530} durationInFrames={Math.round(5 * fps)} layout="none">
				<AgentsBRoll />
			</Sequence>
			<Sequence from={700} layout="none">
				<SlideInOverlay startAt={0} holdDuration={listHoldDuration}>
					<AnimatedList
						title="Agentic flow"
						items={[
							{label: 'Single Studio Server', appearFrame: -1},
							{label: 'No multiple lockfile warning', appearFrame: 40},
							{label: 'Zod 4 supported', appearFrame: 240},
						]}
					/>
				</SlideInOverlay>
			</Sequence>
		</AbsoluteFill>
	);
};
