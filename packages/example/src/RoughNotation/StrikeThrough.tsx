import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {containerStyle, useAnnotationProgress} from './shared';

export const RoughNotationStrikeThrough: React.FC = () => {
	const progress = useAnnotationProgress();

	return (
		<AbsoluteFill style={containerStyle}>
			<AnnotationOnTop
				progress={progress}
				type="strike-through"
				color="#111827"
				strokeWidth={14}
			>
				Forget that
			</AnnotationOnTop>
		</AbsoluteFill>
	);
};
