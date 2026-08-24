import {Composition, Folder} from 'remotion';
import {
	AnimatedCaptions,
	CAPTIONS_DURATION_IN_FRAMES,
	CAPTIONS_HEIGHT,
} from './AnimatedCaptions';
import {
	AnimatedCaptionsBigWords,
	BIG_WORD_CAPTIONS_DURATION_IN_FRAMES,
} from './AnimatedCaptionsBigWords';
import {ArrowLogo} from './ArrowLogo';
import {ArrowLogoRemotion} from './ArrowLogoRemotion';
import {BirthdayPartyCompilation} from './BirthdayPartyCompilation';
import {ClientSideChad} from './ClientSideChad';
import {Clip1} from './Clip1';
import {Clip2} from './Clip2';
import {Clip3} from './Clip3';
import {Clip4} from './Clip4';
import {Clip5} from './Clip5';
import {Compilation} from './Compilation';
import {MyComposition} from './Composition';
import {Countdown, COUNTDOWN_DURATION_IN_FRAMES} from './Countdown';
import {DiscoBallBg} from './DiscoBallBg';
import {DragIn} from './DragIn';
import {DragInDemo} from './DragInDemo';
import {EffectShow} from './EffectShow';
import {
	FIRST_CUSTOMER_CHART_DURATION_IN_FRAMES,
	FirstCustomerChart,
} from './FirstCustomerChart';
import {Fork} from './Fork';
import {ForkDrop} from './ForkDrop';
import {FreeMaster} from './FreeMaster';
import {HuggingFace} from './HuggingFace';
import {MasterWithEffect} from './MasterWithEffect';
import {Mediabunny} from './Mediabunny';
import {OneShot} from './OneShot';
import {
	PREMIUM_VERSION_DURATION_IN_FRAMES,
	PremiumVersion,
} from './PremiumVersion';
import {Separate} from './Separate';
import {Setup} from './Setup';
import {TextBehindVideoSeriesFirst20s} from './TextBehindVideoSeriesFirst20s';
import {TextBehindVideoStack} from './TextBehindVideoStack';
import {
	UNRULY_OUTCOME_DURATION_IN_FRAMES,
	UnrulyOutcome,
} from './UnrulyOutcome';
import {VibeCoded} from './VibeCoded';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<MyComposition />
			<Composition
				id="MasterWithEffect"
				component={MasterWithEffect}
				durationInFrames={1800}
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
			<Folder name="HowIsRemotionFree">
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
					id="FreeMaster"
					component={FreeMaster}
					durationInFrames={1800}
					fps={30}
					width={1080}
					height={1920}
				/>
			</Folder>
		</>
	);
};
