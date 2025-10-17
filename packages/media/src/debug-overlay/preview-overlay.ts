export type DebugStats = {
	videoIteratorsCreated: number;
	audioIteratorsCreated: number;
	framesRendered: number;
};

export const drawPreviewOverlay = (
	context: CanvasRenderingContext2D,
	stats: DebugStats,
	audioContextState: AudioContextState,
	audioSyncAnchor: number,
) => {
	// Optionally, set a background for text legibility
	context.fillStyle = 'rgba(0, 0, 0, 1)';
	context.fillRect(20, 20, 600, 220);

	context.fillStyle = 'white';
	context.font = '24px sans-serif';
	context.textBaseline = 'top';
	context.fillText(`Debug overlay`, 30, 30);
	context.fillText(
		`Video iterators created: ${stats.videoIteratorsCreated}`,
		30,
		60,
	);
	context.fillText(
		`Audio iterators created: ${stats.audioIteratorsCreated}`,
		30,
		90,
	);
	context.fillText(`Frames rendered: ${stats.framesRendered}`, 30, 120);
	context.fillText(`Audio context state: ${audioContextState}`, 30, 150);
	context.fillText(`Audio time: ${audioSyncAnchor.toFixed(3)}s`, 30, 180);
};
