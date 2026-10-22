import {Composition, Folder} from 'remotion';
import {AwardBadge} from './elements/AwardBadge';
import {CalloutWithSound} from './elements/Callout';
import {Callout} from './elements/Callout';
import {EndCardTitle} from './elements/EndCardTitle';
import {LocationLowerThird} from './elements/LocationLowerThird';
import {NameLowerThird} from './elements/NameLowerThird';
import {SpeedBadge} from './elements/SpeedBadge';
import {TitleCard} from './elements/TitleCard';
import {RollerSkiCommute} from './RollerSkiCommute';
import {Arrival} from './scenes/Arrival';
import {CommuteAward} from './scenes/BestCommute';
import {BestCommute} from './scenes/BestCommute';
import {
	TechBrosShot,
	BestCommuteShot,
	SceneryShot,
	RollerSkisShot,
	CommuteWinnerShot,
} from './scenes/BestCommuteShots';
import {EndCard} from './scenes/EndCard';
import {GearUp} from './scenes/GearUp';
import {Intro} from './scenes/Intro';
import {Office} from './scenes/Office';
import {OffWeGo} from './scenes/OffWeGo';
import {RideMontage} from './scenes/RideMontage';
import {TheDecline} from './scenes/TheDecline';
import {Uphill} from './scenes/Uphill';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="RollerSkiCommute-new"
				component={RollerSkiCommute}
				durationInFrames={5870}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Folder name="Scenes">
				<Composition
					id="Intro-new"
					component={Intro}
					durationInFrames={529}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="GearUp-new"
					component={GearUp}
					durationInFrames={332}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="OffWeGo-new"
					component={OffWeGo}
					durationInFrames={108}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Uphill-new"
					component={Uphill}
					durationInFrames={1517}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="BestCommute-new"
					component={BestCommute}
					durationInFrames={512}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="TheDecline-new"
					component={TheDecline}
					durationInFrames={1054}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="RideMontage-new"
					component={RideMontage}
					durationInFrames={221}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Arrival-new"
					component={Arrival}
					durationInFrames={426}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Office-new"
					component={Office}
					durationInFrames={1081}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="EndCard-new"
					component={EndCard}
					durationInFrames={120}
					fps={30}
					width={1920}
					height={1080}
				/>
			</Folder>
			<Folder name="Best-commute-shots">
				<Composition
					id="TechBrosShot-new"
					component={TechBrosShot}
					durationInFrames={87}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{trimBefore: 47}}
				/>
				<Composition
					id="BestCommuteShot-new"
					component={BestCommuteShot}
					durationInFrames={112}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{trimBefore: 170}}
				/>
				<Composition
					id="SceneryShot-new"
					component={SceneryShot}
					durationInFrames={154}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{trimBefore: 302}}
				/>
				<Composition
					id="RollerSkisShot-new"
					component={RollerSkisShot}
					durationInFrames={65}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{trimBefore: 456}}
				/>
				<Composition
					id="CommuteWinnerShot-new"
					component={CommuteWinnerShot}
					durationInFrames={94}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{trimBefore: 534}}
				/>
			</Folder>
			<Folder name="Elements">
				<Composition
					id="CommuteAward-new"
					component={CommuteAward}
					durationInFrames={67}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="EndCardTitle-new"
					component={EndCardTitle}
					durationInFrames={120}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{heading: 'Next time:', title: 'Brakes.'}}
				/>
				<Composition
					id="CalloutWithSound-new"
					component={CalloutWithSound}
					durationInFrames={164}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						label: 'Feature',
						text: "Can't roll backwards",
						icon: 'check',
						accentColor: '#16a34a',
						sound: 'https://remotion.media/ding.wav',
						soundVolume: 0.35,
						soundFrom: 0,
						style: {position: 'absolute', left: 80, top: 70},
					}}
				/>
				<Composition
					id="TitleCard-new"
					component={TitleCard}
					durationInFrames={84}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						line1: 'Roller ski',
						line2: 'Commute',
						kicker: 'Zürich · 8 AM',
						accentColor: '#2563eb',
					}}
				/>
				<Composition
					id="LocationLowerThird-new"
					component={LocationLowerThird}
					durationInFrames={110}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						location: 'Zürich, Switzerland',
						time: '08:07',
						accentColor: '#2563eb',
						style: {position: 'absolute', left: 80, top: 70},
					}}
				/>
				<Composition
					id="NameLowerThird-new"
					component={NameLowerThird}
					durationInFrames={100}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						personName: 'Mehmet',
						title: 'Already at work',
						accentColor: '#2563eb',
						style: {position: 'absolute', left: 80, top: 70},
					}}
				/>
				<Composition
					id="Callout-new"
					component={Callout}
					durationInFrames={90}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						label: 'Feature',
						text: "Can't roll backwards",
						icon: 'check',
						accentColor: '#16a34a',
						style: {position: 'absolute', left: 80, top: 70},
					}}
				/>
				<Composition
					id="SpeedBadge-new"
					component={SpeedBadge}
					durationInFrames={80}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						speed: '6×',
						style: {position: 'absolute', right: 80, top: 70},
					}}
				/>
				<Composition
					id="AwardBadge-new"
					component={AwardBadge}
					durationInFrames={66}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						award: 'Best commute',
						winner: 'Jonny',
						style: {position: 'absolute', right: 80, top: 70},
					}}
				/>
			</Folder>
		</>
	);
};
