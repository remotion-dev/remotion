import {EffectInternals} from '@remotion/effects';
import React from 'react';
import {AbsoluteFill, Internals, Sequence, useVideoConfig} from 'remotion';
import {SimpleSvg} from './SimpleSvg';

export const LostNodePathRepro: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	const memoizedEffects = Internals.useMemoizedEffectDefinitions([
		EffectInternals.halftone({
			dotSize: 30,
			dotSpacing: 20,
			shape: 'square',
		}),
		EffectInternals.tint({color: 'green', amount: 1}),
	]);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Sequence
				durationInFrames={durationInFrames}
				_remotionInternalEffects={memoizedEffects}
			>
				<SimpleSvg />
			</Sequence>
		</AbsoluteFill>
	);
};
