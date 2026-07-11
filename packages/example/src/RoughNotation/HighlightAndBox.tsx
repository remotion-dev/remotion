import {AnnotationBehind, createAnnotation} from '@remotion/rough-notation';
import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {containerStyle, useAnnotationProgress} from './shared';

const annotation = createAnnotation();

export const RoughNotationHighlightAndBox: React.FC = () => {
	const progress = useAnnotationProgress();
	const highlightColor = interpolateColors(
		progress,
		[0, 1],
		['rgba(255, 236, 79, 0)', 'rgba(255, 236, 79, 0.9)'],
	);

	return (
		<AbsoluteFill style={containerStyle}>
			<annotation.Container>
				<AbsoluteFill style={containerStyle}>
					<div>
						<AnnotationBehind
							progress={progress}
							type="highlight"
							color={highlightColor}
							iterations={8}
							roughOptions={{maxRandomnessOffset: 10}}
						>
							Rough
						</AnnotationBehind>
						<span> notation</span>
					</div>
					<div style={{fontSize: 62, marginTop: 56}}>
						<annotation.Tracker>box target</annotation.Tracker>
					</div>
				</AbsoluteFill>
				<AbsoluteFill>
					<annotation.Annotation
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
					/>
				</AbsoluteFill>
			</annotation.Container>
		</AbsoluteFill>
	);
};
