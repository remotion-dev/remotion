import {Audio, Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {Sequence, Track} from 'remotion';
import {BasicCaptions} from '../basic-captions';
import {TimelineAudioRollingEditComposition} from '../TimelineAudioRollingEditComposition';
import {ChatGPTPluginBroll} from './ChatGPTPluginBroll';
import {CodexDropSidebar} from './CodexDropSidebar';
import {
	GitHubHeaderBroll,
	GitHubStarsBroll,
	NpmDownloadsBroll,
} from './CommunityStatsBroll';
import {EditingCapabilitiesBroll} from './EditingCapabilitiesBroll';
import {
	ShortBeatMatchPrompt,
	ShortMotionGraphicsTitle,
	ShortPlaceholderTimeline,
	ShortPluginPrompt,
	ShortPrompt,
	ShortSoundtrackDemo,
	ShortSoundtrackMusic,
	ShortSoundtrackPlayback,
	ShortSoundtrackPresenterPush,
} from './ShortFormBroll';

// 1080x1920 short-form cut of AgenticallyProgrammatically.
// Split screen: cutaways fill the top half, the presenter fills the bottom half.
// Captions sit on the seam in the middle of the frame.
// B-roll `from` values are source-take frames, like in the long-form video.
export const AgenticallyProgrammaticallyShort = () => {
	return (
		<>
			<TransitionSeries name="AgenticallyProgrammatically - short-form cut">
				<TransitionSeries.Sequence
					name="1 - Edit clips, keyframes, and audio"
					trimBefore={84}
					durationInFrames={212}
				>
					<Video
						name="agent1.mov"
						src="https://remotion.media/agent-2026-11-06/agent1-f0c350b11f3a.mov"
						muted
						cropLeft={0.297101449}
						cropRight={0.213768116}
						cropTop={0.141706924}
						cropBottom={0.085346216}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							objectFit: 'cover',
							translate: '-656px 784px',
						}}
					/>
					<Audio
						name="agent1 - cleaned dialogue"
						src="https://remotion.media/agent-2026-11-06/audio/agent1-auphonic-6d6e4e6e3a42.flac"
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 1080,
							height: 960,
							overflow: 'hidden',
						}}
					>
						<Track name="1 - Cutaways">
							<EditingCapabilitiesBroll
								name="1 - Trim clips and move keyframes"
								from={84}
								durationInFrames={136 * (124 / 142)}
								playbackRate={124 / 142}
								width={1920}
								height={1080}
								style={{
									left: -420,
									top: -60,
									scale: 0.889,
									backgroundColor: '#1c1e23',
									overflow: 'hidden',
								}}
							/>
							<TimelineAudioRollingEditComposition
								name="1 - Audio rolling edit - hover cursors"
								cursorSpin
								plainAngle
								from={220}
								durationInFrames={76 * (57 / 70)}
								playbackRate={57 / 70}
								width={1080}
								height={960}
								style={{
									scale: 1.35,
									backgroundColor: '#15161b',
									overflow: 'hidden',
								}}
							/>
						</Track>
					</div>
					<BasicCaptions
						name="1 - Captions"
						width={1040}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: 20,
							top: 860,
							height: 200,
							fontSize: 80,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: 40,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Remotion',
								startMs: 2920,
								endMs: 3360,
								timestampMs: 3140,
								confidence: null,
							},
							{
								text: ' now',
								startMs: 3360,
								endMs: 3520,
								timestampMs: 3440,
								confidence: null,
							},
							{
								text: ' has',
								startMs: 3520,
								endMs: 3700,
								timestampMs: 3610,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' an',
								startMs: 3700,
								endMs: 3840,
								timestampMs: 3770,
								confidence: null,
							},
							{
								text: ' interactive',
								startMs: 3840,
								endMs: 4560,
								timestampMs: 4200,
								confidence: null,
							},
							{
								text: ' timeline',
								startMs: 4560,
								endMs: 5120,
								timestampMs: 4840,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' like',
								startMs: 5120,
								endMs: 5480,
								timestampMs: 5300,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 5480,
								endMs: 5540,
								timestampMs: 5510,
								confidence: null,
							},
							{
								text: ' regular',
								startMs: 5540,
								endMs: 6080,
								timestampMs: 5810,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' video',
								startMs: 6080,
								endMs: 6460,
								timestampMs: 6270,
								confidence: null,
							},
							{
								text: ' editor,',
								startMs: 6460,
								endMs: 7360,
								timestampMs: 6910,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' but',
								startMs: 7360,
								endMs: 7420,
								timestampMs: 7390,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 7420,
								endMs: 7680,
								timestampMs: 7550,
								confidence: null,
							},
							{
								text: ' stays',
								startMs: 7680,
								endMs: 8060,
								timestampMs: 7870,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 8060,
								endMs: 8220,
								timestampMs: 8140,
								confidence: null,
							},
							{
								text: ' sync',
								startMs: 8220,
								endMs: 8560,
								timestampMs: 8390,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' with',
								startMs: 8560,
								endMs: 8880,
								timestampMs: 8720,
								confidence: null,
							},
							{
								text: ' your',
								startMs: 8880,
								endMs: 9220,
								timestampMs: 9050,
								confidence: null,
							},
							{
								text: ' agent.',
								startMs: 9220,
								endMs: 9620,
								timestampMs: 9420,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="2 - Edit a video with ChatGPT"
					trimBefore={234}
					durationInFrames={260}
				>
					<Video
						name="agent2.mov"
						src="https://remotion.media/agent-2026-11-06/agent2-5cae6cf51c39.mov"
						muted
						cropLeft={0.297101449}
						cropRight={0.213768116}
						cropTop={0.141706924}
						cropBottom={0.085346216}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							objectFit: 'cover',
							translate: '-656px 784px',
						}}
					/>
					<Audio
						name="agent2 - cleaned dialogue"
						src="https://remotion.media/agent-2026-11-06/audio/agent2-auphonic-960fcdde9b62.flac"
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 1080,
							height: 960,
							overflow: 'hidden',
						}}
					>
						<Track name="2 - Cutaways">
							<ShortPluginPrompt
								name="2 - Invoke the Remotion plugin in ChatGPT"
								from={234}
								durationInFrames={122}
							/>
						</Track>
						<CodexDropSidebar
							name="2 - Drop camera footage into the agent"
							fadeIn={false}
							from={356}
							durationInFrames={126}
							playbackRate={126 / 138}
							width={1920}
							height={1080}
							style={{
								left: -420,
								top: -60,
								scale: 1.2857,
								translate: '-694px -77px',
							}}
						/>
					</div>
					<BasicCaptions
						name="2 - Captions"
						width={1040}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: 20,
							top: 860,
							height: 200,
							fontSize: 80,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: 40,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'This',
								startMs: 7920,
								endMs: 8120,
								timestampMs: 8020,
								confidence: null,
							},
							{
								text: ' makes',
								startMs: 8120,
								endMs: 8540,
								timestampMs: 8330,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 8540,
								endMs: 8700,
								timestampMs: 8620,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' super',
								startMs: 8700,
								endMs: 9120,
								timestampMs: 8910,
								confidence: null,
							},
							{
								text: ' easy',
								startMs: 9120,
								endMs: 9480,
								timestampMs: 9300,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' to',
								startMs: 9480,
								endMs: 9600,
								timestampMs: 9540,
								confidence: null,
							},
							{
								text: ' edit',
								startMs: 9600,
								endMs: 9920,
								timestampMs: 9760,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 9920,
								endMs: 10000,
								timestampMs: 9960,
								confidence: null,
							},
							{
								text: ' video',
								startMs: 10000,
								endMs: 10500,
								timestampMs: 10250,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' with',
								startMs: 10500,
								endMs: 10760,
								timestampMs: 10630,
								confidence: null,
							},
							{
								text: ' ChatGPT.',
								startMs: 10760,
								endMs: 11880,
								timestampMs: 11320,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Drag',
								startMs: 11880,
								endMs: 12040,
								timestampMs: 11960,
								confidence: null,
							},
							{
								text: ' some',
								startMs: 12040,
								endMs: 12300,
								timestampMs: 12170,
								confidence: null,
							},
							{
								text: ' footage',
								startMs: 12300,
								endMs: 12800,
								timestampMs: 12550,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' into',
								startMs: 12800,
								endMs: 13060,
								timestampMs: 12930,
								confidence: null,
							},
							{
								text: ' your',
								startMs: 13060,
								endMs: 13320,
								timestampMs: 13190,
								confidence: null,
							},
							{
								text: ' agent',
								startMs: 13320,
								endMs: 13700,
								timestampMs: 13510,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 13700,
								endMs: 13960,
								timestampMs: 13830,
								confidence: null,
							},
							{
								text: ' ask',
								startMs: 13960,
								endMs: 14260,
								timestampMs: 14110,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 14260,
								endMs: 14360,
								timestampMs: 14310,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 14360,
								endMs: 14500,
								timestampMs: 14430,
								confidence: null,
							},
							{
								text: ' be',
								startMs: 14500,
								endMs: 14660,
								timestampMs: 14580,
								confidence: null,
							},
							{
								text: ' edited',
								startMs: 14660,
								endMs: 15140,
								timestampMs: 14900,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' with',
								startMs: 15140,
								endMs: 15480,
								timestampMs: 15310,
								confidence: null,
							},
							{
								text: ' Remotion.',
								startMs: 15480,
								endMs: 16260,
								timestampMs: 15870,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="3 - Ask for motion graphics or captions"
					trimBefore={97}
					durationInFrames={130}
				>
					<Video
						name="agent3.mov"
						src="https://remotion.media/agent-2026-11-06/agent3-3eeffef7db4a.mov"
						muted
						cropLeft={0.297101449}
						cropRight={0.213768116}
						cropTop={0.141706924}
						cropBottom={0.085346216}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							objectFit: 'cover',
							translate: '-656px 784px',
						}}
					/>
					<Audio
						name="agent3 - cleaned dialogue"
						src="https://remotion.media/agent-2026-11-06/audio/agent3-auphonic-183cc47431a3.flac"
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 1080,
							height: 960,
							overflow: 'hidden',
						}}
					>
						<Track name="3 - Cutaways">
							<ShortPrompt
								name="3 - Ask for motion graphics"
								from={97}
								durationInFrames={54}
								theme="light"
								pluginName="Remotion"
								isInitialPrompt={false}
								prompt="Put these videos on the timeline with captions and motion graphics as well."
								typingStartFrame={6}
								typingDurationInFrames={42}
								cameraDurationInFrames={54}
							/>
							<ShortMotionGraphicsTitle
								name="3 - Added Roller Ski Commute title"
								from={151}
								durationInFrames={29}
							/>
							<EditingCapabilitiesBroll
								name="3 - Drag captions on the canvas"
								from={180}
								trimBefore={124}
								durationInFrames={61}
								playbackRate={61 / 47}
								width={1920}
								height={1080}
								style={{
									left: -420,
									top: -60,
									scale: 0.889,
									backgroundColor: '#1c1e23',
									overflow: 'hidden',
								}}
							/>
						</Track>
					</div>
					<BasicCaptions
						name="3 - Captions"
						width={1040}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: 20,
							top: 860,
							height: 200,
							fontSize: 80,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: 40,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'And',
								startMs: 3360,
								endMs: 3420,
								timestampMs: 3390,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 3420,
								endMs: 3560,
								timestampMs: 3490,
								confidence: null,
							},
							{
								text: ' course',
								startMs: 3560,
								endMs: 4020,
								timestampMs: 3790,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' you',
								startMs: 4020,
								endMs: 4160,
								timestampMs: 4090,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 4160,
								endMs: 4360,
								timestampMs: 4260,
								confidence: null,
							},
							{
								text: ' also',
								startMs: 4360,
								endMs: 4640,
								timestampMs: 4500,
								confidence: null,
							},
							{
								text: ' ask',
								startMs: 4640,
								endMs: 4840,
								timestampMs: 4740,
								confidence: null,
							},
							{
								text: ' for',
								startMs: 4840,
								endMs: 5040,
								timestampMs: 4940,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' motion',
								startMs: 5040,
								endMs: 5440,
								timestampMs: 5240,
								confidence: null,
							},
							{
								text: ' graphics',
								startMs: 5440,
								endMs: 6000,
								timestampMs: 5720,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' or',
								startMs: 6000,
								endMs: 6240,
								timestampMs: 6120,
								confidence: null,
							},
							{
								text: ' captions',
								startMs: 6240,
								endMs: 6680,
								timestampMs: 6460,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 6680,
								endMs: 6800,
								timestampMs: 6740,
								confidence: null,
							},
							{
								text: ' be',
								startMs: 6800,
								endMs: 6920,
								timestampMs: 6860,
								confidence: null,
							},
							{
								text: ' added.',
								startMs: 6920,
								endMs: 7380,
								timestampMs: 7150,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="4 - Start with some music"
					trimBefore={67}
					durationInFrames={304}
				>
					<Video
						name="agent4.mov"
						src="https://remotion.media/agent-2026-11-06/agent4-32bf758bf890.mov"
						muted
						cropLeft={0.276268116}
						cropRight={0.234601449}
						cropTop={0.141706924}
						cropBottom={0.085346216}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							objectFit: 'cover',
							translate: '-610px 784px',
						}}
					/>
					<Audio
						name="agent4 - cleaned dialogue"
						src="https://remotion.media/agent-2026-11-06/audio/agent4-auphonic-105adc7f32bd.flac"
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 1080,
							height: 960,
							overflow: 'hidden',
						}}
					>
						<Track name="4 - Cutaways">
							<ShortBeatMatchPrompt
								name="4 - Analyze the beat"
								from={67}
								durationInFrames={223}
							/>
							<ShortPlaceholderTimeline
								name="4 - Placeholders on the timeline"
								from={290}
								durationInFrames={81}
							/>
						</Track>
					</div>
					<BasicCaptions
						name="4 - Captions"
						width={1040}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: 20,
							top: 860,
							height: 200,
							fontSize: 80,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Here GT Planar',
							fontWeight: 500,
							paddingInline: 40,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Or',
								startMs: 2360,
								endMs: 2400,
								timestampMs: 2380,
								confidence: null,
							},
							{
								text: ' what',
								startMs: 2400,
								endMs: 2640,
								timestampMs: 2520,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 2640,
								endMs: 2840,
								timestampMs: 2740,
								confidence: null,
							},
							{
								text: ' also',
								startMs: 2840,
								endMs: 3080,
								timestampMs: 2960,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' super',
								startMs: 3080,
								endMs: 3520,
								timestampMs: 3300,
								confidence: null,
							},
							{
								text: ' cool,',
								startMs: 3520,
								endMs: 4120,
								timestampMs: 3820,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' start',
								startMs: 4120,
								endMs: 4340,
								timestampMs: 4230,
								confidence: null,
							},
							{
								text: ' with',
								startMs: 4340,
								endMs: 4600,
								timestampMs: 4470,
								confidence: null,
							},
							{
								text: ' some',
								startMs: 4600,
								endMs: 4840,
								timestampMs: 4720,
								confidence: null,
							},
							{
								text: ' music,',
								startMs: 4840,
								endMs: 5780,
								timestampMs: 5310,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' ask',
								startMs: 5780,
								endMs: 5980,
								timestampMs: 5880,
								confidence: null,
							},
							{
								text: ' your',
								startMs: 5980,
								endMs: 6400,
								timestampMs: 6190,
								confidence: null,
							},
							{
								text: ' agent',
								startMs: 6400,
								endMs: 6900,
								timestampMs: 6650,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' to',
								startMs: 6900,
								endMs: 7100,
								timestampMs: 7000,
								confidence: null,
							},
							{
								text: ' analyze',
								startMs: 7100,
								endMs: 7800,
								timestampMs: 7450,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 7800,
								endMs: 8120,
								timestampMs: 7960,
								confidence: null,
							},
							{
								text: ' beat',
								startMs: 8120,
								endMs: 8720,
								timestampMs: 8420,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 8720,
								endMs: 8780,
								timestampMs: 8750,
								confidence: null,
							},
							{
								text: ' place',
								startMs: 8780,
								endMs: 9240,
								timestampMs: 9010,
								confidence: null,
							},
							{
								text: ' some',
								startMs: 9240,
								endMs: 9680,
								timestampMs: 9460,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' placeholder',
								startMs: 9680,
								endMs: 10480,
								timestampMs: 10080,
								confidence: null,
							},
							{
								text: ' items',
								startMs: 10480,
								endMs: 10900,
								timestampMs: 10690,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' on',
								startMs: 10900,
								endMs: 11080,
								timestampMs: 10990,
								confidence: null,
							},
							{
								text: ' your',
								startMs: 11080,
								endMs: 11440,
								timestampMs: 11260,
								confidence: null,
							},
							{
								text: ' timeline.',
								startMs: 11440,
								endMs: 12160,
								timestampMs: 11800,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="4b - Hear the beat-matched timeline"
					durationInFrames={169}
				>
					<ShortSoundtrackPresenterPush direction="down">
						<Video
							name="Hold presenter while the timeline expands"
							src="https://remotion.media/agent-2026-11-06/agent4-32bf758bf890.mov"
							muted
							freeze={370}
							cropLeft={0.276268116}
							cropRight={0.234601449}
							cropTop={0.141706924}
							cropBottom={0.085346216}
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								width: 2208,
								height: 1242,
								objectFit: 'cover',
								translate: '-610px 784px',
							}}
						/>
					</ShortSoundtrackPresenterPush>
					<ShortSoundtrackDemo
						name="Timeline expands into the music-only demo"
						durationInFrames={169}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="5 - Try the ChatGPT or Claude plugin"
					trimBefore={60}
					durationInFrames={371}
				>
					<ShortSoundtrackPresenterPush direction="up">
						<Video
							name="agent5.mov"
							src="https://remotion.media/agent-2026-11-06/agent5-88d40087caaf.mov"
							muted
							cropLeft={0.291666667}
							cropRight={0.219202899}
							cropTop={0.141706924}
							cropBottom={0.085346216}
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								width: 2208,
								height: 1242,
								objectFit: 'cover',
								translate: '-644px 784px',
							}}
						/>
					</ShortSoundtrackPresenterPush>
					<Audio
						name="agent5 - cleaned dialogue"
						src="https://remotion.media/agent-2026-11-06/audio/agent5-auphonic-c470a60da493.flac"
					/>
					<ShortSoundtrackPlayback
						name="5 - Timeline keeps playing as narration resumes"
						from={60}
						trimBefore={169}
						durationInFrames={60}
						width={1080}
						height={1920}
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 1080,
							height: 960,
							overflow: 'hidden',
						}}
					>
						<Track name="5 - Cutaways">
							<ChatGPTPluginBroll
								name="5 - Pan across the ChatGPT plugin"
								from={120}
								durationInFrames={121}
								playbackRate={121 / 172}
							/>
							<GitHubHeaderBroll
								name="5 - remotion-dev/remotion header"
								from={292}
								durationInFrames={46}
								style={{backgroundColor: '#010409', overflow: 'hidden'}}
							/>
							<GitHubStarsBroll
								name="5 - People like it - GitHub stars"
								from={338}
								durationInFrames={45}
								style={{backgroundColor: '#0d1117'}}
							/>
							<NpmDownloadsBroll
								name="5 - People like it - npm downloads"
								from={383}
								durationInFrames={48}
								style={{backgroundColor: '#0d1117'}}
							/>
						</Track>
					</div>
					<ShortSoundtrackPresenterPush direction="up">
						<BasicCaptions
							name="5 - Captions"
							width={1040}
							combineTokensWithinMilliseconds={10000}
							style={{
								position: 'absolute',
								left: 20,
								top: 860,
								height: 200,
								fontSize: 80,
								backgroundColor: '#ffffff',
								color: '#000000',
								fontFamily: 'Here GT Planar',
								fontWeight: 500,
								paddingInline: 40,
								whiteSpace: 'nowrap',
							}}
							captions={[
								{
									text: 'Now',
									startMs: 2140,
									endMs: 2200,
									timestampMs: 2170,
									confidence: null,
								},
								{
									text: ' the',
									startMs: 2200,
									endMs: 2420,
									timestampMs: 2310,
									confidence: null,
								},
								{
									text: ' video',
									startMs: 2420,
									endMs: 2760,
									timestampMs: 2590,
									confidence: null,
									pageBreakAfter: true,
								},
								{
									text: " you'll",
									startMs: 2760,
									endMs: 3160,
									timestampMs: 2960,
									confidence: null,
								},
								{
									text: ' be',
									startMs: 3160,
									endMs: 3320,
									timestampMs: 3240,
									confidence: null,
								},
								{
									text: ' working',
									startMs: 3320,
									endMs: 3800,
									timestampMs: 3560,
									confidence: null,
								},
								{
									text: ' on',
									startMs: 3800,
									endMs: 4000,
									timestampMs: 3900,
									confidence: null,
									pageBreakAfter: true,
								},
								{
									text: ' will',
									startMs: 4000,
									endMs: 4200,
									timestampMs: 4100,
									confidence: null,
								},
								{
									text: ' flow',
									startMs: 4200,
									endMs: 4480,
									timestampMs: 4340,
									confidence: null,
								},
								{
									text: ' with',
									startMs: 4480,
									endMs: 4760,
									timestampMs: 4620,
									confidence: null,
								},
								{
									text: ' the',
									startMs: 4760,
									endMs: 4940,
									timestampMs: 4850,
									confidence: null,
								},
								{
									text: ' music.',
									startMs: 4940,
									endMs: 5960,
									timestampMs: 5450,
									confidence: null,
									pageBreakAfter: true,
								},
								{
									text: ' Try',
									startMs: 5960,
									endMs: 6020,
									timestampMs: 5990,
									confidence: null,
								},
								{
									text: ' it',
									startMs: 6020,
									endMs: 6240,
									timestampMs: 6130,
									confidence: null,
								},
								{
									text: ' yourself',
									startMs: 6240,
									endMs: 6860,
									timestampMs: 6550,
									confidence: null,
								},
								{
									text: ' today',
									startMs: 6860,
									endMs: 7240,
									timestampMs: 7050,
									confidence: null,
									pageBreakAfter: true,
								},
								{
									text: ' using',
									startMs: 7240,
									endMs: 7640,
									timestampMs: 7440,
									confidence: null,
								},
								{
									text: ' the',
									startMs: 7640,
									endMs: 7840,
									timestampMs: 7740,
									confidence: null,
								},
								{
									text: ' ChatGPT',
									startMs: 7840,
									endMs: 8400,
									timestampMs: 8120,
									confidence: null,
									pageBreakAfter: true,
								},
								{
									text: ' or',
									startMs: 8400,
									endMs: 8540,
									timestampMs: 8470,
									confidence: null,
								},
								{
									text: ' Claude',
									startMs: 8540,
									endMs: 9080,
									timestampMs: 8810,
									confidence: null,
								},
								{
									text: ' plugin',
									startMs: 9080,
									endMs: 9740,
									timestampMs: 9410,
									confidence: null,
									pageBreakAfter: true,
								},
								{
									text: ' and',
									startMs: 9740,
									endMs: 9940,
									timestampMs: 9840,
									confidence: null,
								},
								{
									text: ' experience',
									startMs: 9940,
									endMs: 10480,
									timestampMs: 10210,
									confidence: null,
									pageBreakAfter: true,
								},
								{
									text: ' it',
									startMs: 10480,
									endMs: 10620,
									timestampMs: 10550,
									confidence: null,
								},
								{
									text: ' yourself',
									startMs: 10620,
									endMs: 11160,
									timestampMs: 10890,
									confidence: null,
									pageBreakAfter: true,
								},
								{
									text: ' why',
									startMs: 11160,
									endMs: 11280,
									timestampMs: 11220,
									confidence: null,
								},
								{
									text: ' people',
									startMs: 11280,
									endMs: 11680,
									timestampMs: 11480,
									confidence: null,
								},
								{
									text: ' like',
									startMs: 11680,
									endMs: 12000,
									timestampMs: 11840,
									confidence: null,
								},
								{
									text: ' editing',
									startMs: 12000,
									endMs: 12440,
									timestampMs: 12220,
									confidence: null,
									pageBreakAfter: true,
								},
								{
									text: ' with',
									startMs: 12440,
									endMs: 12740,
									timestampMs: 12590,
									confidence: null,
								},
								{
									text: ' Remotion',
									startMs: 12740,
									endMs: 13640,
									timestampMs: 13190,
									confidence: null,
								},
								{
									text: ' a',
									startMs: 13640,
									endMs: 13760,
									timestampMs: 13700,
									confidence: null,
								},
								{
									text: ' lot.',
									startMs: 13760,
									endMs: 14280,
									timestampMs: 14020,
									confidence: null,
									pageBreakAfter: true,
								},
							]}
						/>
					</ShortSoundtrackPresenterPush>
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Sequence
				name="Music lead-in, timeline demo, and narration bed"
				from={861}
				durationInFrames={584}
				layout="none"
			>
				<ShortSoundtrackMusic />
			</Sequence>
		</>
	);
};
