import type {MediaParserController} from '../../controller/media-parser-controller';
import type {M3uState} from '../../state/m3u-state';
import type {AudioOrVideoSample} from '../../webcodec-sample-types';

export const considerSeekBasedOnChunk = ({
	sample,
	parentController,
	childController,
	callback,
	m3uState,
	playlistUrl,
	subtractChunks,
}: {
	sample: AudioOrVideoSample;
	callback: (sample: AudioOrVideoSample) => void | Promise<void>;
	parentController: MediaParserController;
	childController: MediaParserController;
	playlistUrl: string;
	m3uState: M3uState;
	subtractChunks: number;
}) => {
	const pendingSeek = m3uState.getSeekToSecondsToProcess(playlistUrl);
	// If there is not even a seek to consider, just call the callback
	if (pendingSeek === null) {
		callback(sample);
		return;
	}

	const timestamp = Math.min(
		sample.dts / sample.timescale,
		sample.cts / sample.timescale,
	);

	// Already too far, now we should go to the previous chunk
	if (timestamp > pendingSeek.targetTime) {
		m3uState.setNextSeekShouldSubtractChunks(playlistUrl, subtractChunks + 1);
		parentController._experimentalSeek({
			type: 'keyframe-before-time',
			timeInSeconds: pendingSeek.targetTime,
		});

		return;
	}

	// We are good, we have not gone too far! Don't emit sample and seek and clear pending seek
	childController._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: pendingSeek.targetTime,
	});
	m3uState.setNextSeekShouldSubtractChunks(playlistUrl, 0);
	m3uState.setSeekToSecondsToProcess(playlistUrl, null);
};
