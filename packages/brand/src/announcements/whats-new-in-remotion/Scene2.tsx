import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import {LightLeakGrid} from './LightLeakGrid';
import {NumberedChapter} from './NumberedChapter';
import {Prompt} from './Prompt';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';
import {VideoBRoll} from './VideoBRoll';

const FILE = 'whats2.mov';

export const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	// Light leak overlay: 8s to 14s with 0.2s fade
	const llStart = 8 * fps;
	const llEnd = 14 * fps;
	const llFade = 0.2 * fps;
	const llOpacity = interpolate(
		frame,
		[llStart, llStart + llFade, llEnd - llFade, llEnd],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	const overlayProgress = useSlideInProgress({startAt: 0.5});
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
			<SlideInOverlay startAt={0.5}>
				<NumberedChapter chapterNumber={1} chapterTitle="Light Leaks" />
			</SlideInOverlay>
			<Sequence from={540} durationInFrames={Math.round(3 * fps)} layout="none">
				<VideoBRoll src="screen-recording.mov" />
			</Sequence>
			<Sequence
				from={655}
				durationInFrames={Math.round(3.7 * fps)}
				layout="none"
			>
				{(() => {
					const promptDuration = Math.round(3.7 * fps);
					const fadeOut = 0.2 * fps;
					const localFrame = frame - 655;
					const promptOpacity = interpolate(
						localFrame,
						[promptDuration - fadeOut, promptDuration],
						[1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					);
					return (
						<AbsoluteFill style={{opacity: promptOpacity}}>
							<Prompt
								prompt="Add a Light Leak transition between scenes"
								thinkingIndex={5}
							/>
						</AbsoluteFill>
					);
				})()}
			</Sequence>
			{llOpacity > 0 && (
				<Sequence
					from={Math.floor(llStart)}
					durationInFrames={Math.ceil(llEnd - llStart)}
					layout="none"
				>
					<AbsoluteFill style={{opacity: llOpacity}}>
						<LightLeakGrid durationInFrames={Math.ceil(llEnd - llStart)} />
					</AbsoluteFill>
				</Sequence>
			)}
		</AbsoluteFill>
	);
};
