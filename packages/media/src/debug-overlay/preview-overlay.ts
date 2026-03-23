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
	playbackRate,
}: {
	context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
	audioTime: number | null;
	audioContextState: AudioContextState | null;
	audioSyncAnchor: {value: number} | null;
	playing: boolean;
	audioIteratorManager: AudioIteratorManager | null;
	videoIteratorManager: VideoIteratorManager | null;
	playbackRate: number;
}) => {
	const anchorValue = audioSyncAnchor?.value ?? 0;

	// Collect all lines to be rendered
	const lines: string[] = [
		'Debug overlay',
		`Video iterators created: ${videoIteratorManager?.getVideoIteratorsCreated()}`,
		`Audio iterators created: ${audioIteratorManager?.getAudioIteratorsCreated()}`,
		`Frames rendered: ${videoIteratorManager?.getFramesRendered()}`,
		`Audio context state: ${audioContextState}`,
		audioTime
			? `Audio time: ${((audioTime - anchorValue) * playbackRate).toFixed(3)}s`
			: null,
	].filter(Boolean) as string[];

	if (audioIteratorManager) {
		const queuedPeriod = audioIteratorManager
			.getAudioBufferIterator()
			?.getQueuedPeriod();

		if (queuedPeriod) {
			const aheadText = audioTime
				? ` (${(queuedPeriod.until - (audioTime - anchorValue) * playbackRate).toFixed(3)}s ahead)`
				: '';
			lines.push(
				`Audio queued until ${queuedPeriod.until.toFixed(3)}s${aheadText}`,
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
