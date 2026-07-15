import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {containerStyle, fontFamily} from './shared';

export const RoughNotationStrikeThrough: React.FC = () => {
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
				<Interactive.Span>The </Interactive.Span>
				<AnnotationOnTop
					name="Strike-through annotation"
					progress={interpolate(frame, [10, 25], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="strike-through"
					color={'#f11515'}
					strokeWidth={14}
				>
					forbidden
				</AnnotationOnTop>{' '}
				<Interactive.Span>fruit</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
