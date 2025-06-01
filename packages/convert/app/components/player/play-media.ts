import type {
	MediaParserDimensions,
	ParseMediaSrc,
} from '@remotion/media-parser';
import {
	hasBeenAborted,
	mediaParserController,
	parseMedia,
	WEBCODECS_TIMESCALE,
} from '@remotion/media-parser';
import type {WebCodecsVideoDecoder} from '@remotion/webcodecs';
import {createVideoDecoder, webcodecsController} from '@remotion/webcodecs';
import {makeFrameDatabase} from './frame-database';
import {makePlaybackState} from './playback-state';
import {isSeekAchieved, isSeekInfeasible} from './seek-logic';
import {throttledSeek} from './throttled-seek';

export const playMedia = ({
	src,
	signal,
	onDimensions,
	onDurationInSeconds,
	onError,
	drawFrame,
	loop,
}: {
	src: ParseMediaSrc;
	signal: AbortSignal;
	onDimensions: (dim: MediaParserDimensions | null) => void;
	onDurationInSeconds: (duration: number | null) => void;
	drawFrame: (frame: VideoFrame) => boolean;
	onError: (err: Error) => void;
	loop: boolean;
}) => {
	const wcController = webcodecsController();
	const mpController = mediaParserController();

	const frameDatabase = makeFrameDatabase();
	const playback = makePlaybackState(frameDatabase, drawFrame);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let seekVideo = (_time: number) => undefined;

	let decoder: WebCodecsVideoDecoder | null = null;

	const seek = throttledSeek((t) => seekVideo(t));
	seekVideo = (time: number) => {
		if (decoder) {
			decoder.reset();
		}

		mpController.seek(time);
		mpController.resume();
	};

	const onAbort = () => {
		mpController.abort();
	};

	signal.addEventListener('abort', onAbort);

	parseMedia({
		src,
		acknowledgeRemotionLicense: true,
		controller: mpController,
		onDimensions,
		onDurationInSeconds,
		onVideoTrack: ({track}) => {
			decoder = createVideoDecoder({
				onError: (err) => {
					onError(err);
					mpController.abort();
				},
				onFrame: (frame) => {
					const desiredSeek = seek.getDesiredSeek();
					frameDatabase.addFrame(frame);
					if (desiredSeek) {
						if (isSeekInfeasible(frameDatabase, desiredSeek.getDesired())) {
							// Seek is pending, but we already too far.
							decoder!.reset();
							seek.replaceWithNewestSeek();
							return;
						}

						if (
							isSeekAchieved({
								frameDatabase,
								seekToSeconds: desiredSeek.getDesired(),
							})
						) {
							seek.clearSeek();
						}
					}
				},
				track,
				controller: wcController,
			});

			return async (sample) => {
				if (sample.type === 'key') {
					frameDatabase.startNewGop(sample);
				}

				const {wasReset} = decoder!.checkReset();

				await decoder!.waitForQueueToBeLessThan(20);
				if (wasReset()) {
					return;
				}

				await frameDatabase.waitForQueueToBeLessThan(15);
				if (wasReset()) {
					return;
				}

				await decoder!.decode(sample);
				if (wasReset()) {
					return;
				}

				return async () => {
					await decoder!.flush();
					if (wasReset()) {
						return;
					}

					frameDatabase.setLastFrame();
					mpController.pause();

					if (loop) {
						seek.queueSeek(0, frameDatabase);
					}
				};
			};
		},
	})
		.catch((err) => {
			if (!hasBeenAborted(err)) {
				onError(err);
			} else {
				console.log('aborted');
			}
		})
		.finally(() => {
			signal.removeEventListener('abort', onAbort);
		});

	return {
		play: () => {
			playback.play();
		},
		pause: () => {
			playback.pause();
		},
		isPlaying: () => {
			return playback.isPlaying();
		},
		getCurrentTime: () => {
			return playback.getCurrentTime();
		},
		seek: (time: number) => {
			playback.setCurrentTime(time * WEBCODECS_TIMESCALE);
			if (isSeekAchieved({frameDatabase, seekToSeconds: time})) {
				seek.clearSeek();
				mpController.resume();
				return;
			}

			seek.queueSeek(time, frameDatabase);
		},
		addEventListener: playback.emitter.addEventListener,
		removeEventListener: playback.emitter.removeEventListener,
		frameDatabase,
	};
};

export type Player = ReturnType<typeof playMedia>;
