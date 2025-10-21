import type {AudioIterator} from '../audio/audio-preview-iterator';

export type DebugStats = {
	videoIteratorsCreated: number;
	audioIteratorsCreated: number;
	framesRendered: number;
};

export const drawPreviewOverlay = ({
	context,
	stats,
	audioTime,
	audioContextState,
	audioIterator,
	audioSyncAnchor,
	audioChunksForAfterResuming,
	playing,
}: {
	context: CanvasRenderingContext2D;
	stats: DebugStats;
	audioTime: number;
	audioContextState: AudioContextState;
	audioSyncAnchor: number;
	audioIterator: AudioIterator | null;
	audioChunksForAfterResuming: {
		buffer: AudioBuffer;
		timestamp: number;
	}[];
	playing: boolean;
}) => {
	// Collect all lines to be rendered
	const lines: string[] = [
		'Debug overlay',
		`Video iterators created: ${stats.videoIteratorsCreated}`,
		`Audio iterators created: ${stats.audioIteratorsCreated}`,
		`Frames rendered: ${stats.framesRendered}`,
		`Audio context state: ${audioContextState}`,
		`Audio time: ${(audioTime - audioSyncAnchor).toFixed(3)}s`,
	];

	if (audioIterator) {
		const queuedPeriod = audioIterator.getQueuedPeriod();
		if (queuedPeriod) {
			lines.push(
				`Audio queued until: ${(queuedPeriod.until - (audioTime - audioSyncAnchor)).toFixed(3)}s`,
			);
		} else if (audioChunksForAfterResuming.length > 0) {
			lines.push(
				`Audio chunks for after resuming: ${audioChunksForAfterResuming.length}`,
			);
		}

		lines.push(`Playing: ${playing}`);
	}

	const lineHeight = 30; // px, should match or exceed font size
	const boxPaddingX = 10;
	const boxPaddingY = 10;
	const boxLeft = 20;
	const boxTop = 20;

	const boxWidth = 600;
	const boxHeight = lines.length * lineHeight + 2 * boxPaddingY;

	// Draw background for text legibility
	context.fillStyle = 'rgba(0, 0, 0, 1)';
	context.fillRect(boxLeft, boxTop, boxWidth, boxHeight);

	context.fillStyle = 'white';
	context.font = '24px sans-serif';
	context.textBaseline = 'top';

	for (let i = 0; i < lines.length; i++) {
		context.fillText(
			lines[i],
			boxLeft + boxPaddingX,
			boxTop + boxPaddingY + i * lineHeight,
		);
	}
};
