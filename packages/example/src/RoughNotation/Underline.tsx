import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {containerStyle, useAnnotationProgress} from './shared';

export const RoughNotationUnderline: React.FC = () => {
	const progress = useAnnotationProgress();

	return (
		<AbsoluteFill style={containerStyle}>
			<AnnotationOnTop
				progress={progress}
				type="underline"
				color="#355f8f"
				strokeWidth={10}
				iterations={3}
			>
				Underline this
			</AnnotationOnTop>
		</AbsoluteFill>
	);
};
