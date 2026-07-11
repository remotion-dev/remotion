import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {containerStyle, useAnnotationProgress} from './shared';

export const RoughNotationBox: React.FC = () => {
	const progress = useAnnotationProgress();

	return (
		<AbsoluteFill style={containerStyle}>
			<AnnotationOnTop
				progress={progress}
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
				Box target
			</AnnotationOnTop>
		</AbsoluteFill>
	);
};
