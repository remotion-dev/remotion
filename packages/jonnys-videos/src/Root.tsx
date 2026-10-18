import {Composition, Folder} from 'remotion';
import {Composition4People} from './Composition4People';
import {
	AnimatedCaptions,
	CAPTIONS_DURATION_IN_FRAMES,
	CAPTIONS_HEIGHT,
} from './disco-light-show/AnimatedCaptions';
import {
	AnimatedCaptionsBigWords,
	BIG_WORD_CAPTIONS_DURATION_IN_FRAMES,
} from './disco-light-show/AnimatedCaptionsBigWords';
import {ArrowLogo} from './disco-light-show/ArrowLogo';
import {ArrowLogoRemotion} from './disco-light-show/ArrowLogoRemotion';
import {BackgroundRemovalScene} from './disco-light-show/BackgroundRemovalScene';
import {BirthdayPartyCompilation} from './disco-light-show/BirthdayPartyCompilation';
import {ClientSideChad} from './disco-light-show/ClientSideChad';
import {Clip1} from './disco-light-show/Clip1';
import {Clip2} from './disco-light-show/Clip2';
import {Clip3} from './disco-light-show/Clip3';
import {Clip4} from './disco-light-show/Clip4';
import {Clip5} from './disco-light-show/Clip5';
import {CodeEditor} from './disco-light-show/CodeEditor';
import {Compilation} from './disco-light-show/Compilation';
import {
	MASTER_DURATION_IN_FRAMES,
	MyComposition,
} from './disco-light-show/Composition';
import {
	Countdown,
	CountdownPage,
	COUNTDOWN_DURATION_IN_FRAMES,
} from './disco-light-show/Countdown';
import {CustomToolScene} from './disco-light-show/CustomToolScene';
import {DiscoBallBg} from './disco-light-show/DiscoBallBg';
import {DragIn} from './disco-light-show/DragIn';
import {DragInDemo} from './disco-light-show/DragInDemo';
import {EffectShow} from './disco-light-show/EffectShow';
import {FinaleScene} from './disco-light-show/FinaleScene';
import {Fork} from './disco-light-show/Fork';
import {ForkDrop} from './disco-light-show/ForkDrop';
import {ForkSound} from './disco-light-show/ForkSound';
import {GetThemToDance} from './disco-light-show/GetThemToDance';
import {HuggingFace} from './disco-light-show/HuggingFace';
import {AnimateTheLights} from './disco-light-show/lights/AnimateTheLights';
import {LightsFootage} from './disco-light-show/lights/LightsFootage';
import {LIGHTS_DURATION_IN_FRAMES} from './disco-light-show/lights/voiceover';
import {MasterWithEffect} from './disco-light-show/MasterWithEffect';
import {Mediabunny} from './disco-light-show/Mediabunny';
import {OneShot} from './disco-light-show/OneShot';
import {OpeningScene} from './disco-light-show/OpeningScene';
import {DiscoLightShowRerecording} from './disco-light-show/recordings/DiscoLightShowRerecording';
import {RemotionAssemblyScene} from './disco-light-show/RemotionAssemblyScene';
import {RemotionSticker} from './disco-light-show/RemotionSticker';
import {EvacuateDrop} from './disco-light-show/selects/evacuate/EvacuateDrop';
import {EvacuateGreenOutro} from './disco-light-show/selects/evacuate/EvacuateGreenOutro';
import {EvacuateHypnotized} from './disco-light-show/selects/evacuate/EvacuateHypnotized';
import {EvacuateLightsCloseup} from './disco-light-show/selects/evacuate/EvacuateLightsCloseup';
import {EvacuateNeonExit} from './disco-light-show/selects/evacuate/EvacuateNeonExit';
import {EvacuateOpeningHook} from './disco-light-show/selects/evacuate/EvacuateOpeningHook';
import {GreenLaserVertical} from './disco-light-show/selects/GreenLaserVertical';
import {GreenStrobe} from './disco-light-show/selects/GreenStrobe';
import {
	PARTY_SUGGESTIONS_DURATION_IN_FRAMES,
	PartySuggestions,
} from './disco-light-show/selects/PartySuggestions';
import {SuperfreakChorus} from './disco-light-show/selects/superfreak/SuperfreakChorus';
import {SuperfreakOpening} from './disco-light-show/selects/superfreak/SuperfreakOpening';
import {SuperfreakOrangeBreak} from './disco-light-show/selects/superfreak/SuperfreakOrangeBreak';
import {SuperfreakRiff} from './disco-light-show/selects/superfreak/SuperfreakRiff';
import {ThreePersonChoreography} from './disco-light-show/selects/ThreePersonChoreography';
import {Separate} from './disco-light-show/Separate';
import {Setup} from './disco-light-show/Setup';
import {SocialSafeZones} from './disco-light-show/SocialSafeZones';
import {Text} from './disco-light-show/Text';
import {TextBehindVideoSeriesFirst20s} from './disco-light-show/TextBehindVideoSeriesFirst20s';
import {TextBehindVideoStack} from './disco-light-show/TextBehindVideoStack';
import {VibeCoded} from './disco-light-show/VibeCoded';
import {
	FIRST_CUSTOMER_CHART_DURATION_IN_FRAMES,
	FirstCustomerChart,
} from './how-can-remotion-be-free/FirstCustomerChart';
import {HowCanRemotionBeFree} from './how-can-remotion-be-free/HowCanRemotionBeFree';
import {
	PREMIUM_VERSION_DURATION_IN_FRAMES,
	PremiumVersion,
} from './how-can-remotion-be-free/PremiumVersion';
import {
	UNRULY_OUTCOME_DURATION_IN_FRAMES,
	UnrulyOutcome,
} from './how-can-remotion-be-free/UnrulyOutcome';
import {
	ZURICH_PHOTO_DURATION_IN_FRAMES,
	ZurichPhoto,
} from './how-can-remotion-be-free/ZurichPhoto';
import {
	NeonRaysLayer,
	NotebookPageLayer,
	PaperDiscoBallLayer,
	PaperDiscoBallNoShadowLayer,
} from './paper-disco/Layers';
import {
	PAPER_DISCO_SHOW_DURATION_IN_FRAMES,
	PaperDiscoShow,
} from './paper-disco/PaperDiscoShow';
import {
	PAPER_DISCO_STING_DURATION_IN_FRAMES,
	PaperDiscoSting,
} from './paper-disco/PaperDiscoSting';
import {RemotionRoot as PlaneSightRoot} from './plane-sight/Root';
import {RemotionRoot as RollerSkisNewRoot} from './roller-skis-new/Root';
import {RemotionRoot as RollerSkisRoot} from './roller-skis/Root';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="DiscoLightShow">
				<MyComposition />
				<Folder name="AnimatingTheLights">
					<Composition
						id="AnimateTheLights"
						component={AnimateTheLights}
						durationInFrames={LIGHTS_DURATION_IN_FRAMES}
						fps={30}
						width={1080}
						height={1920}
					/>
					<Folder name="Scenes">
						<Composition
							id="LightsShowFootage"
							component={LightsFootage}
							durationInFrames={211}
							fps={30}
							width={1080}
							height={1920}
							defaultProps={{
								src: 'https://remotion.media/jonnys-videos/disco-light-show/solo-dmx-light-show-8c06c9856456.mp4',
								footageRate: 1,
								style: {backgroundColor: '#141414'},
							}}
						/>
					</Folder>
				</Folder>
				<Folder name="Chapters">
					<Composition
						id="OpeningScene"
						component={OpeningScene}
						durationInFrames={325}
						fps={30}
						width={1080}
						height={1920}
						defaultProps={{style: {backgroundColor: '#141414'}}}
					/>
					<Composition
						id="BackgroundRemovalScene"
						component={BackgroundRemovalScene}
						durationInFrames={526}
						fps={30}
						width={1080}
						height={1920}
						defaultProps={{style: {backgroundColor: '#141414'}}}
					/>
					<Composition
						id="CustomToolScene"
						component={CustomToolScene}
						durationInFrames={255}
						fps={30}
						width={1080}
						height={1920}
						defaultProps={{style: {backgroundColor: '#141414'}}}
					/>
					<Composition
						id="RemotionAssemblyScene"
						component={RemotionAssemblyScene}
						durationInFrames={265}
						fps={30}
						width={1080}
						height={1920}
						defaultProps={{style: {backgroundColor: '#141414'}}}
					/>
					<Composition
						id="FinaleScene"
						component={FinaleScene}
						durationInFrames={244}
						fps={30}
						width={1080}
						height={1920}
						defaultProps={{style: {backgroundColor: '#141414'}}}
					/>
					<Composition
						id="CodeEditor"
						component={CodeEditor}
						durationInFrames={56}
						fps={30}
						width={1188}
						height={1260}
					/>
				</Folder>
				<Folder name="Recordings">
					<Composition
						id="DiscoLightShowRerecording"
						component={DiscoLightShowRerecording}
						durationInFrames={139128}
						fps={30}
						width={1920}
						height={1080}
					/>
				</Folder>
				<Folder name="Selects">
					<Composition
						id="GreenLaserVertical"
						component={GreenLaserVertical}
						durationInFrames={105}
						fps={30}
						width={1080}
						height={1920}
					/>
					<Composition
						id="PartySuggestions"
						component={PartySuggestions}
						durationInFrames={PARTY_SUGGESTIONS_DURATION_IN_FRAMES}
						fps={30}
						width={1920}
						height={1080}
					/>
					<Folder name="EvacuateTheDancefloor">
						<Composition
							id="EvacuateOpeningHook"
							component={EvacuateOpeningHook}
							durationInFrames={480}
							fps={30}
							width={1920}
							height={1080}
						/>
						<Composition
							id="EvacuateDrop"
							component={EvacuateDrop}
							durationInFrames={480}
							fps={30}
							width={1920}
							height={1080}
						/>
						<Composition
							id="EvacuateHypnotized"
							component={EvacuateHypnotized}
							durationInFrames={345}
							fps={30}
							width={1920}
							height={1080}
						/>
						<Composition
							id="EvacuateLightsCloseup"
							component={EvacuateLightsCloseup}
							durationInFrames={300}
							fps={30}
							width={960}
							height={540}
						/>
						<Composition
							id="EvacuateNeonExit"
							component={EvacuateNeonExit}
							durationInFrames={360}
							fps={30}
							width={1920}
							height={1080}
						/>
						<Composition
							id="EvacuateGreenOutro"
							component={EvacuateGreenOutro}
							durationInFrames={480}
							fps={30}
							width={1920}
							height={1080}
						/>
					</Folder>
					<Folder name="Superfreak">
						<Composition
							id="SuperfreakOpening"
							component={SuperfreakOpening}
							durationInFrames={510}
							fps={30}
							width={1920}
							height={1080}
						/>
						<Composition
							id="SuperfreakOrangeBreak"
							component={SuperfreakOrangeBreak}
							durationInFrames={300}
							fps={30}
							width={1920}
							height={1080}
						/>
						<Composition
							id="SuperfreakChorus"
							component={SuperfreakChorus}
							durationInFrames={390}
							fps={30}
							width={1920}
							height={1080}
						/>
						<Composition
							id="SuperfreakRiff"
							component={SuperfreakRiff}
							durationInFrames={480}
							fps={30}
							width={1920}
							height={1080}
						/>
					</Folder>
					<Composition
						id="GreenStrobe"
						component={GreenStrobe}
						durationInFrames={180}
						fps={30}
						width={540}
						height={960}
					/>
					<Composition
						id="ThreePersonChoreography"
						component={ThreePersonChoreography}
						durationInFrames={150}
						fps={30}
						width={1132}
						height={440}
					/>
				</Folder>
				<Composition
					id="MasterWithEffect"
					component={MasterWithEffect}
					durationInFrames={MASTER_DURATION_IN_FRAMES}
					fps={30}
					width={1080}
					height={1920}
				/>
				<TextBehindVideoStack />
				<TextBehindVideoSeriesFirst20s />
				<Composition
					id="EffectShow"
					component={EffectShow}
					durationInFrames={200}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="AnimatedCaptions"
					component={AnimatedCaptions}
					durationInFrames={CAPTIONS_DURATION_IN_FRAMES}
					fps={30}
					width={1080}
					height={CAPTIONS_HEIGHT}
				/>
				<Composition
					id="AnimatedCaptionsBigWords"
					component={AnimatedCaptionsBigWords}
					durationInFrames={BIG_WORD_CAPTIONS_DURATION_IN_FRAMES}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Countdown"
					component={Countdown}
					durationInFrames={COUNTDOWN_DURATION_IN_FRAMES}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="CountdownPage"
					component={CountdownPage}
					durationInFrames={20}
					fps={30}
					width={1080}
					height={1920}
					defaultProps={{number: '3'}}
				/>
				<Composition
					id="DiscoText"
					component={Text}
					durationInFrames={90}
					fps={30}
					width={1080}
					height={1920}
					defaultProps={{
						children: 'One-Shot',
						style: {
							fontFamily: 'Arial, sans-serif',
							fontSize: 164,
							fontWeight: 900,
							color: 'white',
							textAlign: 'center',
						},
					}}
				/>
				<Composition
					id="ArrowLogo"
					component={ArrowLogo}
					durationInFrames={240}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="ArrowLogoRemotion"
					component={ArrowLogoRemotion}
					durationInFrames={240}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="SocialSafeZones"
					component={SocialSafeZones}
					durationInFrames={120}
					fps={30}
					width={1080}
					height={1920}
					defaultProps={{platform: 'instagram'}}
				/>
				<Composition
					id="HuggingFace"
					component={HuggingFace}
					durationInFrames={166}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Fork"
					component={Fork}
					durationInFrames={140}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="ClientSideChad"
					component={ClientSideChad}
					durationInFrames={140}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="ForkDrop"
					component={ForkDrop}
					durationInFrames={65}
					fps={30}
					width={1080}
					height={1920}
					defaultProps={{style: {overflow: 'hidden'}}}
				/>
				<Composition
					id="ForkSound"
					component={ForkSound}
					durationInFrames={60}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Separate"
					component={Separate}
					durationInFrames={154}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Mediabunny"
					component={Mediabunny}
					durationInFrames={60}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="RemotionSticker"
					component={RemotionSticker}
					durationInFrames={60}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="OneShot"
					component={OneShot}
					durationInFrames={60}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="VibeCoded"
					component={VibeCoded}
					durationInFrames={162}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="DragIn"
					component={DragIn}
					durationInFrames={1629}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="DragInDemo"
					component={DragInDemo}
					durationInFrames={102}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="DiscoBallBg"
					component={DiscoBallBg}
					durationInFrames={1850}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Compilation"
					component={Compilation}
					durationInFrames={1629}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="BirthdayPartyCompilation"
					component={BirthdayPartyCompilation}
					durationInFrames={178}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="GetThemToDance"
					component={GetThemToDance}
					durationInFrames={85}
					fps={30}
					width={1080}
					height={1920}
					defaultProps={{style: {backgroundColor: '#141414'}}}
				/>
				<Composition
					id="Clip1"
					component={Clip1}
					durationInFrames={57}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Clip2"
					component={Clip2}
					durationInFrames={48}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Clip3"
					component={Clip3}
					durationInFrames={66}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Clip4"
					component={Clip4}
					durationInFrames={47}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Clip5"
					component={Clip5}
					durationInFrames={300}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Setup"
					component={Setup}
					durationInFrames={1800}
					fps={30}
					width={1080}
					height={1920}
				/>
			</Folder>
			<Folder name="PaperDisco">
				<Composition
					id="PaperDiscoSting"
					component={PaperDiscoSting}
					durationInFrames={PAPER_DISCO_STING_DURATION_IN_FRAMES}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="PaperDiscoShow"
					component={PaperDiscoShow}
					durationInFrames={PAPER_DISCO_SHOW_DURATION_IN_FRAMES}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="PaperDiscoBall"
					component={PaperDiscoBallLayer}
					durationInFrames={300}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="PaperDiscoBallNoShadow"
					component={PaperDiscoBallNoShadowLayer}
					durationInFrames={300}
					fps={30}
					width={1080}
					height={1080}
				/>
				<Composition
					id="PaperNeonRays"
					component={NeonRaysLayer}
					durationInFrames={300}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="PaperNotebookPage"
					component={NotebookPageLayer}
					durationInFrames={300}
					fps={30}
					width={1080}
					height={1920}
				/>
			</Folder>
			<Folder name="HowCanRemotionBeFree">
				<Composition
					id="HowCanRemotionBeFree"
					component={HowCanRemotionBeFree}
					durationInFrames={1802}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Folder name="Scenes">
					<Composition
						id="FirstCustomerChart"
						component={FirstCustomerChart}
						durationInFrames={FIRST_CUSTOMER_CHART_DURATION_IN_FRAMES}
						fps={30}
						width={1080}
						height={1920}
					/>
					<Composition
						id="PremiumVersion"
						component={PremiumVersion}
						durationInFrames={PREMIUM_VERSION_DURATION_IN_FRAMES}
						fps={30}
						width={1080}
						height={1920}
					/>
					<Composition
						id="UnrulyOutcome"
						component={UnrulyOutcome}
						durationInFrames={UNRULY_OUTCOME_DURATION_IN_FRAMES}
						fps={30}
						width={1080}
						height={1920}
					/>
					<Composition
						id="ZurichPhoto"
						component={ZurichPhoto}
						durationInFrames={ZURICH_PHOTO_DURATION_IN_FRAMES}
						fps={30}
						width={1080}
						height={1920}
					/>
					<Composition
						id="4People"
						component={Composition4People}
						durationInFrames={1800}
						fps={30}
						width={1080}
						height={1920}
					/>
				</Folder>
			</Folder>
			<Folder name="PlaneSight">
				<PlaneSightRoot />
			</Folder>
			<Folder name="RollerSkis-new">
				<RollerSkisNewRoot />
			</Folder>
			<Folder name="RollerSkis">
				<RollerSkisRoot />
			</Folder>
		</>
	);
};
