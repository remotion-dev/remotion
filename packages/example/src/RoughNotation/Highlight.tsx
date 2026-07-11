import {AnnotationBehind} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	interpolateColors,
	useCurrentFrame,
} from 'remotion';
import {containerStyle} from './shared';

export const RoughNotationHighlight: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<div>
				This is a true{' '}
				<AnnotationBehind
					name="Highlight annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="highlight"
					color={interpolateColors(
						frame,
						[0, 60],
						['rgba(255, 236, 79, 0)', 'rgba(255, 236, 79, 0.9)'],
					)}
					iterations={3}
					roughOptions={{maxRandomnessOffset: 10}}
					padding={{
						right: 18,
						left: 36,
					}}
				>
					Highlighted
				</AnnotationBehind>
			</div>
		</AbsoluteFill>
	);
};
