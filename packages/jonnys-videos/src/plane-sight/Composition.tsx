import {Track, AbsoluteFill, Series, useVideoConfig} from 'remotion';
import {AirportDemo, FiveAgentsIntro} from './FiveAgentDemo';
import {FlightCrewScene} from './FlightCrewScene';
import {PresenterNarration} from './PresenterNarration';

export const PlaneSightPromo = () => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#ffffff'}}>
			<Track name="Opening cutaways">
				<FiveAgentsIntro
					name="Opening — five agents in Herdr"
					durationInFrames={8.1 * fps}
				/>
				<AirportDemo
					name="Airport — depart, work, return"
					from={(344 / 30) * fps}
					durationInFrames={(496 / 30) * fps}
				/>
			</Track>
			<Series name="Promo scenes" layout="absolute-fill">
				<Series.Sequence
					name="Narration — through crucial"
					trimBefore={(100 / 30) * fps}
					durationInFrames={28 * fps}
				>
					<PresenterNarration />
				</Series.Sequence>
				<Series.Sequence
					name="Meet the flight crew"
					trimBefore={0.7 * fps}
					durationInFrames={9.2 * fps}
				>
					<FlightCrewScene />
				</Series.Sequence>
				<Series.Sequence
					name="Narration — after flight crew"
					trimBefore={(940 / 30) * fps}
					durationInFrames={60.5 * fps}
				>
					<PresenterNarration />
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
