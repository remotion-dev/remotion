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
import {BirthdayPartyCompilation} from './disco-light-show/BirthdayPartyCompilation';
import {ClientSideChad} from './disco-light-show/ClientSideChad';
import {Clip1} from './disco-light-show/Clip1';
import {Clip2} from './disco-light-show/Clip2';
import {Clip3} from './disco-light-show/Clip3';
import {Clip4} from './disco-light-show/Clip4';
import {Clip5} from './disco-light-show/Clip5';
import {Compilation} from './disco-light-show/Compilation';
import {MyComposition} from './disco-light-show/Composition';
import {
	Countdown,
	COUNTDOWN_DURATION_IN_FRAMES,
} from './disco-light-show/Countdown';
import {DiscoBallBg} from './disco-light-show/DiscoBallBg';
import {DragIn} from './disco-light-show/DragIn';
import {DragInDemo} from './disco-light-show/DragInDemo';
import {EffectShow} from './disco-light-show/EffectShow';
import {Fork} from './disco-light-show/Fork';
import {ForkDrop} from './disco-light-show/ForkDrop';
import {HuggingFace} from './disco-light-show/HuggingFace';
import {MasterWithEffect} from './disco-light-show/MasterWithEffect';
import {Mediabunny} from './disco-light-show/Mediabunny';
import {OneShot} from './disco-light-show/OneShot';
import {Separate} from './disco-light-show/Separate';
import {Setup} from './disco-light-show/Setup';
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

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="DiscoLightShow">
				<MyComposition />
				<Composition
					id="MasterWithEffect"
					component={MasterWithEffect}
					durationInFrames={1802}
					fps={30}
					width={1080}
					height={1920}
				/>
				<TextBehindVideoStack />
				<TextBehindVideoSeriesFirst20s />
				<Composition
					id="EffectShow"
					component={EffectShow}
					durationInFrames={CAPTIONS_DURATION_IN_FRAMES}
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
					id="HuggingFace"
					component={HuggingFace}
					durationInFrames={240}
					fps={30}
					width={1920}
					height={1080}
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
					durationInFrames={150}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="ForkDrop"
					component={ForkDrop}
					durationInFrames={1629}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Separate"
					component={Separate}
					durationInFrames={1629}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="Mediabunny"
					component={Mediabunny}
					durationInFrames={1629}
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
					durationInFrames={150}
					fps={30}
					width={1080}
					height={1080}
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
					durationInFrames={60}
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
					durationInFrames={200}
					fps={30}
					width={1080}
					height={1920}
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
			<Folder name="HowCanRemotionBeFree">
				<Composition
					id="HowCanRemotionBeFree"
					component={HowCanRemotionBeFree}
					durationInFrames={1800}
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
		</>
	);
};
