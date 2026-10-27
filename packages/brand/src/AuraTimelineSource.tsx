import type {Caption} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {Audio, Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Interactive,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceProps,
} from 'remotion';
import {assetUrl} from './announcements/whats-new-in-remotion/assets';
import {LowerThird} from './announcements/whats-new-in-remotion/LowerThird';
import {Scene1 as IntroScene} from './announcements/whats-new-in-remotion/Scene1';
import {Scene2 as LightLeaksScene} from './announcements/whats-new-in-remotion/Scene2';
import {Scene11} from './announcements/whats-new-in-remotion/Scene11';
import {auraCodeAssets} from './aura-code-assets';

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

// Copied from packages/docs/elements/captions/basic-captions/basic-captions.tsx.
// Kept local because importing that source violates this package's composite
// TypeScript project boundary. The renderer and interactive schema are unchanged.
type BasicCaptionsProps = InteractiveTransformProps &
	Pick<SequenceProps, 'width'> & {
		readonly captions: Caption[];
		readonly combineTokensWithinMilliseconds: number | null;
	};

const defaultCombineTokensWithinMilliseconds = 3000;
const defaultWidth = 900;

const basicCaptionsSchema = {
	...Interactive.captionsSchema,
	width: {
		type: 'number',
		min: 1,
		step: 1,
		default: undefined,
		description: 'Caption area width',
		hiddenFromList: false,
	},
	combineTokensWithinMilliseconds: {
		type: 'number',
		min: 0,
		step: 50,
		default: defaultCombineTokensWithinMilliseconds,
		description: 'Time between caption pages',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const BasicCaptionsContent: React.FC<BasicCaptionsProps> = ({
	captions,
	combineTokensWithinMilliseconds,
	style,
	width = defaultWidth,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pages = useMemo(
		() =>
			createTikTokStyleCaptions({
				captions,
				combineTokensWithinMilliseconds:
					combineTokensWithinMilliseconds ??
					defaultCombineTokensWithinMilliseconds,
			}).pages,
		[captions, combineTokensWithinMilliseconds],
	);
	const currentTimeMs = (frame / fps) * 1000;
	const page = pages.find(
		(candidate) =>
			currentTimeMs >= candidate.startMs &&
			currentTimeMs < candidate.startMs + candidate.durationMs,
	);

	return (
		<div
			style={{
				alignItems: 'center',
				display: 'flex',
				justifyContent: 'center',
				width,
				...style,
			}}
		>
			{page ? (
				<div
					style={{
						backgroundColor: 'rgba(64, 64, 64, 0.75)',
						color: '#ffffff',
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 64,
						fontWeight: 400,
						lineHeight: 1.2,
						padding: '14px 22px',
						textAlign: 'center',
						textWrap: 'balance',
						whiteSpace: 'pre-wrap',
					}}
				>
					{page.text.trim()}
				</div>
			) : null}
		</div>
	);
};

const BasicCaptions = Interactive.create({
	Component: BasicCaptionsContent,
	componentName: '<BasicCaptions>',
	schema: basicCaptionsSchema,
});

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
