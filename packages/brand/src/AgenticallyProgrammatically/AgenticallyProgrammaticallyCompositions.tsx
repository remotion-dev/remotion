import {Video} from '@remotion/media';
import {Composition, Folder} from 'remotion';
import {AgenticallyProgrammatically} from './AgenticallyProgrammatically';
import {MottoSidebar} from './MottoSidebar';
import {ThreeWaysHero} from './ThreeWaysHero';
import {QuickEditsBroll} from './QuickEditsBroll';

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
		<Folder name="AgenticallyProgrammatically">
			<Composition
				id="AgenticallyProgrammatically"
				component={AgenticallyProgrammatically}
				durationInFrames={8778}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="MottoSidebar"
				component={MottoSidebar}
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
			/>
			<Composition
				id="QuickEditsBroll"
				component={QuickEditsBroll}
				durationInFrames={263}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					style: {backgroundColor: '#1c1e23', overflow: 'hidden'},
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
		</Folder>
	);
};
