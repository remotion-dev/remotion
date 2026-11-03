import {
	AbsoluteFill,
	Freeze,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {StudioCodeHandoff} from '../video-elements/StudioCodeHandoff';

const ThreeWaysHeroContent = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<>
			<AbsoluteFill style={{backgroundColor: '#fff'}} />
			<Interactive.Div
				name="Homepage hero graphic"
				style={{
					position: 'absolute',
					left: 160,
					bottom: 0,
					width: 1600,
					height: (1600 / 1874) * 1020,
				}}
			>
				<Freeze
					frame={Math.round(
						frame < 5 * fps
							? interpolate(
									frame,
									[4.36 * fps, 4.96 * fps],
									[7.5 * fps, 5.5 * fps],
									{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
								)
							: interpolate(frame, [8.4 * fps, 9 * fps], [4 * fps, 2 * fps], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
					)}
				>
					<StudioCodeHandoff />
				</Freeze>
			</Interactive.Div>
		</>
	);
};

export const ThreeWaysHero = Interactive.create({
	Component: ThreeWaysHeroContent,
	layout: 'absolute-fill',
	schema: {},
});
