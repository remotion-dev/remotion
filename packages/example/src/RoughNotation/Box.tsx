import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {annotationTextStyle, containerStyle} from './shared';

export const RoughNotationBox: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div style={annotationTextStyle}>
				<Interactive.Span>Draw a box around </Interactive.Span>
				<AnnotationOnTop
					name="Box annotation"
					progress={interpolate(frame, [0, 60], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					type="box"
					color="#ef4444"
					strokeWidth={8}
					iterations={2}
					padding={{
						left: 26,
						right: 26,
						top: 16,
						bottom: 16,
					}}
				>
					this
				</AnnotationOnTop>{' '}
				<Interactive.Span>idea</Interactive.Span>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
