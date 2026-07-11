import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {containerStyle} from './shared';

export const RoughNotationBracket: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<div>
				Mark{' '}
				<AnnotationOnTop
					name="Bracket annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="bracket"
					brackets={['left', 'right']}
					roughOptions={{roughness: 1, bowing: 3}}
					strokeWidth={8}
					color="#dc2626"
				>
					this
				</AnnotationOnTop>{' '}
				part
			</div>
		</AbsoluteFill>
	);
};
