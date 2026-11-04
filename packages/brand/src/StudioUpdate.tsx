import {Audio} from '@remotion/media';
import {Easing, interpolate, Track, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {BasicsPlaybackRatePreview} from './BasicsPlaybackRateComposition';
import {StudioActionsMenuComposition} from './StudioActionsMenuComposition';
import {StudioAiPrompt} from './StudioAiPrompt';
import {StudioClosing} from './StudioClosing';
import {StudioCurvesSplit} from './StudioCurvesSplit';
import {StudioDeviceOverview} from './StudioDeviceOverview';
import {
	StudioHomepageEffects,
	StudioHomepageMenus,
	StudioHomepageNew,
	StudioHomepageParameterization,
} from './StudioHomepageShots';
import {StudioRenderClickComposition} from './StudioRenderClickComposition';
import {StudioRenderProgressComposition} from './StudioRenderProgressComposition';
import {StudioScreenshotRattle} from './StudioScreenshotRattle';
import {TimelineAudioRollingEditComposition} from './TimelineAudioRollingEditComposition';
import {
	TimelineCaptionPosition,
	TimelinePlayheadScrub,
} from './TimelineCaptionPositionAndScrub';
import {TimelineClipSelectionComposition} from './TimelineClipSelectionComposition';
import {TimelineKeyframeShiftComposition} from './TimelineKeyframeShiftComposition';
import {TimelineLeftDragComposition} from './TimelineLeftDragComposition';
import {TimelineRevealShot} from './TimelineRevealShot';
import {TimelineRightTrimComposition} from './TimelineRightTrimComposition';
import {TimelineSourceOnlyTrimWideComposition} from './TimelineSourceOnlyTrimWideComposition';
import {
	TimelineVideoRollingEditComposition,
	TimelineVideoRollingPrelude,
} from './TimelineVideoRollingEditComposition';
import {TimelineZoomComposition} from './TimelineZoomComposition';

export const studioUpdateSchema = z.object({
	mode: z.enum(['widescreen', 'instagram-reel']),
});

// Cut points follow the recorded transients at 30 fps (approximately 145 BPM).
// Keep each shot as an authored node so its content can be replaced independently.
// Follow the glow across the opening shots before the cursor showcase.
// Build in complexity: timeline zoom, trims, rolling edits, pitch, then color curves.
// Accelerate into shorter cuts; late slots follow measured transients and subdivisions.
// Use original recordings with live cameras and cursors for the homepage montage.
export const StudioUpdate = ({mode}: z.infer<typeof studioUpdateSchema>) => {
	const reel = mode === 'instagram-reel';
	const captionTimelineFill = reel
		? 'linear-gradient(to bottom, transparent 50%, #15161b 50%)'
		: undefined;
	const frame = useCurrentFrame();
	const closingPushScale = interpolate(frame, [911, 968], [1.7, 1], {
		easing: Easing.out(Easing.quad),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		output: 'perceptual-scale',
	});

	// Recenter the original capture around the interaction. Coordinates are
	// normalized within each shot's native portrait layout.
	const reelCamera = (
		scale: number,
		focusX = 0.5,
		focusY = 0.5,
	): React.CSSProperties =>
		reel
			? {
					transformOrigin: '0 0',
					scale,
					translate: `${(0.5 - focusX * scale) * 100}% ${(0.5 - focusY * scale) * 100}%`,
				}
			: {};

	return (
		<>
			<Track name="Scenes">
				<TimelineRevealShot
					name="01a - Glow across the opening chapters"
					from={0}
					durationInFrames={49}
					premountFor={6}
					revealOffsetInSeconds={0}
					focusX={562}
					focusY={1128}
					endFocusX={735.1}
					endFocusY={1134}
					zoom={5.4}
					endZoom={5.55}
					rotation="0.2 1 -0.05 7deg"
					endRotation="0.2 1 -0.05 5deg"
				/>
				<TimelineRevealShot
					name="01b - Glow from the left"
					from={49}
					durationInFrames={59}
					premountFor={6}
					revealOffsetInSeconds={1.6333333333333333}
					focusX={840.8}
					focusY={1098}
					endFocusX={1070.7}
					endFocusY={1100}
					zoom={5.2}
					endZoom={5.4}
					rotation="-0.15 1 0.04 -7deg"
					endRotation="-0.15 1 0.04 -5deg"
				/>
				<TimelineRevealShot
					name="01c - Glow across the source clips"
					from={108}
					durationInFrames={50}
					premountFor={6}
					revealOffsetInSeconds={3.6}
					focusX={1176.4}
					focusY={1184}
					endFocusX={1355.2}
					endFocusY={1184}
					zoom={5.8}
					endZoom={5.9}
					rotation="0.4 1 0.03 6deg"
					endRotation="0.4 1 0.03 4deg"
				/>
				<TimelineRevealShot
					name="01d - Glow across the chapter titles"
					from={158}
					durationInFrames={50}
					premountFor={6}
					revealOffsetInSeconds={5.266666666666667}
					focusX={1460.8}
					focusY={1068}
					endFocusX={1639.6}
					endFocusY={1070}
					zoom={6.7}
					endZoom={6.9}
					rotation="-0.2 1 0.06 -6deg"
					endRotation="-0.2 1 0.06 -4.8deg"
				/>
				<TimelineRevealShot
					name="01e - Dark seam detail"
					from={208}
					durationInFrames={34}
					premountFor={6}
					revealOffsetInSeconds={6.933333333333334}
					focusX={1745.3}
					focusY={1190}
					endFocusX={1833}
					endFocusY={1195}
					zoom={5.5}
					endZoom={5.65}
					rotation="0.65 1 -0.1 8deg"
					endRotation="0.65 1 -0.1 6.5deg"
				/>
				<StudioDeviceOverview
					name={
						reel
							? '01f - Full Studio - left to right pan'
							: '01f - Full Studio - device zoom out'
					}
					from={242}
					durationInFrames={56}
					premountFor={6}
					style={{backgroundColor: '#1c1e23', overflow: 'hidden'}}
				/>
				<TimelineAudioRollingEditComposition
					name="01g - Audio rolling edit - hover cursors"
					cursorSpin
					style={{...reelCamera(1.35), backgroundColor: '#15161b'}}
					from={298}
					durationInFrames={51}
					premountFor={30}
				/>
				<TimelineClipSelectionComposition
					name="02-09a - Rattle - progressive clip selection"
					from={349}
					durationInFrames={48}
					rattleTiming
					premountFor={30}
				/>
				<TimelineZoomComposition
					style={reelCamera(1.9)}
					name="09b - Timeline zoom in and out"
					from={397}
					trimBefore={120}
					durationInFrames={90}
					playbackRate={90 / 26}
					premountFor={30}
				/>
				<TimelineRightTrimComposition
					name="09c - Right-edge trim - active drag - 11.18x"
					from={423}
					trimBefore={87}
					durationInFrames={123}
					playbackRate={123 / 11}
					premountFor={30}
					style={{
						...reelCamera(
							2.3,
							interpolate(frame, [423, 433], [0.61, 0.45], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						),
						backgroundColor: '#1c1e23',
						overflow: 'hidden',
					}}
				/>
				<TimelineLeftDragComposition
					style={reelCamera(2.05, 0.46)}
					name="09d - Timeline left trim - 1.89x"
					from={434}
					durationInFrames={72}
					playbackRate={72 / 38}
					premountFor={30}
					trimBefore={19.894736842105264}
				/>
				<TimelinePlayheadScrub
					name="10 - Playhead scrubbing"
					from={472}
					durationInFrames={38}
					premountFor={30}
					style={{
						...reelCamera(
							2.1,
							interpolate(frame, [475, 505], [0.34, 0.54], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							0.6,
						),
						backgroundColor: '#1c1e23',
						backgroundImage: captionTimelineFill,
						overflow: 'hidden',
					}}
				/>
				<TimelineSourceOnlyTrimWideComposition
					style={reelCamera(1.7, 0.5, 0.55)}
					name="11 - Source-only trim - close-up to wide"
					from={510}
					trimBefore={40}
					durationInFrames={120}
					playbackRate={120 / 36}
					premountFor={30}
				/>
				<StudioActionsMenuComposition
					name="12 - Actions menu - cursor sweep"
					from={546}
					trimBefore={43}
					durationInFrames={54}
					playbackRate={54 / 26}
					premountFor={30}
					style={{...reelCamera(2.05, 0.44), overflow: 'hidden'}}
				/>
				<StudioScreenshotRattle
					name="14 - Full Studio screenshot - snare rattle zoom"
					from={572}
					durationInFrames={24}
					premountFor={30}
					style={{backgroundColor: '#151719', overflow: 'hidden'}}
				/>
				<TimelineCaptionPosition
					name="20 - Caption positioning - pink alignment guide"
					from={596}
					durationInFrames={24}
					premountFor={30}
					style={{
						...reelCamera(2.1, 0.53, 0.56),
						backgroundColor: '#1c1e23',
						backgroundImage: captionTimelineFill,
						overflow: 'hidden',
					}}
				/>
				<StudioHomepageEffects
					name="21.01 - Effects - enable all in one sweep"
					from={620}
					durationInFrames={25}
					premountFor={30}
					style={{
						...reelCamera(2.15, 0.27, 0.52),
						backgroundColor: '#1f2427',
						overflow: 'hidden',
					}}
				/>
				<StudioHomepageNew
					name="21.04 - remotion.new - Actions menu"
					from={645}
					durationInFrames={38}
					premountFor={30}
					style={{
						...reelCamera(2, 0.28),
						backgroundColor: '#1f2427',
						overflow: 'hidden',
					}}
				/>
				<TimelineVideoRollingPrelude
					style={reelCamera(1.35, 0.54)}
					name="22-26 - Bass stutter - frozen rolling edit pickup"
					from={683}
					durationInFrames={12}
					premountFor={30}
				/>
				<TimelineVideoRollingEditComposition
					style={reelCamera(1.35, 0.54)}
					name="27 - Video rolling edit - active drag - 2.08x"
					from={695}
					trimBefore={32}
					durationInFrames={52}
					playbackRate={52 / 25}
					premountFor={30}
				/>
				<TimelineKeyframeShiftComposition
					style={reelCamera(1.9)}
					name="27b - Audio keyframes - marquee and shift - 2x"
					from={720}
					trimBefore={33}
					durationInFrames={74}
					playbackRate={2}
					premountFor={30}
				/>
				<BasicsPlaybackRatePreview
					blurEdges={false}
					name="28 - Playback rate - clips and keyframes - 2.3x"
					from={757}
					trimBefore={45}
					durationInFrames={45 * 2.3}
					playbackRate={2.3}
					captureStyle={{
						translate: reel ? '-220px 80px' : '-350px -700px',
						scale: reel ? 0.8 : 1.25,
						rotate: '-3deg',
					}}
					premountFor={30}
				/>
				<StudioCurvesSplit
					name="29 - Curves - live split-screen correction"
					from={802}
					durationInFrames={67}
					premountFor={30}
					style={{backgroundColor: '#1c1e23', overflow: 'hidden'}}
				/>
				<StudioAiPrompt
					name="31.01 - AI prompt - before entering Studio"
					from={869}
					durationInFrames={12}
					playbackRate={12 / 21}
					premountFor={30}
					style={{
						backgroundColor: '#0d0d0d',
						overflow: 'hidden',
						scale: reel ? 1.4 : 1.05,
						translate: `${interpolate(
							frame,
							reel ? [869, 889] : [884, 938],
							reel ? [12, 0] : [2, -2],
							{
								easing: Easing.inOut(Easing.quad),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						)}% 0`,
					}}
				/>
				<StudioHomepageMenus
					name="31.02 - Enter Studio - menus"
					from={890}
					durationInFrames={18}
					playbackRate={18 / 21}
					premountFor={30}
					style={{
						backgroundColor: '#1f2428',
						overflow: 'hidden',
						scale: 1.05,
						translate: `${interpolate(frame, [884, 938], [2, -2], {
							easing: Easing.inOut(Easing.quad),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}% 0`,
					}}
				/>
				<StudioHomepageParameterization
					name="32.01 - Parameterization - duration drag"
					from={911}
					durationInFrames={16}
					playbackRate={16 / 27}
					premountFor={30}
					style={{
						...reelCamera(
							1.95 * (1.7 + (closingPushScale - 1.7) / 2),
							0.34,
							0.55,
						),
						transform: reel ? undefined : `scale(${closingPushScale})`,
						backgroundColor: '#1f2428',
						overflow: 'hidden',
					}}
				/>
				<StudioRenderClickComposition
					name="32.02 - Press Render - centered close-up"
					from={938}
					trimBefore={360}
					durationInFrames={24}
					playbackRate={24 / 15}
					premountFor={30}
					style={{
						overflow: 'hidden',
						scale: closingPushScale,
					}}
				/>
				<StudioRenderProgressComposition
					name="32.03 - Render progress - rendering"
					from={953}
					trimBefore={630}
					durationInFrames={63}
					playbackRate={63 / 16}
					premountFor={30}
					style={{
						overflow: 'hidden',
						scale: closingPushScale,
					}}
				/>
				<StudioClosing
					name="33 - Remotion logo outro"
					from={969}
					durationInFrames={54}
					premountFor={30}
					style={{backgroundColor: '#1c1e23', overflow: 'hidden'}}
				/>
			</Track>
			<Track name="Soundtrack">
				<Audio
					name="Takiti (Instrumental Version) - Lawd Ito"
					src="https://remotion.media/studio-update/takiti-instrumental-lawd-ito-adapted-2026-11-02-448ab724379d.wav"
					from={0}
					durationInFrames={993}
				/>
			</Track>
		</>
	);
};
