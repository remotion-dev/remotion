import {AbsoluteFill, Series, useVideoConfig} from 'remotion';
import {AirportDemo, FiveAgentsIntro} from './FiveAgentDemo';
import {FlightCrewScene} from './FlightCrewScene';
import {PresenterNarration} from './PresenterNarration';

export const PlaneSightPromo = () => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#ffffff'}}>
			<FiveAgentsIntro
				name="Opening — five agents in Herdr"
				durationInFrames={8.1 * fps}
				premountFor={fps}
			/>
			<AirportDemo
				name="Airport — depart, work, return"
				from={(344 / 30) * fps}
				durationInFrames={(496 / 30) * fps}
				premountFor={fps}
			/>
			<Series name="Promo scenes" layout="absolute-fill" premountFor={fps}>
				<Series.Sequence
					name="Narration — through crucial"
					trimBefore={(100 / 30) * fps}
					durationInFrames={28 * fps}
					premountFor={fps}
				>
					<PresenterNarration premountFor={fps} />
				</Series.Sequence>
				<Series.Sequence
					name="Meet the flight crew"
					trimBefore={0.7 * fps}
					durationInFrames={9.2 * fps}
					premountFor={fps}
				>
					<FlightCrewScene premountFor={fps} />
				</Series.Sequence>
				<Series.Sequence
					name="Narration — after flight crew"
					trimBefore={(940 / 30) * fps}
					durationInFrames={60.5 * fps}
					premountFor={fps}
				>
					<PresenterNarration premountFor={fps} />
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
