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
import {
	getGroupOfIntendedSeek,
	isSeekAchieved,
	isSeekInfeasible,
	SEEK_TOLERANCE_IN_SECONDS,
} from './seek-logic';
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
	const playback = makePlaybackState({frameDatabase, drawFrame});

	let decoder: WebCodecsVideoDecoder | null = null;
	let lastKeyframeTimestamp: number | null = null;

	const seek = throttledSeek((time: number) => {
		decoder!.reset();

		mpController.seek(time);
		mpController.resume();
	});

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
			let loopIteration = 0;
			decoder = createVideoDecoder({
				onError: (err) => {
					onError(err);
					mpController.abort();
				},
				onFrame: (frame) => {
					const desiredSeek = seek.getDesiredSeek();

					if (desiredSeek) {
						if (
							frame.timestamp <
							(desiredSeek.getDesired() - SEEK_TOLERANCE_IN_SECONDS) *
								WEBCODECS_TIMESCALE
						) {
							// Don't draw if we are seeking to a later frame
							frame.close();
							return;
						}

						frameDatabase.addFrame(frame, loopIteration);

						if (isSeekInfeasible(frameDatabase, desiredSeek.getDesired())) {
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
							playback.drawImmediately();
							return;
						}
					}

					frameDatabase.addFrame(frame, loopIteration);
					playback.drawImmediately();
				},
				track,
				controller: wcController,
			});

			return async (sample) => {
				if (sample.type === 'key') {
					lastKeyframeTimestamp = Math.min(
						sample.timestamp,
						sample.decodingTimestamp,
					);
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
						loopIteration++;
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
		seek: async (time: number) => {
			playback.setCurrentTime(time * WEBCODECS_TIMESCALE);

			// If the right frame is already in the database, we can draw it immediately
			if (isSeekAchieved({frameDatabase, seekToSeconds: time})) {
				seek.clearSeek();
				mpController.resume();
				playback.drawImmediately();
				return;
			}

			const simulatedSeek = await mpController.simulateSeek(time);

			if (simulatedSeek.type === 'do-seek') {
				const group = getGroupOfIntendedSeek(
					frameDatabase,
					simulatedSeek.timeInSeconds,
				);
				if (group && group.startingTimestamp === lastKeyframeTimestamp) {
					// we are in the same group, don't seek yet! maybe we can just wait
					const lastFrameInput = decoder!.getMostRecentSampleInput();

					// all frames are before the seek, we can just wait
					if (lastFrameInput && lastFrameInput < time * WEBCODECS_TIMESCALE) {
						frameDatabase.clearFramesBeforeTimestampFromGroup({
							deleteFramesBeforeTimestamp: time * WEBCODECS_TIMESCALE,
							groupStartingTimestamp: group.startingTimestamp,
						});
						seek.setSeekWithoutMediaParserSeek(time);
						return;
					}

					frameDatabase.clearGroup(group.startingTimestamp);

					// we are already too far, we need to seek back to the beginning of the group.
					seek.queueSeek(time, frameDatabase);
					return;
				}
			}

			// was not able to simulate seek, I guess we just force the seek
			frameDatabase.clearDatabase();
			seek.queueSeek(time, frameDatabase);
		},
		addEventListener: playback.emitter.addEventListener,
		removeEventListener: playback.emitter.removeEventListener,
		frameDatabase,
	};
};

export type Player = ReturnType<typeof playMedia>;
