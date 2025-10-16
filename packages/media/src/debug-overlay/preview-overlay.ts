import type {WrappedCanvas} from 'mediabunny';

export const drawPreviewOverlay = (
	context: CanvasRenderingContext2D,
	nextFrame: WrappedCanvas | null,
) => {
	// Optionally, set a background for text legibility
	context.fillStyle = 'rgba(0, 0, 0, 1)';
	context.fillRect(20, 20, 300, 100);

	context.fillStyle = 'white';
	context.font = '24px sans-serif';
	context.textBaseline = 'top';
	context.fillText(
		`next: ${nextFrame ? nextFrame.timestamp.toFixed(3) + 's' : null}`,
		30,
		30,
	);
};
