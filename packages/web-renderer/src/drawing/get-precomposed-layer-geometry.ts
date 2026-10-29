export const getPrecomposedLayerGeometry = ({
	precomposeRect,
	totalMatrix,
	parentRect,
	scale,
	is3DPrecomposition,
}: {
	precomposeRect: DOMRect;
	totalMatrix: DOMMatrix;
	parentRect: DOMRect;
	scale: number;
	is3DPrecomposition: boolean;
}) => {
	if (
		is3DPrecomposition ||
		totalMatrix.b !== 0 ||
		totalMatrix.c !== 0 ||
		!(totalMatrix.a > 0) ||
		totalMatrix.a !== totalMatrix.d
	) {
		return {
			rect: precomposeRect,
			scale,
			pixelWidth: null,
			pixelHeight: null,
		};
	}

	// If the layer is only scaled and translated when it is drawn (e.g. an
	// ancestor has `scale(0.9)`), rasterize it at that scale and align it to
	// the device pixel grid. Otherwise text would be rasterized at 1x and
	// resampled, shifting baselines and blurring edges.
	const layerScale = scale * totalMatrix.a;
	const deviceLeft = Math.floor(
		scale *
			(totalMatrix.a * precomposeRect.left + totalMatrix.e - parentRect.x),
	);
	const deviceTop = Math.floor(
		scale * (totalMatrix.d * precomposeRect.top + totalMatrix.f - parentRect.y),
	);
	const deviceRight = Math.ceil(
		scale *
			(totalMatrix.a * precomposeRect.right + totalMatrix.e - parentRect.x),
	);
	const deviceBottom = Math.ceil(
		scale *
			(totalMatrix.d * precomposeRect.bottom + totalMatrix.f - parentRect.y),
	);
	const pixelWidth = deviceRight - deviceLeft;
	const pixelHeight = deviceBottom - deviceTop;

	return {
		rect: new DOMRect(
			(deviceLeft / scale - totalMatrix.e + parentRect.x) / totalMatrix.a,
			(deviceTop / scale - totalMatrix.f + parentRect.y) / totalMatrix.d,
			pixelWidth / layerScale,
			pixelHeight / layerScale,
		),
		scale: layerScale,
		pixelWidth,
		pixelHeight,
	};
};
