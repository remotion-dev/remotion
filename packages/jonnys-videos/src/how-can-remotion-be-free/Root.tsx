import {Composition, Folder} from 'remotion';
import {
	FIRST_CUSTOMER_CHART_DURATION_IN_FRAMES,
	FirstCustomerChart,
} from './FirstCustomerChart';
import {HowCanRemotionBeFree} from './HowCanRemotionBeFree';
import {
	PREMIUM_VERSION_DURATION_IN_FRAMES,
	PremiumVersion,
} from './PremiumVersion';
import {
	UNRULY_OUTCOME_DURATION_IN_FRAMES,
	UnrulyOutcome,
} from './UnrulyOutcome';
import {ZURICH_PHOTO_DURATION_IN_FRAMES, ZurichPhoto} from './ZurichPhoto';

export const HowCanRemotionBeFreeRoot: React.FC = () => {
	return (
		<>
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
			</Folder>
		</>
	);
};
