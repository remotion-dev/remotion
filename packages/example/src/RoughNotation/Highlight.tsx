import {AnnotationBehind} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {containerStyle, useAnnotationProgress} from './shared';

export const RoughNotationHighlight: React.FC = () => {
	const progress = useAnnotationProgress();
	const highlightColor = interpolateColors(
		progress,
		[0, 1],
		['rgba(255, 236, 79, 0)', 'rgba(255, 236, 79, 0.9)'],
	);

	return (
		<AbsoluteFill style={containerStyle}>
			<div>
				<AnnotationBehind
					progress={progress}
					type="highlight"
					color={highlightColor}
					iterations={8}
					roughOptions={{maxRandomnessOffset: 10}}
				>
					Highlighted
				</AnnotationBehind>
			</div>
		</AbsoluteFill>
	);
};
