import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {containerStyle, fontFamily} from './shared';

export const RoughNotationBracket: React.FC = () => {
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
				<Interactive.Span>Mark </Interactive.Span>
				<AnnotationOnTop
					name="Bracket annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="bracket"
					bracketLeft
					bracketRight
					bracketTop
					roughness={1}
					bowing={3}
					strokeWidth={8}
					color="#dc2626"
					bracketBottom
					padding={{
						top: -11,
					}}
				>
					this
				</AnnotationOnTop>{' '}
				<Interactive.Span>part</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
