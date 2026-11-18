import {colorCorrection} from '@remotion/effects/color-correction';
import {loadFont} from '@remotion/fonts';
import {Audio, Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {Interactive, Sequence, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {BasicCaptions} from '../basic-captions';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {MotionBlurAdjustment} from './MotionBlurAdjustment';
import {MotionBlurAgentPrompt} from './MotionBlurAgentPrompt';
import {MotionBlurBounce} from './MotionBlurBounce';
import {MotionBlurClick} from './MotionBlurClick';
import {MotionBlurCodeCloseup} from './MotionBlurCodeCloseup';
import {
	MOTION_BLUR_COPY_CONTEXT_DURATION_IN_FRAMES,
	MotionBlurCopyContext,
} from './MotionBlurCopyContext';
import {MotionBlurDocumentation} from './MotionBlurDocumentation';
import {MotionBlurFrameBlending} from './MotionBlurFrameBlending';
import {
	MOTION_BLUR_OUTRO_START_FRAME,
	MotionBlurOutro,
} from './MotionBlurOutro';
import {MotionBlurScrub} from './MotionBlurScrub';
import {MotionBlurSelect} from './MotionBlurSelect';
import {MotionBlurTransition} from './MotionBlurTransition';

loadFont({
	family: 'Here GT Planar',
	url: 'https://remotion.media/agentically-programmatically/gt-planar-medium-99485baca015.woff2',
	weight: '500',
});

export const motionBlurShortSchema = z.object({
	format: z.enum(['portrait', 'landscape']).describe('Video format'),
});

const AGENT_SCENE_TRIM_BEFORE = 116;
const AGENT_SCENE_DURATION_IN_FRAMES = 119;

export const MotionBlurShort = ({
	format,
}: z.infer<typeof motionBlurShortSchema>) => {
	const portrait = format === 'portrait';
	const {fps} = useVideoConfig();

	return (
		<div style={{position: 'absolute', inset: 0, backgroundColor: '#ffffff'}}>
			<TransitionSeries name="Motion blur - rough cut">
				<TransitionSeries.Sequence
					name="1 - Motion blur in Remotion"
					trimBefore={112}
					durationInFrames={410}
				>
					<Video
						name="motionblur1.mov"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur1-c3b31409c4f7.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.28,
								temperature: -0.12,
								tint: -0.23,
								contrast: 1.02,
								shadows: 0.05,
								highlights: -0.08,
							}),
						]}
						cropLeft={portrait ? 0.297101449 : 0.324275362}
						cropRight={portrait ? 0.213768116 : 0.240942029}
						cropTop={portrait ? 0.141706924 : 0.070048309}
						cropBottom={portrait ? 0.085346216 : 0.060386473}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-656px 784px' : '244px -87px',
						}}
					/>
					<Audio
						name="motionblur1 - dialogue"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur1-auphonic-f5707c0628bc.flac"
					/>
					<MotionBlurScrub
						name="1 - Triangle motion blur in slow motion"
						from={112}
						durationInFrames={87}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					/>
					<MotionBlurFrameBlending
						name="1 - How motion blur blends frames"
						from={199}
						durationInFrames={233}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					/>
					<Sequence
						name="1 - Real-camera motion blur B-roll"
						from={432}
						durationInFrames={3 * fps}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0, overflow: 'hidden'}}
					>
						<Video
							name="Passing subway - Orhan Pergel"
							src="https://remotion.media/motion-blur-2026-11-17/subway-motion-blur-ef598b5ed372.mp4"
							trimBefore={6 * fps}
							durationInFrames={3 * fps}
							muted
							objectFit="cover"
							style={{width: '100%', height: '100%'}}
						/>
						<Interactive.Div
							name="Footage credit"
							durationInFrames={3 * fps}
							style={{
								position: 'absolute',
								left: 32,
								top: 32,
								fontFamily: 'Here GT Planar',
								fontWeight: 500,
								fontSize: portrait ? 34 : 30,
								lineHeight: 1.2,
								padding: '0.21875em 0.625em',
								backgroundColor: '#ffffff',
								color: '#000000',
								whiteSpace: 'nowrap',
							}}
						>
							Orhan Pergel · Pexels
						</Interactive.Div>
					</Sequence>
					<BasicCaptions
						name="1 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Remotion',
								startMs: 3860,
								endMs: 4460,
								timestampMs: 4160,
								confidence: null,
							},
							{
								text: ' now',
								startMs: 4460,
								endMs: 4740,
								timestampMs: 4600,
								confidence: null,
							},
							{
								text: ' has',
								startMs: 4740,
								endMs: 5180,
								timestampMs: 4960,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' motion',
								startMs: 5180,
								endMs: 5560,
								timestampMs: 5370,
								confidence: null,
							},
							{
								text: ' blur.',
								startMs: 5560,
								endMs: 6060,
								timestampMs: 5810,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Motion',
								startMs: 6640,
								endMs: 6980,
								timestampMs: 6810,
								confidence: null,
							},
							{
								text: ' blur',
								startMs: 6980,
								endMs: 7500,
								timestampMs: 7240,
								confidence: null,
							},
							{
								text: ' samples',
								startMs: 7500,
								endMs: 7860,
								timestampMs: 7680,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' multiple',
								startMs: 7860,
								endMs: 8280,
								timestampMs: 8070,
								confidence: null,
							},
							{
								text: ' frames',
								startMs: 8280,
								endMs: 8640,
								timestampMs: 8460,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' around',
								startMs: 8640,
								endMs: 8840,
								timestampMs: 8740,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 8840,
								endMs: 9020,
								timestampMs: 8930,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' current',
								startMs: 9020,
								endMs: 9400,
								timestampMs: 9210,
								confidence: null,
							},
							{
								text: ' time',
								startMs: 9400,
								endMs: 9600,
								timestampMs: 9500,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 9600,
								endMs: 10080,
								timestampMs: 9840,
								confidence: null,
							},
							{
								text: ' blends',
								startMs: 10080,
								endMs: 10360,
								timestampMs: 10220,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' them',
								startMs: 10360,
								endMs: 10880,
								timestampMs: 10620,
								confidence: null,
							},
							{
								text: ' together,',
								startMs: 10880,
								endMs: 11260,
								timestampMs: 11070,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' simulating',
								startMs: 11680,
								endMs: 12440,
								timestampMs: 12060,
								confidence: null,
							},
							{
								text: ' an',
								startMs: 12440,
								endMs: 12760,
								timestampMs: 12600,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' effect',
								startMs: 12760,
								endMs: 13340,
								timestampMs: 13050,
								confidence: null,
							},
							{
								text: ' that',
								startMs: 13340,
								endMs: 13960,
								timestampMs: 13650,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' naturally',
								startMs: 13960,
								endMs: 14560,
								timestampMs: 14260,
								confidence: null,
							},
							{
								text: ' occurs',
								startMs: 14560,
								endMs: 15180,
								timestampMs: 14870,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' when',
								startMs: 15180,
								endMs: 15600,
								timestampMs: 15390,
								confidence: null,
							},
							{
								text: ' using',
								startMs: 15600,
								endMs: 16140,
								timestampMs: 15870,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' traditional',
								startMs: 16140,
								endMs: 16420,
								timestampMs: 16280,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' video',
								startMs: 16420,
								endMs: 16940,
								timestampMs: 16680,
								confidence: null,
							},
							{
								text: ' cameras.',
								startMs: 16940,
								endMs: 17400,
								timestampMs: 17170,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="2 - Rendering and live preview"
					trimBefore={152}
					durationInFrames={220}
				>
					<Video
						name="motionblur2.mov"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur2-877e2ac3e47a.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.28,
								temperature: -0.12,
								tint: -0.23,
								contrast: 1.02,
								shadows: 0.05,
								highlights: -0.08,
							}),
						]}
						cropLeft={portrait ? 0.297101449 : 0.324275362}
						cropRight={portrait ? 0.213768116 : 0.240942029}
						cropTop={portrait ? 0.141706924 : 0.070048309}
						cropBottom={portrait ? 0.085346216 : 0.060386473}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-656px 784px' : '244px -87px',
						}}
					/>
					<Audio
						name="motionblur2 - dialogue"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur2-auphonic-35babfd50e39.flac"
					/>
					<MotionBlurTransition
						name="2 - Motion blur on a transition"
						from={152}
						durationInFrames={57}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					/>
					<MotionBlurBounce
						name="2 - Motion blur on an edge bounce"
						from={209}
						durationInFrames={58}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					/>
					<MotionBlurAdjustment
						name="2 - Motion blur adjustment"
						from={267}
						durationInFrames={105}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					/>
					<BasicCaptions
						name="2 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Motion',
								startMs: 5230,
								endMs: 5350,
								timestampMs: 5290,
								confidence: null,
							},
							{
								text: ' blur',
								startMs: 5350,
								endMs: 5650,
								timestampMs: 5500,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 5650,
								endMs: 5830,
								timestampMs: 5740,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' be',
								startMs: 5830,
								endMs: 6090,
								timestampMs: 5960,
								confidence: null,
							},
							{
								text: ' applied',
								startMs: 6090,
								endMs: 6290,
								timestampMs: 6190,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 6290,
								endMs: 6530,
								timestampMs: 6410,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' any',
								startMs: 6530,
								endMs: 6910,
								timestampMs: 6720,
								confidence: null,
							},
							{
								text: ' content',
								startMs: 6910,
								endMs: 7210,
								timestampMs: 7060,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' in',
								startMs: 7210,
								endMs: 7330,
								timestampMs: 7270,
								confidence: null,
							},
							{
								text: ' Remotion',
								startMs: 7330,
								endMs: 7870,
								timestampMs: 7600,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 7870,
								endMs: 7990,
								timestampMs: 7930,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 7990,
								endMs: 8270,
								timestampMs: 8130,
								confidence: null,
							},
							{
								text: ' works',
								startMs: 8270,
								endMs: 8610,
								timestampMs: 8440,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' during',
								startMs: 8610,
								endMs: 8910,
								timestampMs: 8760,
								confidence: null,
							},
							{
								text: ' both',
								startMs: 8910,
								endMs: 9270,
								timestampMs: 9090,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' rendering',
								startMs: 9270,
								endMs: 9610,
								timestampMs: 9440,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' but',
								startMs: 9870,
								endMs: 10170,
								timestampMs: 10020,
								confidence: null,
							},
							{
								text: ' also',
								startMs: 10170,
								endMs: 10530,
								timestampMs: 10350,
								confidence: null,
							},
							{
								text: ' during',
								startMs: 10530,
								endMs: 10850,
								timestampMs: 10690,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' live',
								startMs: 10850,
								endMs: 11210,
								timestampMs: 11030,
								confidence: null,
							},
							{
								text: ' preview',
								startMs: 11210,
								endMs: 11470,
								timestampMs: 11340,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' in',
								startMs: 11470,
								endMs: 11590,
								timestampMs: 11530,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 11590,
								endMs: 11810,
								timestampMs: 11700,
								confidence: null,
							},
							{
								text: ' browser.',
								startMs: 11810,
								endMs: 12400,
								timestampMs: 12105,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="3 - Ask your agent"
					trimBefore={AGENT_SCENE_TRIM_BEFORE}
					durationInFrames={AGENT_SCENE_DURATION_IN_FRAMES}
				>
					<Video
						name="motionblur3.mov"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur3-be5cefd51678.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.28,
								temperature: -0.12,
								tint: -0.23,
								contrast: 1.02,
								shadows: 0.05,
								highlights: -0.08,
							}),
						]}
						cropLeft={portrait ? 0.297101449 : 0.324275362}
						cropRight={portrait ? 0.213768116 : 0.240942029}
						cropTop={portrait ? 0.141706924 : 0.070048309}
						cropBottom={portrait ? 0.085346216 : 0.060386473}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-656px 784px' : '244px -87px',
						}}
					/>
					<Audio
						name="motionblur3 - dialogue"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur3-auphonic-ca939e5d5769.flac"
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: portrait ? 1080 : 960,
							height: portrait ? 960 : 1080,
							overflow: 'hidden',
							backgroundColor: '#ffffff',
						}}
					>
						<MotionBlurCopyContext
							name="3 - Copy context for agents"
							from={AGENT_SCENE_TRIM_BEFORE}
							durationInFrames={MOTION_BLUR_COPY_CONTEXT_DURATION_IN_FRAMES}
							width={portrait ? 1080 : 960}
							height={portrait ? 960 : 1080}
							style={{
								left: 0,
								top: 0,
								backgroundColor: '#1f2427',
								overflow: 'hidden',
							}}
						/>
						<MotionBlurAgentPrompt
							name="3 - Request motion blur, then paste context"
							from={
								AGENT_SCENE_TRIM_BEFORE +
								MOTION_BLUR_COPY_CONTEXT_DURATION_IN_FRAMES
							}
							durationInFrames={
								AGENT_SCENE_DURATION_IN_FRAMES -
								MOTION_BLUR_COPY_CONTEXT_DURATION_IN_FRAMES
							}
							pastedContext={
								'Triangle motion blur\nRemotionTriangleMotionBlur.tsx:30'
							}
							prompt="add motion blur to this"
							heading=""
							projectName="blur-short"
							pasteFrame={45}
							typingStartFrame={5}
							typingDurationInFrames={32}
							style={{
								position: 'absolute',
								left: '55%',
								top: '43%',
								width: 940,
								height: 622,
								translate: '-50% -50%',
								rotate: EXPLORE_CAMERA_ANGLE,
								scale: portrait ? 1.25 : 10 / 9,
								transformOrigin: '50% 50%',
							}}
						/>
					</div>
					<BasicCaptions
						name="3 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Reference',
								startMs: 4130,
								endMs: 4510,
								timestampMs: 4320,
								confidence: null,
							},
							{
								text: ' any',
								startMs: 4510,
								endMs: 4790,
								timestampMs: 4650,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' element',
								startMs: 4790,
								endMs: 5130,
								timestampMs: 4960,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 5130,
								endMs: 5430,
								timestampMs: 5280,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' ask',
								startMs: 5430,
								endMs: 5610,
								timestampMs: 5520,
								confidence: null,
							},
							{
								text: ' your',
								startMs: 5610,
								endMs: 5990,
								timestampMs: 5800,
								confidence: null,
							},
							{
								text: ' agent',
								startMs: 5990,
								endMs: 6230,
								timestampMs: 6110,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' to',
								startMs: 6230,
								endMs: 6510,
								timestampMs: 6370,
								confidence: null,
							},
							{
								text: ' add',
								startMs: 6510,
								endMs: 6890,
								timestampMs: 6700,
								confidence: null,
							},
							{
								text: ' motion',
								startMs: 6890,
								endMs: 7110,
								timestampMs: 7000,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' blur',
								startMs: 7110,
								endMs: 7370,
								timestampMs: 7240,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 7370,
								endMs: 7490,
								timestampMs: 7430,
								confidence: null,
							},
							{
								text: ' it.',
								startMs: 7540,
								endMs: 7833,
								timestampMs: 7686,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="4 - Enable it in Studio"
					trimBefore={68}
					durationInFrames={142}
				>
					<Video
						name="motionblur4.mov"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur4-63f184179492.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.28,
								temperature: -0.12,
								tint: -0.23,
								contrast: 1.02,
								shadows: 0.05,
								highlights: -0.08,
							}),
						]}
						cropLeft={portrait ? 0.297101449 : 0.324275362}
						cropRight={portrait ? 0.213768116 : 0.240942029}
						cropTop={portrait ? 0.141706924 : 0.070048309}
						cropBottom={portrait ? 0.085346216 : 0.060386473}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-656px 784px' : '244px -87px',
						}}
					/>
					<Audio
						name="motionblur4 - dialogue"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur4-auphonic-041ad03f19e2.flac"
					/>
					<MotionBlurSelect
						name="4 - Select an item"
						from={68}
						durationInFrames={87}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					/>
					<MotionBlurClick
						name="4 - Click the Motion blur button"
						from={155}
						durationInFrames={55}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					/>
					<BasicCaptions
						name="4 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Or',
								startMs: 2410,
								endMs: 2730,
								timestampMs: 2570,
								confidence: null,
							},
							{
								text: ' select',
								startMs: 2730,
								endMs: 3050,
								timestampMs: 2890,
								confidence: null,
							},
							{
								text: ' any',
								startMs: 3050,
								endMs: 3290,
								timestampMs: 3170,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' element',
								startMs: 3290,
								endMs: 3590,
								timestampMs: 3440,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 3590,
								endMs: 3730,
								timestampMs: 3660,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 3730,
								endMs: 3890,
								timestampMs: 3810,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Remotion',
								startMs: 3890,
								endMs: 4390,
								timestampMs: 4140,
								confidence: null,
							},
							{
								text: ' Studio',
								startMs: 4390,
								endMs: 4950,
								timestampMs: 4670,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 4950,
								endMs: 5170,
								timestampMs: 5060,
								confidence: null,
							},
							{
								text: ' click',
								startMs: 5170,
								endMs: 5370,
								timestampMs: 5270,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 5370,
								endMs: 5750,
								timestampMs: 5560,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Motion',
								startMs: 5750,
								endMs: 6090,
								timestampMs: 5920,
								confidence: null,
							},
							{
								text: ' blur',
								startMs: 6090,
								endMs: 6610,
								timestampMs: 6350,
								confidence: null,
							},
							{
								text: ' button.',
								startMs: 6610,
								endMs: 7000,
								timestampMs: 6805,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="5 - Use the React component"
					trimBefore={175}
					durationInFrames={238}
				>
					<Video
						name="motionblur5.mov"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur5-56ef839c3bc9.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.22,
								temperature: -0.12,
								tint: -0.23,
								contrast: 1.02,
								shadows: 0.05,
								highlights: -0.08,
							}),
						]}
						cropLeft={portrait ? 0.297101449 : 0.324275362}
						cropRight={portrait ? 0.213768116 : 0.240942029}
						cropTop={portrait ? 0.141706924 : 0.070048309}
						cropBottom={portrait ? 0.085346216 : 0.060386473}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-656px 784px' : '244px -87px',
						}}
					/>
					<Audio
						name="motionblur5 - dialogue"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur5-auphonic-a1b798ab2831.flac"
					/>
					<MotionBlurCodeCloseup
						name="5 - Motion blur API code close-up"
						from={175}
						durationInFrames={79}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					/>
					<MotionBlurDocumentation
						name="5 - Motion blur guide"
						from={254}
						durationInFrames={159}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					/>
					<BasicCaptions
						name="5 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'If',
								startMs: 5833,
								endMs: 5940,
								timestampMs: 5886,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 5940,
								endMs: 6060,
								timestampMs: 6000,
								confidence: null,
							},
							{
								text: ' are',
								startMs: 6060,
								endMs: 6300,
								timestampMs: 6180,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' building',
								startMs: 6300,
								endMs: 6540,
								timestampMs: 6420,
								confidence: null,
							},
							{
								text: ' an',
								startMs: 6540,
								endMs: 6700,
								timestampMs: 6620,
								confidence: null,
							},
							{
								text: ' app',
								startMs: 6700,
								endMs: 6880,
								timestampMs: 6790,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 6880,
								endMs: 7000,
								timestampMs: 6940,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 7000,
								endMs: 7180,
								timestampMs: 7090,
								confidence: null,
							},
							{
								text: ' want',
								startMs: 7180,
								endMs: 7280,
								timestampMs: 7230,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' to',
								startMs: 7280,
								endMs: 7460,
								timestampMs: 7370,
								confidence: null,
							},
							{
								text: ' use',
								startMs: 7460,
								endMs: 7660,
								timestampMs: 7560,
								confidence: null,
							},
							{
								text: ' this',
								startMs: 7660,
								endMs: 7940,
								timestampMs: 7800,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' programmatically,',
								startMs: 7940,
								endMs: 8880,
								timestampMs: 8410,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' we',
								startMs: 8880,
								endMs: 9260,
								timestampMs: 9070,
								confidence: null,
							},
							{
								text: ' also',
								startMs: 9260,
								endMs: 9520,
								timestampMs: 9390,
								confidence: null,
							},
							{
								text: ' got',
								startMs: 9520,
								endMs: 9780,
								timestampMs: 9650,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 9780,
								endMs: 10020,
								timestampMs: 9900,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' with',
								startMs: 10020,
								endMs: 10180,
								timestampMs: 10100,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 10180,
								endMs: 10380,
								timestampMs: 10280,
								confidence: null,
							},
							{
								text: ' new',
								startMs: 10380,
								endMs: 10880,
								timestampMs: 10630,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' <HtmlInCanvasMotionBlur>',
								startMs: 10880,
								endMs: 12800,
								timestampMs: 11840,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' React',
								startMs: 12800,
								endMs: 13220,
								timestampMs: 13010,
								confidence: null,
							},
							{
								text: ' component.',
								startMs: 13220,
								endMs: 13766,
								timestampMs: 13493,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="6 - Everything looks smoother"
					trimBefore={MOTION_BLUR_OUTRO_START_FRAME}
					durationInFrames={178}
				>
					<MotionBlurOutro>
						<Video
							name="motionblur6.mov"
							src="https://remotion.media/motion-blur-2026-11-17/motionblur6-bfcb3ee8d79b.mov"
							muted
							objectFit="cover"
							effects={[
								colorCorrection({
									exposure: 0.22,
									temperature: -0.12,
									tint: -0.23,
									contrast: 1.02,
									shadows: 0.05,
									highlights: -0.08,
								}),
							]}
							cropLeft={portrait ? 0.297101449 : 0.324275362}
							cropRight={portrait ? 0.213768116 : 0.240942029}
							cropTop={portrait ? 0.141706924 : 0.070048309}
							cropBottom={portrait ? 0.085346216 : 0.060386473}
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								width: 2208,
								height: 1242,
								translate: portrait ? '-656px 784px' : '244px -87px',
							}}
						/>
					</MotionBlurOutro>
					<Audio
						name="motionblur6 - dialogue"
						src="https://remotion.media/motion-blur-2026-11-17/motionblur6-auphonic-4b4e7dc94a41.flac"
					/>
					<BasicCaptions
						name="6 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Everything',
								startMs: 2330,
								endMs: 2550,
								timestampMs: 2440,
								confidence: null,
							},
							{
								text: ' looks',
								startMs: 2550,
								endMs: 2710,
								timestampMs: 2630,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' a',
								startMs: 2710,
								endMs: 2910,
								timestampMs: 2810,
								confidence: null,
							},
							{
								text: ' bit',
								startMs: 2910,
								endMs: 3270,
								timestampMs: 3090,
								confidence: null,
							},
							{
								text: ' smoother',
								startMs: 3270,
								endMs: 3550,
								timestampMs: 3410,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' with',
								startMs: 3550,
								endMs: 3690,
								timestampMs: 3620,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 3690,
								endMs: 3790,
								timestampMs: 3740,
								confidence: null,
							},
							{
								text: ' bit',
								startMs: 3790,
								endMs: 3910,
								timestampMs: 3850,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 3910,
								endMs: 4250,
								timestampMs: 4080,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' motion',
								startMs: 4250,
								endMs: 4530,
								timestampMs: 4390,
								confidence: null,
							},
							{
								text: ' blur,',
								startMs: 4530,
								endMs: 4870,
								timestampMs: 4700,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' so',
								startMs: 4870,
								endMs: 5030,
								timestampMs: 4950,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 5030,
								endMs: 5230,
								timestampMs: 5130,
								confidence: null,
							},
							{
								text: ' think',
								startMs: 5230,
								endMs: 5430,
								timestampMs: 5330,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: " I'm",
								startMs: 5430,
								endMs: 5630,
								timestampMs: 5530,
								confidence: null,
							},
							{
								text: ' going',
								startMs: 5630,
								endMs: 5790,
								timestampMs: 5710,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 5790,
								endMs: 5990,
								timestampMs: 5890,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' use',
								startMs: 5990,
								endMs: 6190,
								timestampMs: 6090,
								confidence: null,
							},
							{
								text: ' this',
								startMs: 6190,
								endMs: 6510,
								timestampMs: 6350,
								confidence: null,
							},
							{
								text: ' for',
								startMs: 6510,
								endMs: 7050,
								timestampMs: 6780,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' everything',
								startMs: 7050,
								endMs: 7630,
								timestampMs: 7340,
								confidence: null,
							},
							{
								text: ' now.',
								startMs: 7630,
								endMs: 8100,
								timestampMs: 7865,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</div>
	);
};
