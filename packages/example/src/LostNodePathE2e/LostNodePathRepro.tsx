import {halftone} from '@remotion/effects/halftone';
import {tint} from '@remotion/effects/tint';
import {
	AbsoluteFill,
	Interactive,
	Internals,
	Sequence,
	useVideoConfig,
} from 'remotion';
import {SimpleSvg} from './SimpleSvg';

export const LostNodePathRepro: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	const memoizedEffects = Internals.useMemoizedEffectDefinitions([
		halftone({
			dotSize: 30,
			dotSpacing: 20,
			shape: 'square',
		}),
		tint({color: 'green', amount: 1}),
	]);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Interactive.Div name="Eyebrow" style={{textTransform: 'uppercase'}}>
				Performance overview
			</Interactive.Div>
			<Interactive.Div name="Title">Regional growth</Interactive.Div>
			<Interactive.Div name="Chart">
				<Interactive.Div name="Bars">Bars remain visible</Interactive.Div>
			</Interactive.Div>
			<Sequence
				durationInFrames={durationInFrames}
				_remotionInternalEffects={memoizedEffects}
			>
				<SimpleSvg />
			</Sequence>
		</AbsoluteFill>
	);
};
