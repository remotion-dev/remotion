import {Audio, Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {assetUrl} from './announcements/whats-new-in-remotion/assets';
import {LowerThird} from './announcements/whats-new-in-remotion/LowerThird';
import {Scene1 as IntroScene} from './announcements/whats-new-in-remotion/Scene1';
import {Scene2 as LightLeaksScene} from './announcements/whats-new-in-remotion/Scene2';
import {Scene11} from './announcements/whats-new-in-remotion/Scene11';
import {auraCodeAssets} from './aura-code-assets';
import {BasicCaptions} from './basic-captions';

// Capture fixtures for genuine Studio timelines matching the code closeups.
// Reuse the announcement's existing scene implementations and presenter card.
export const AuraTimelineChapters = () => {
	const {fps} = useVideoConfig();
	return (
		<>
			<TransitionSeries name="Chapters">
				<TransitionSeries.Sequence name="Intro" durationInFrames={5 * fps}>
					<IntroScene />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Light leaks"
					durationInFrames={14 * fps}
				>
					<LightLeaksScene />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence name="Outro" durationInFrames={3 * fps}>
					<Scene11 platform="youtube" />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{/* score.wav is a 22-second fixture made from the bundled chime. */}
			<Audio name="Score" src={auraCodeAssets.score} />
		</>
	);
};

export const AuraTimelineCard = () => <LowerThird />;

// Materializes scripts/aura-code/captions.ts. The caption text and timestamps
// remain illustrative; they are not a transcription of the announcement.
export const AuraTimelineCaptions = () => {
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill>
			<Sequence
				name="Presenter video and captions"
				trimBefore={0.9 * fps}
				durationInFrames={3.8 * fps}
			>
				<Video name="Presenter video" src={assetUrl('whats1.mov')} />
				<BasicCaptions
					name="Presenter captions"
					combineTokensWithinMilliseconds={null}
					width={900}
					style={{
						position: 'absolute',
						bottom: 280,
						translate: '510px 0px',
					}}
					captions={[
						{
							text: "What's new",
							startMs: 900,
							endMs: 1600,
							timestampMs: null,
							confidence: null,
						},
						{
							text: ' in Remotion',
							startMs: 1600,
							endMs: 2400,
							timestampMs: null,
							confidence: null,
						},
					]}
				/>
			</Sequence>
			<Sequence name="Presenter introduction" from={0.5 * fps} layout="none">
				<LowerThird />
			</Sequence>
		</AbsoluteFill>
	);
};
