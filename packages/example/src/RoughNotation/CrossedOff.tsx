import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {containerStyle, fontFamily} from './shared';

export const RoughNotationCrossedOff: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div
				style={{
					fontSize: 80,
					fontWeight: 700,
					lineHeight: 1.1,
					color: '#171717',
					fontFamily,
					width: 800,
				}}
			>
				<Interactive.Span>Please </Interactive.Span>
				<AnnotationOnTop
					name="Crossed off annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="crossed-off"
					color="#2563eb"
					strokeWidth={14}
				>
					remove
				</AnnotationOnTop>{' '}
				<Interactive.Span>this</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
