import type {
	MediaParserLogLevel,
	MediaParserOnVideoSample,
	MediaParserVideoTrack,
} from '@remotion/media-parser';
import type {MediaFn} from './create/media-fn';
import type {ProgressTracker} from './create/progress-tracker';
import {Log} from './log';
import type {ConvertMediaProgressFn} from './throttled-state-update';

export const copyVideoTrack = async ({
	logLevel,
	state,
	track,
	onMediaStateUpdate,
	progressTracker,
}: {
	logLevel: MediaParserLogLevel;
	state: MediaFn;
	track: MediaParserVideoTrack;
	onMediaStateUpdate: null | ConvertMediaProgressFn;
	progressTracker: ProgressTracker;
}): Promise<MediaParserOnVideoSample> => {
	Log.verbose(
		logLevel,
		`Copying video track with codec ${track.codec} and timescale ${track.originalTimescale}`,
	);

	const videoTrack = await state.addTrack({
		type: 'video',
		color: track.advancedColor,
		width: track.codedWidth,
		height: track.codedHeight,
		codec: track.codecEnum,
		codecPrivate: track.codecData?.data ?? null,
		timescale: track.originalTimescale,
	});

	return async (sample) => {
		progressTracker.setPossibleLowestTimestamp(
			Math.min(sample.timestamp, sample.decodingTimestamp ?? Infinity),
		);
		await state.addSample({
			chunk: sample,
			trackNumber: videoTrack.trackNumber,
			isVideo: true,
			codecPrivate: track.codecData?.data ?? null,
		});

		onMediaStateUpdate?.((prevState) => {
			return {
				...prevState,
				decodedVideoFrames: prevState.decodedVideoFrames + 1,
			};
		});
	};
};
