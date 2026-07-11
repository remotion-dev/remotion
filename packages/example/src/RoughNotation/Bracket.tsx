import {AnnotationOnTop} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {containerStyle, useAnnotationProgress} from './shared';

export const RoughNotationBracket: React.FC = () => {
	const progress = useAnnotationProgress();

	return (
		<AbsoluteFill style={containerStyle}>
			<div>
				Mark{' '}
				<AnnotationOnTop
					progress={progress}
					type="bracket"
					brackets={['left', 'right']}
					roughOptions={{roughness: 1, bowing: 3}}
					strokeWidth={8}
					color="#dc2626"
				>
					this
				</AnnotationOnTop>{' '}
				part
			</div>
		</AbsoluteFill>
	);
};
