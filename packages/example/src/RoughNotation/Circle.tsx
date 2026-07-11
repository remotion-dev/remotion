import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {containerStyle, useAnnotationProgress} from './shared';

export const RoughNotationCircle: React.FC = () => {
	const progress = useAnnotationProgress();

	return (
		<AbsoluteFill style={containerStyle}>
			<div>
				Straight to the{' '}
				<AnnotationOnTop
					progress={progress}
					type="circle"
					box="around"
					roughOptions={{roughness: 3, bowing: 3}}
					strokeWidth={7}
					color="#2563eb"
				>
					point
				</AnnotationOnTop>
			</div>
		</AbsoluteFill>
	);
};
