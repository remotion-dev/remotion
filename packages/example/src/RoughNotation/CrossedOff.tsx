import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {containerStyle, useAnnotationProgress} from './shared';

export const RoughNotationCrossedOff: React.FC = () => {
	const progress = useAnnotationProgress();

	return (
		<AbsoluteFill style={containerStyle}>
			<AnnotationOnTop
				progress={progress}
				type="crossed-off"
				color="#2563eb"
				strokeWidth={14}
			>
				Remove
			</AnnotationOnTop>
		</AbsoluteFill>
	);
};
