import {Video} from '@remotion/media';
import {Composition, Folder, Still} from 'remotion';
import {z} from 'zod';
import {IterateFastThumbnail} from '../IterateFastThumbnail';
import {
	AgenticallyProgrammatically,
	agenticallyProgrammaticallySchema,
} from './AgenticallyProgrammatically';
import {AgenticallyProgrammaticallyShort} from './AgenticallyProgrammaticallyShort';
import {AgenticallyProgrammaticallyWithStudioUpdate} from './AgenticallyProgrammaticallyWithStudioUpdate';
import {AnnotateChatGPTBroll} from './AnnotateChatGPTBroll';
import {AvailableAgentsSidebar} from './AvailableAgentsSidebar';
import {BeatMatchPrompt} from './BeatMatchPrompt';
import {ChatGPTPluginBroll} from './ChatGPTPluginBroll';
import {ChatGPTPluginCaptureComposition} from './ChatGPTPluginCaptureComposition';
import {CodexDropSidebar} from './CodexDropSidebar';
import {
	GitHubHeaderBroll,
	GitHubStarsBroll,
	NpmDownloadsBroll,
} from './CommunityStatsBroll';
import {ComputedPropertiesBroll} from './ComputedPropertiesBroll';
import {ComputedPropertiesCaptureComposition} from './ComputedPropertiesCaptureComposition';
import {ComputedValueBroll} from './ComputedValueBroll';
import {CopyContextBroll} from './CopyContextBroll';
import {CopyContextCaptureComposition} from './CopyContextCaptureComposition';
import {CubeWaveCodeBroll} from './CubeWaveCodeBroll';
import {DeleteAiSlopBroll} from './DeleteAiSlopBroll';
import {DeleteAiSlopCaptureComposition} from './DeleteAiSlopCaptureComposition';
import {DoubleClickCodeBroll} from './DoubleClickCodeBroll';
import {DoubleClickCodeCaptureComposition} from './DoubleClickCodeCaptureComposition';
import {EarlyRemotionDemoBroll} from './EarlyRemotionDemoBroll';
import {EditingCapabilitiesBroll} from './EditingCapabilitiesBroll';
import {EndCardSidebar, publicationPlatformSchema} from './EndCardSidebar';
import {HigherLevelTaskPrompt} from './HigherLevelTaskPrompt';
import {HomepageHeroZoom} from './HomepageHeroZoom';
import {InteractiveTimelinePan} from './InteractiveTimelinePan';
import {InvokeAgentBroll} from './InvokeAgentBroll';
import {InvokeAgentCaptureComposition} from './InvokeAgentCaptureComposition';
import {
	MarkupCutBroll,
	MarkupMoveBroll,
	MarkupPasteBroll,
} from './MarkupCutBroll';
import {MottoSidebar} from './MottoSidebar';
import {OpenStudioPrompt} from './OpenStudioPrompt';
import {QuickEditsBroll} from './QuickEditsBroll';
import {RemotionOriginExchange} from './RemotionOriginExchange';
import {RestructureAgentBroll} from './RestructureAgentBroll';
import {RestructureAgentCaptureComposition} from './RestructureAgentCaptureComposition';
import {RoughCutPrompt} from './RoughCutPrompt';
import {
	ShortAgentPlugins,
	ShortBeatMatchPrompt,
	ShortMotionGraphicsTitle,
	ShortPlaceholderTimeline,
	ShortPluginPrompt,
	ShortPrompt,
	ShortSoundtrackDemo,
	ShortSoundtrackPlayback,
} from './ShortFormBroll';
import {SoundtrackTimelineCaptureComposition} from './SoundtrackTimelineCaptureComposition';
import {SoundtrackTimelinePlayback} from './SoundtrackTimelinePlayback';
import {StudioSettingsCaptureComposition} from './StudioSettingsCaptureComposition';
import {StudioWorkflowReveal} from './StudioWorkflowReveal';
import {ThreeWaysHero} from './ThreeWaysHero';
import {ThreeWaysSplitView} from './ThreeWaysSplitView';
import {WebMcpAgentsSidebar} from './WebMcpAgentsSidebar';

const SourceTake = ({src}: {readonly src: string}) => {
	return (
		<Video
			src={src}
			style={{width: '100%', height: '100%', objectFit: 'contain'}}
		/>
	);
};

export const AgenticallyProgrammaticallyCompositions = () => {
	return (
		<>
			<Folder name="AgenticallyProgrammatically">
				<Still
					id="IterateFastThumbnail"
					component={IterateFastThumbnail}
					width={1920}
					height={1080}
				/>
				<Composition
					id="AgenticallyProgrammaticallyWithStudioUpdate"
					component={AgenticallyProgrammaticallyWithStudioUpdate}
					schema={z.object({platform: publicationPlatformSchema})}
					defaultProps={{platform: 'youtube'}}
					durationInFrames={10462}
					calculateMetadata={({props}) => ({
						durationInFrames: props.platform === 'youtube' ? 10462 : 10162,
					})}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="AgenticallyProgrammatically"
					component={AgenticallyProgrammatically}
					calculateMetadata={({props}) => ({
						durationInFrames: props.platform === 'youtube' ? 9445 : 9145,
					})}
					schema={agenticallyProgrammaticallySchema}
					defaultProps={{
						startWithPanelVisible: false,
						softenOpeningVoice: false,
						platform: 'linkedin',
					}}
					durationInFrames={9145}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Folder name="Short-form">
					<Composition
						id="GitHubHeaderBroll"
						component={GitHubHeaderBroll}
						durationInFrames={46}
						fps={30}
						width={1080}
						height={960}
						defaultProps={{
							style: {backgroundColor: '#010409', overflow: 'hidden'},
						}}
					/>
					<Composition
						id="GitHubStarsBroll"
						component={GitHubStarsBroll}
						durationInFrames={45}
						fps={30}
						width={1080}
						height={960}
						defaultProps={{style: {backgroundColor: '#0d1117'}}}
					/>
					<Composition
						id="NpmDownloadsBroll"
						component={NpmDownloadsBroll}
						durationInFrames={48}
						fps={30}
						width={1080}
						height={960}
						defaultProps={{style: {backgroundColor: '#0d1117'}}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyShort"
						component={AgenticallyProgrammaticallyShort}
						durationInFrames={1446}
						fps={30}
						width={1080}
						height={1920}
					/>
					<Composition
						id="ShortMotionGraphicsTitle"
						component={ShortMotionGraphicsTitle}
						durationInFrames={29}
						fps={30}
						width={1080}
						height={960}
					/>
					<Composition
						id="ShortPluginPrompt"
						component={ShortPluginPrompt}
						durationInFrames={122}
						fps={30}
						width={1080}
						height={960}
					/>
					<Composition
						id="ShortPrompt"
						component={ShortPrompt}
						durationInFrames={130}
						fps={30}
						width={1080}
						height={960}
						defaultProps={{
							theme: 'light',
							pluginName: 'Remotion',
							isInitialPrompt: false,
							prompt:
								'Put these videos on the timeline with captions and motion graphics as well.',
							typingStartFrame: 6,
							typingDurationInFrames: 112,
							cameraDurationInFrames: 130,
						}}
					/>
					<Composition
						id="ShortBeatMatchPrompt"
						component={ShortBeatMatchPrompt}
						durationInFrames={223}
						fps={30}
						width={1080}
						height={960}
					/>
					<Composition
						id="ShortPlaceholderTimeline"
						component={ShortPlaceholderTimeline}
						durationInFrames={81}
						fps={30}
						width={1080}
						height={960}
					/>
					<Composition
						id="ShortSoundtrackDemo"
						component={ShortSoundtrackDemo}
						durationInFrames={169}
						fps={30}
						width={1080}
						height={1920}
					/>
					<Composition
						id="ShortSoundtrackPlayback"
						component={ShortSoundtrackPlayback}
						durationInFrames={169}
						fps={30}
						width={1080}
						height={1920}
					/>
					<Composition
						id="ChatGPTPluginBroll"
						component={ChatGPTPluginBroll}
						durationInFrames={113}
						fps={30}
						width={1080}
						height={960}
					/>
					<Composition
						id="ChatGPTPluginCapture"
						component={ChatGPTPluginCaptureComposition}
						durationInFrames={176}
						fps={30}
						width={3530}
						height={1758}
					/>
					<Composition
						id="ShortAgentPlugins"
						component={ShortAgentPlugins}
						durationInFrames={113}
						fps={30}
						width={1080}
						height={960}
						defaultProps={{style: {backgroundColor: '#f8fafc'}}}
					/>
				</Folder>
				<Composition
					id="WebMcpAgentsSidebar"
					component={WebMcpAgentsSidebar}
					durationInFrames={195}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="MarkupMoveBroll"
					component={MarkupMoveBroll}
					durationInFrames={157}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="MarkupCutBroll"
					component={MarkupCutBroll}
					durationInFrames={103}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="MarkupPasteBroll"
					component={MarkupPasteBroll}
					durationInFrames={79}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="CubeWaveCodeBroll"
					component={CubeWaveCodeBroll}
					durationInFrames={242}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="AvailableAgentsSidebar"
					component={AvailableAgentsSidebar}
					durationInFrames={123}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="CodexDropSidebar"
					component={CodexDropSidebar}
					durationInFrames={126}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="StudioSettingsCapture"
					component={StudioSettingsCaptureComposition}
					durationInFrames={358}
					fps={30}
					width={2830}
					height={1986}
				/>
				<Composition
					id="BeatMatchPrompt"
					component={BeatMatchPrompt}
					durationInFrames={270}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="InteractiveTimelinePan"
					component={InteractiveTimelinePan}
					durationInFrames={154}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						style: {backgroundColor: '#16181b', overflow: 'hidden'},
					}}
				/>
				<Composition
					id="EditingCapabilitiesBroll"
					component={EditingCapabilitiesBroll}
					durationInFrames={378}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						style: {backgroundColor: '#1c1e23', overflow: 'hidden'},
					}}
				/>
				<Composition
					id="MottoSidebar"
					component={MottoSidebar}
					defaultProps={{startWithPanelVisible: false}}
					durationInFrames={420}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="ThreeWaysHero"
					component={ThreeWaysHero}
					durationInFrames={330}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{style: {scale: 1.18, transformOrigin: '50% 100%'}}}
				/>
				<Composition
					id="HomepageHeroZoom"
					component={HomepageHeroZoom}
					durationInFrames={570}
					fps={30}
					width={1080}
					height={880}
				/>
				<Composition
					id="ThreeWaysSplitView"
					component={ThreeWaysSplitView}
					durationInFrames={403}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{style: {backgroundColor: '#f4f5f7'}}}
				/>
				<Composition
					id="RoughCutPrompt"
					component={RoughCutPrompt}
					durationInFrames={227}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{theme: 'dark'}}
				/>
				<Composition
					id="RoughCutPromptLight"
					component={RoughCutPrompt}
					durationInFrames={227}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{theme: 'light'}}
				/>

				<Composition
					id="RemotionOriginExchange"
					component={RemotionOriginExchange}
					durationInFrames={224}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{style: {backgroundColor: '#ffffff'}}}
				/>
				<Composition
					id="EarlyRemotionDemoBroll"
					component={EarlyRemotionDemoBroll}
					durationInFrames={159}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{style: {backgroundColor: '#ffffff'}}}
				/>
				<Composition
					id="OpenStudioPrompt"
					component={OpenStudioPrompt}
					durationInFrames={99}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="HigherLevelTaskPrompt"
					component={HigherLevelTaskPrompt}
					durationInFrames={99}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						pluginName: 'Remotion',
						isInitialPrompt: true,
						theme: 'dark',
						blurStrength: 6,
						prompt:
							"Keep an 'agent' counter. Everytime I say 'agent', increase the counter.",
						typingStartFrame: 0,
						typingDurationInFrames: 65,
						cameraDurationInFrames: 99,
					}}
				/>
				<Composition
					id="HigherLevelTaskPromptLight"
					component={HigherLevelTaskPrompt}
					durationInFrames={99}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						pluginName: 'Remotion',
						isInitialPrompt: true,
						theme: 'light',
						blurStrength: 6,
						prompt:
							"Keep an 'agent' counter. Everytime I say 'agent', increase the counter.",
						typingStartFrame: 0,
						typingDurationInFrames: 65,
						cameraDurationInFrames: 99,
					}}
				/>

				<Composition
					id="QuickEditsBroll"
					component={QuickEditsBroll}
					durationInFrames={160}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						style: {backgroundColor: '#1c1e23', overflow: 'hidden'},
					}}
				/>
				<Composition
					id="PasteContextPrompt"
					component={HigherLevelTaskPrompt}
					durationInFrames={124}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						pluginName: '',
						isInitialPrompt: false,
						theme: 'light',
						blurStrength: 6,
						prompt:
							'12 - Edit clips and delete AI slop in src/AgenticallyProgrammatically/AgenticallyProgrammatically.tsx:2571',
						typingStartFrame: 12,
						typingDurationInFrames: 1,
						cameraDurationInFrames: 124,
					}}
				/>
				<Composition
					id="StudioWorkflowReveal"
					component={StudioWorkflowReveal}
					durationInFrames={171}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						style: {backgroundColor: '#fff', overflow: 'hidden'},
					}}
				/>
				<Folder name="Source-takes">
					<Composition
						id="AgenticallyProgrammaticallyTake01"
						component={SourceTake}
						durationInFrames={573}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here1-a093d66bdf14.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake02"
						component={SourceTake}
						durationInFrames={358}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here2-2922b2c4ffc1.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake03"
						component={SourceTake}
						durationInFrames={551}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here3-4d3e68ccecde.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake04"
						component={SourceTake}
						durationInFrames={378}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here4-d54ad1d71ed5.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake05"
						component={SourceTake}
						durationInFrames={223}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here5-2abed600ebfa.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake06"
						component={SourceTake}
						durationInFrames={405}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here6-d3d82216087e.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake07"
						component={SourceTake}
						durationInFrames={390}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here7-48a6fe4485a0.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake08"
						component={SourceTake}
						durationInFrames={399}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here8-f9b6d04da2ef.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake09"
						component={SourceTake}
						durationInFrames={272}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here9-52700eda8cf3.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake10"
						component={SourceTake}
						durationInFrames={529}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here10-f635d876803f.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake11"
						component={SourceTake}
						durationInFrames={536}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here11-8970aa10f019.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake12"
						component={SourceTake}
						durationInFrames={509}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here12-b9a49bcdc751.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake13"
						component={SourceTake}
						durationInFrames={350}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here13-2857603dc933.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake14"
						component={SourceTake}
						durationInFrames={400}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here14-4ffcaba6a9e2.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake15"
						component={SourceTake}
						durationInFrames={255}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here15-4f64aa1b27ec.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake16"
						component={SourceTake}
						durationInFrames={292}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here16-af38f084affa.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake17"
						component={SourceTake}
						durationInFrames={375}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here17-cb02202f8406.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake18"
						component={SourceTake}
						durationInFrames={275}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here18-aa2e709582e3.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake19"
						component={SourceTake}
						durationInFrames={288}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here19-cdedca2737fa.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake20"
						component={SourceTake}
						durationInFrames={604}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here20-976fdac624c8.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake21"
						component={SourceTake}
						durationInFrames={314}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here21-e225ac09dd4b.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake22"
						component={SourceTake}
						durationInFrames={603}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here22-ab31e3d8f25a.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake23"
						component={SourceTake}
						durationInFrames={736}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here23-d9e6d340c45b.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake24"
						component={SourceTake}
						durationInFrames={732}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here24-e51579f03282.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake25"
						component={SourceTake}
						durationInFrames={482}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here25-0fb80e6c2984.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyTake26"
						component={SourceTake}
						durationInFrames={1091}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here26-163623811ceb.mov',
						}}
					/>
					<Composition
						id="AgenticallyProgrammaticallyBetterTake"
						component={SourceTake}
						durationInFrames={682}
						fps={30}
						width={1920}
						height={1080}
						defaultProps={{
							src: 'https://remotion.media/here-2026-11-03/here_bettertake-09c9f604ddfd.mov',
						}}
					/>
				</Folder>
				<Composition
					id="DeleteAiSlopBroll"
					component={DeleteAiSlopBroll}
					durationInFrames={120}
					fps={30}
					width={1920}
					height={1080}
				/>

				<Composition
					id="DeleteAiSlopCapture"
					component={DeleteAiSlopCaptureComposition}
					durationInFrames={208}
					fps={30}
					width={2302}
					height={1440}
				/>
				<Composition
					id="CopyContextBroll"
					component={CopyContextBroll}
					durationInFrames={149}
					fps={30}
					width={1920}
					height={1080}
				/>

				<Composition
					id="CopyContextCapture"
					component={CopyContextCaptureComposition}
					durationInFrames={185}
					fps={30}
					width={1604}
					height={1440}
				/>
				<Composition
					id="SoundtrackTimelineCapture"
					component={SoundtrackTimelineCaptureComposition}
					durationInFrames={347}
					fps={30}
					width={2378}
					height={1440}
				/>
				<Composition
					id="SoundtrackTimelinePlayback"
					component={SoundtrackTimelinePlayback}
					defaultProps={{withMusic: true}}
					durationInFrames={211}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="InvokeAgentCapture"
					component={InvokeAgentCaptureComposition}
					durationInFrames={362}
					fps={30}
					width={1284}
					height={1440}
				/>
				<Composition
					id="InvokeAgentBroll"
					component={InvokeAgentBroll}
					durationInFrames={192}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="RestructureAgentCapture"
					component={RestructureAgentCaptureComposition}
					durationInFrames={477}
					fps={30}
					width={1694}
					height={1440}
					defaultProps={{showCursor: true}}
				/>
				<Composition
					id="RestructureAgentBroll"
					component={RestructureAgentBroll}
					durationInFrames={205}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="DoubleClickCodeCapture"
					component={DoubleClickCodeCaptureComposition}
					durationInFrames={322}
					fps={30}
					width={2004}
					height={1440}
				/>
				<Composition
					id="DoubleClickCodeBroll"
					component={DoubleClickCodeBroll}
					durationInFrames={238}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="AnnotateChatGPTBroll"
					component={AnnotateChatGPTBroll}
					durationInFrames={187}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="EndCardSidebar"
					component={EndCardSidebar}
					calculateMetadata={({props}) => ({
						durationInFrames: props.platform === 'youtube' ? 435 : 135,
					})}
					durationInFrames={135}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						platform: 'youtube',
						style: {backgroundColor: '#18191a'},
					}}
				/>
				<Composition
					id="ComputedValueBroll"
					component={ComputedValueBroll}
					durationInFrames={310}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{mode: 'explanation'}}
				/>
			</Folder>
			<Composition
				id="ComputedPropertiesBroll"
				component={ComputedPropertiesBroll}
				durationInFrames={140}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="ComputedPropertiesCapture"
				component={ComputedPropertiesCaptureComposition}
				durationInFrames={179}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
