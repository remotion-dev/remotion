import {
	makeLinearTiming,
	makeSpringTiming,
	makeWipePresentation,
	TransitionSeries,
} from '@remotion/transitions';
import {AbsoluteFill, Easing, interpolateColors, random} from 'remotion';

export const BasicTransition: React.FC = () => {
	return (
		<TransitionSeries from={30}>
			<TransitionSeries.Sequence durationInFrames={30}>
				<AbsoluteFill
					style={{
						backgroundColor: 'orange',
						opacity: 0.5,
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 200,
						color: 'white',
					}}
				>
					A
				</AbsoluteFill>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={makeWipePresentation({origin: 'from-bottom-left'})}
				timing={makeLinearTiming({
					durationInFrames: 30,
					easing: Easing.bounce,
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<AbsoluteFill
					style={{
						backgroundColor: 'green',
						opacity: 0.5,
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 200,
						color: 'white',
					}}
				>
					B
				</AbsoluteFill>
			</TransitionSeries.Sequence>
			{new Array(10).fill(true).map((_, i) => (
				<>
					<TransitionSeries.Transition
						presentation={makeWipePresentation({origin: 'from-left'})}
						timing={makeSpringTiming({
							config: {
								damping: 200,
							},
							durationInFrames: 30,
						})}
					/>
					<TransitionSeries.Sequence durationInFrames={35}>
						<AbsoluteFill
							style={{
								backgroundColor: interpolateColors(
									random(i),
									[0, 1],
									['red', 'blue']
								),
								justifyContent: 'center',
								alignItems: 'center',
								fontSize: 200,
								color: 'white',
							}}
						>
							{'ABCDEFHIJKLMNO'[i]}
						</AbsoluteFill>
					</TransitionSeries.Sequence>
				</>
			))}
		</TransitionSeries>
	);
};
