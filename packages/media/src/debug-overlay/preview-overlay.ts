export type DebugStats = {
	videoIteratorsCreated: number;
	framesRendered: number;
};

export const drawPreviewOverlay = (
	context: CanvasRenderingContext2D,
	stats: DebugStats,
) => {
	// Optionally, set a background for text legibility
	context.fillStyle = 'rgba(0, 0, 0, 1)';
	context.fillRect(20, 20, 300, 100);

	context.fillStyle = 'white';
	context.font = '24px sans-serif';
	context.textBaseline = 'top';
	context.fillText(`Debug overlay`, 30, 30);
	context.fillText(
		`Video iterators created: ${stats.videoIteratorsCreated}`,
		30,
		60,
	);
	context.fillText(`Frames rendered: ${stats.framesRendered}`, 30, 90);
};
