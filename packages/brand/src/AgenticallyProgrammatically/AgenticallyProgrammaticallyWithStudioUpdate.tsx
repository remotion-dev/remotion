import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {AbsoluteFill, Interactive} from 'remotion';
import {StudioUpdate} from '../StudioUpdate';
import {AgenticallyProgrammatically} from './AgenticallyProgrammatically';
import {
	publicationPlatformControl,
	type PublicationPlatform,
} from './EndCardSidebar';

const AgenticallyProgrammaticallyWithStudioUpdateContent = ({
	platform,
}: {
	readonly platform: PublicationPlatform;
}) => {
	return (
		<TransitionSeries name="AgenticallyProgrammatically and StudioUpdate">
			<TransitionSeries.Sequence
				name="StudioUpdate"
				durationInFrames={1023}
				width={1920}
				height={1080}
				style={{overflow: 'hidden', isolation: 'isolate'}}
			>
				<AbsoluteFill style={{backgroundColor: '#1c1e23'}}>
					<StudioUpdate mode="widescreen" soundtrackVolume={0.14} />
				</AbsoluteFill>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={fade()}
				timing={linearTiming({durationInFrames: 6})}
			/>
			<TransitionSeries.Sequence
				name="AgenticallyProgrammatically"
				durationInFrames={platform === 'youtube' ? 9445 : 9145}
				width={1920}
				height={1080}
				style={{isolation: 'isolate'}}
			>
				<AgenticallyProgrammatically
					startWithPanelVisible
					platform={platform}
				/>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const AgenticallyProgrammaticallyWithStudioUpdate = Interactive.create({
	Component: AgenticallyProgrammaticallyWithStudioUpdateContent,
	layout: 'absolute-fill',
	schema: {platform: publicationPlatformControl},
});
