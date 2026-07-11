import {
	AnnotationBehind,
	AnnotationOnTop,
	createAnnotation,
} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	interpolateColors,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const annotation = createAnnotation();

const containerStyle: React.CSSProperties = {
	backgroundColor: '#f7f2e8',
	color: '#171717',
	fontFamily: 'GT Planar, sans-serif',
	justifyContent: 'center',
	alignItems: 'center',
	fontSize: 96,
	fontWeight: 700,
	textAlign: 'center',
};

const useAnnotationProgress = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	return spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 60,
	});
};

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
