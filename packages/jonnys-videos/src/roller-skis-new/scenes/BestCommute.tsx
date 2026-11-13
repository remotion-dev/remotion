import {Audio} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {Interactive} from 'remotion';
import {AwardBadge} from '../elements/AwardBadge';
import {BestCommuteSource} from './BestCommuteShots';

const BestCommuteInner: React.FC = () => {
	return (
		<>
			<TransitionSeries name="Best commute shots">
				<TransitionSeries.Sequence
					name="Tech bros"
					trimBefore={47}
					durationInFrames={87}
				>
					<BestCommuteSource />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Best commute"
					trimBefore={170}
					durationInFrames={112}
				>
					<BestCommuteSource />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Chickens cows mountains"
					trimBefore={302}
					durationInFrames={154}
				>
					<BestCommuteSource />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Roller skis"
					trimBefore={456}
					durationInFrames={65}
				>
					<BestCommuteSource />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Best commute goes to Jonny"
					trimBefore={534}
					durationInFrames={94}
				>
					<BestCommuteSource />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<CommuteAward name="Commute award" from={445} durationInFrames={67} />
		</>
	);
};

export const BestCommute = Interactive.create({
	Component: BestCommuteInner,
	layout: 'absolute-fill',
});

const CommuteAwardInner: React.FC = () => (
	<>
		<AwardBadge
			name="Award"
			award="Best commute"
			winner="Jonny"
			style={{position: 'absolute', right: 80, top: 70}}
		/>
		<Audio name="Whoosh" src="https://remotion.media/whoosh.wav" volume={0.5} />
	</>
);
export const CommuteAward = Interactive.create({
	Component: CommuteAwardInner,
	layout: 'absolute-fill',
});
