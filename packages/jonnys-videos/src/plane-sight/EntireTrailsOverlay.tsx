import {
	AbsoluteFill,
	CanvasImage,
	Interactive,
	type InteractiveTransformProps,
} from 'remotion';

const EntireTrailsOverlayContent = ({style}: InteractiveTransformProps) => {
	return (
		<AbsoluteFill style={style}>
			<CanvasImage
				name="Entire Trails — pixel-font wink"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/overlays/entire-trails.svg'
				}
				style={{
					position: 'absolute',
					left: 190,
					top: 300,
					width: 900,
					height: 150,
					objectFit: 'contain',
				}}
			/>
		</AbsoluteFill>
	);
};

export const EntireTrailsOverlay = Interactive.create({
	Component: EntireTrailsOverlayContent,
	componentName: 'EntireTrailsOverlay',
});
