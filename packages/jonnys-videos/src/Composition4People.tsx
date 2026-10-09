import React from 'react';
import {
	Interactive,
	AbsoluteFill,
	CanvasImage,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const Composition4PeopleInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill
			showInTimeline={false}
			name="People grid"
			style={{
				backgroundColor: 'black',
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				gridTemplateRows: '1fr 1fr',
				gap: 24,
				padding: 24,
			}}
		>
			<CanvasImage
				name="Top left person"
				src="https://remotion.media/jonnys-videos/four-people/person-1.png"
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					scale: interpolate(frame, [0, 2 * fps], [0, 1], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			/>
			<CanvasImage
				name="Top right person"
				src="https://remotion.media/jonnys-videos/four-people/person-4.png"
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					scale: interpolate(frame, [0, 2 * fps], [0, 1], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			/>
			<CanvasImage
				name="Bottom left person"
				src="https://remotion.media/jonnys-videos/four-people/person-2.png"
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					scale: interpolate(frame, [0, 2 * fps], [0, 1], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			/>
			<CanvasImage
				name="Bottom right person"
				src="https://remotion.media/jonnys-videos/four-people/person-3.png"
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					scale: interpolate(frame, [0, 2 * fps], [0, 1], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			/>
		</AbsoluteFill>
	);
};

export const Composition4People = Interactive.withSchema({
	Component: Composition4PeopleInner,
	componentName: '<Composition4People>',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
