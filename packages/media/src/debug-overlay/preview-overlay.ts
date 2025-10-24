import type {AudioIteratorManager} from '../audio-iterator-manager';
import type {VideoIteratorManager} from '../video-iterator-manager';

export const drawPreviewOverlay = ({
	context,
	audioTime,
	audioContextState,
	audioSyncAnchor,
	playing,
	audioIteratorManager,
	videoIteratorManager,
}: {
	context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
	audioTime: number;
	audioContextState: AudioContextState;
	audioSyncAnchor: number;
	playing: boolean;
	audioIteratorManager: AudioIteratorManager | null;
	videoIteratorManager: VideoIteratorManager | null;
}) => {
	// Collect all lines to be rendered
	const lines: string[] = [
		'Debug overlay',
		`Video iterators created: ${videoIteratorManager?.getVideoIteratorsCreated()}`,
		`Audio iterators created: ${audioIteratorManager?.getAudioIteratorsCreated()}`,
		`Frames rendered: ${videoIteratorManager?.getFramesRendered()}`,
		`Audio context state: ${audioContextState}`,
		`Audio time: ${(audioTime - audioSyncAnchor).toFixed(3)}s`,
	];

	if (audioIteratorManager) {
		const queuedPeriod = audioIteratorManager
			.getAudioBufferIterator()
			?.getQueuedPeriod();

		const numberOfChunksAfterResuming = audioIteratorManager
			?.getAudioBufferIterator()
			?.getNumberOfChunksAfterResuming();
		if (queuedPeriod) {
			lines.push(
				`Audio queued until: ${(queuedPeriod.until - (audioTime - audioSyncAnchor)).toFixed(3)}s`,
			);
		} else if (numberOfChunksAfterResuming) {
			lines.push(
				`Audio chunks for after resuming: ${numberOfChunksAfterResuming}`,
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
