import {
	AudioSampleSink,
	AudioSampleSource,
	canEncodeAudio,
	EncodedAudioPacketSource,
	EncodedPacketSink,
	type Input,
	type Output,
	Quality,
	type Target,
	type WebMOutputFormat,
} from 'mediabunny';

export type VideoMattingAudioDestination =
	| 'base'
	| 'foreground'
	| 'both'
	| 'none';

export type PreparedVideoMattingAudio = {
	/**
	 * Queues the first audio packet or sample, even when it starts after the
	 * first video frame. Call this after the outputs have started.
	 */
	prime: () => Promise<void>;
	/**
	 * Writes audio whose rebased start timestamp is at or before the given
	 * output timestamp. Calls must use monotonically increasing timestamps.
	 */
	writeAudioUntil: (outputTimestamp: number) => Promise<void>;
	/** Writes the remaining audio up to the end of the video and closes it. */
	finishAudio: () => Promise<void>;
	/** Releases decoded samples that have not been written yet. */
	cancel: () => Promise<void>;
};

export const prepareAudio = async <
	BaseTarget extends Target,
	ForegroundTarget extends Target,
>({
	input,
	baseOutput,
	foregroundOutput,
	destination,
	videoStartTimestamp,
	videoEndTimestamp,
	audioQuality,
	forceTranscode,
}: {
	input: Input;
	baseOutput: Output<WebMOutputFormat, BaseTarget>;
	foregroundOutput: Output<WebMOutputFormat, ForegroundTarget>;
	destination: VideoMattingAudioDestination;
	videoStartTimestamp: number;
	videoEndTimestamp: number;
	audioQuality: Quality | null;
	forceTranscode: boolean;
}): Promise<PreparedVideoMattingAudio> => {
	if (!Number.isFinite(videoStartTimestamp)) {
		throw new TypeError('videoStartTimestamp must be a finite number.');
	}

	if (!Number.isFinite(videoEndTimestamp)) {
		throw new TypeError('videoEndTimestamp must be a finite number.');
	}

	if (videoEndTimestamp < videoStartTimestamp) {
		throw new RangeError(
			'videoEndTimestamp must be greater than or equal to videoStartTimestamp.',
		);
	}

	if (typeof forceTranscode !== 'boolean') {
		throw new TypeError('forceTranscode must be a boolean.');
	}

	if (destination === 'none') {
		return {
			prime: () => Promise.resolve(),
			writeAudioUntil: () => Promise.resolve(),
			finishAudio: () => Promise.resolve(),
			cancel: () => Promise.resolve(),
		};
	}

	const audioTrack = await input.getPrimaryAudioTrack();
	if (audioTrack === null) {
		return {
			prime: () => Promise.resolve(),
			writeAudioUntil: () => Promise.resolve(),
			finishAudio: () => Promise.resolve(),
			cancel: () => Promise.resolve(),
		};
	}

	const [firstAudioTimestamp, audioEndTimestamp] = await Promise.all([
		audioTrack.getFirstTimestamp(),
		audioTrack.computeDuration(),
	]);
	if (
		firstAudioTimestamp >= videoEndTimestamp ||
		audioEndTimestamp <= videoStartTimestamp
	) {
		return {
			prime: () => Promise.resolve(),
			writeAudioUntil: () => Promise.resolve(),
			finishAudio: () => Promise.resolve(),
			cancel: () => Promise.resolve(),
		};
	}

	const outputs =
		destination === 'both'
			? [baseOutput, foregroundOutput]
			: destination === 'base'
				? [baseOutput]
				: [foregroundOutput];
	const sourceCodec = await audioTrack.getCodec();
	const canCopyPackets =
		!forceTranscode &&
		sourceCodec === 'opus' &&
		firstAudioTimestamp >= videoStartTimestamp;

	let lastWriteTimestamp = -Infinity;
	let primed = false;
	let finished = false;
	let canceled = false;

	if (canCopyPackets) {
		const decoderConfig = await audioTrack.getDecoderConfig();
		const packetSources = outputs.map((output) => {
			const source = new EncodedAudioPacketSource('opus');
			output.addAudioTrack(source, {
				decoderConfig: decoderConfig ?? undefined,
			});
			return source;
		});
		const packetIterator = new EncodedPacketSink(audioTrack).packets();
		let pendingPacket: Awaited<ReturnType<typeof packetIterator.next>>['value'];
		let packetIteratorDone = false;
		let packetSourcesClosed = false;

		const closePacketSources = () => {
			if (
				packetSourcesClosed ||
				outputs.some((output) => output.state !== 'started')
			) {
				return;
			}

			packetSourcesClosed = true;
			for (const source of packetSources) {
				source.close();
			}
		};

		const stopPacketIterator = async () => {
			if (packetIteratorDone) {
				return;
			}

			packetIteratorDone = true;
			try {
				await packetIterator.return(undefined);
			} catch {
				// Iterator teardown is best-effort cleanup.
			}
		};

		const writePacketsUntil = async ({
			outputTimestamp,
			writeAtLeastOne,
		}: {
			outputTimestamp: number;
			writeAtLeastOne: boolean;
		}) => {
			let packetsWritten = 0;
			while (!packetIteratorDone) {
				if (pendingPacket === undefined) {
					const next = await packetIterator.next();
					if (next.done) {
						packetIteratorDone = true;
						closePacketSources();
						return;
					}

					pendingPacket = next.value;
				}

				if (pendingPacket.timestamp >= videoEndTimestamp) {
					pendingPacket = undefined;
					await stopPacketIterator();
					closePacketSources();
					return;
				}

				const rebasedTimestamp = pendingPacket.timestamp - videoStartTimestamp;
				if (
					rebasedTimestamp > outputTimestamp &&
					(!writeAtLeastOne || packetsWritten > 0)
				) {
					return;
				}

				const packet = pendingPacket.clone({
					timestamp: rebasedTimestamp,
				});
				pendingPacket = undefined;
				const metadata: EncodedAudioChunkMetadata = {
					decoderConfig: decoderConfig ?? undefined,
				};
				await Promise.all(
					packetSources.map((source) => source.add(packet, metadata)),
				);
				packetsWritten++;
				if (writeAtLeastOne) {
					return;
				}
			}
		};

		return {
			prime: async () => {
				if (primed || finished || canceled) {
					return;
				}

				primed = true;
				await writePacketsUntil({
					outputTimestamp: 0,
					writeAtLeastOne: true,
				});
			},
			writeAudioUntil: async (outputTimestamp) => {
				if (!Number.isFinite(outputTimestamp) || outputTimestamp < 0) {
					throw new TypeError(
						'outputTimestamp must be a finite, non-negative number.',
					);
				}

				if (outputTimestamp < lastWriteTimestamp) {
					throw new RangeError(
						'writeAudioUntil() timestamps must be monotonically increasing.',
					);
				}

				if (finished || canceled) {
					return;
				}

				lastWriteTimestamp = outputTimestamp;
				await writePacketsUntil({
					outputTimestamp: Math.min(
						outputTimestamp,
						videoEndTimestamp - videoStartTimestamp,
					),
					writeAtLeastOne: false,
				});
			},
			finishAudio: async () => {
				if (finished || canceled) {
					return;
				}

				finished = true;
				try {
					await writePacketsUntil({
						outputTimestamp: videoEndTimestamp - videoStartTimestamp,
						writeAtLeastOne: false,
					});
				} finally {
					await stopPacketIterator();
					closePacketSources();
				}
			},
			cancel: async () => {
				if (finished || canceled) {
					return;
				}

				canceled = true;
				pendingPacket = undefined;
				await stopPacketIterator();
			},
		};
	}

	if (!(await audioTrack.canDecode())) {
		throw new Error(
			`The primary audio track uses ${sourceCodec ?? 'an unknown codec'}, which ` +
				'cannot be decoded in this browser. The audio cannot be converted to Opus.',
		);
	}

	const originalNumberOfChannels = await audioTrack.getNumberOfChannels();
	const originalSampleRate = await audioTrack.getSampleRate();
	const quality = audioQuality ?? new Quality('medium');
	let outputNumberOfChannels = originalNumberOfChannels;
	let outputSampleRate = originalSampleRate;

	if (
		!(await canEncodeAudio('opus', {
			numberOfChannels: outputNumberOfChannels,
			sampleRate: outputSampleRate,
			quality,
		}))
	) {
		outputNumberOfChannels = Math.min(originalNumberOfChannels, 2);
		outputSampleRate = 48_000;

		if (
			!(await canEncodeAudio('opus', {
				numberOfChannels: outputNumberOfChannels,
				sampleRate: outputSampleRate,
				quality,
			}))
		) {
			throw new Error(
				'The primary audio track must be transcoded to Opus, but this browser ' +
					'does not support a compatible Opus encoder.',
			);
		}
	}

	const sampleSources = outputs.map((output) => {
		const source = new AudioSampleSource({
			codec: 'opus',
			quality,
			transform: {
				numberOfChannels:
					outputNumberOfChannels === originalNumberOfChannels
						? undefined
						: outputNumberOfChannels,
				sampleRate:
					outputSampleRate === originalSampleRate
						? undefined
						: outputSampleRate,
			},
		});
		output.addAudioTrack(source);
		return source;
	});
	const sampleIterator = new AudioSampleSink(audioTrack).samples(
		videoStartTimestamp,
		videoEndTimestamp,
	);
	let pendingSample: Awaited<ReturnType<typeof sampleIterator.next>>['value'];
	let iteratorDone = false;
	let sourcesClosed = false;

	const closeSources = () => {
		if (sourcesClosed || outputs.some((output) => output.state !== 'started')) {
			return;
		}

		sourcesClosed = true;
		for (const source of sampleSources) {
			source.close();
		}
	};

	const stopSampleIterator = async () => {
		if (iteratorDone) {
			return;
		}

		iteratorDone = true;
		try {
			await sampleIterator.return(undefined);
		} catch {
			// Iterator teardown is best-effort cleanup.
		}
	};

	const writeUntil = async ({
		outputTimestamp,
		writeAtLeastOne,
	}: {
		outputTimestamp: number;
		writeAtLeastOne: boolean;
	}) => {
		let samplesWritten = 0;
		while (!iteratorDone) {
			if (pendingSample === undefined) {
				const next = await sampleIterator.next();
				if (next.done) {
					iteratorDone = true;
					closeSources();
					return;
				}

				pendingSample = next.value;
			}

			const effectiveTimestamp =
				Math.max(pendingSample.timestamp, videoStartTimestamp) -
				videoStartTimestamp;
			if (
				effectiveTimestamp > outputTimestamp &&
				(!writeAtLeastOne || samplesWritten > 0)
			) {
				return;
			}

			const originalSample = pendingSample;
			pendingSample = undefined;
			let startFrame = 0;
			let endFrame = originalSample.numberOfFrames;
			if (originalSample.timestamp < videoStartTimestamp) {
				startFrame = Math.max(
					0,
					Math.min(
						originalSample.numberOfFrames,
						Math.round(
							(videoStartTimestamp - originalSample.timestamp) *
								originalSample.sampleRate,
						),
					),
				);
			}

			if (
				originalSample.timestamp + originalSample.duration >
				videoEndTimestamp
			) {
				endFrame = Math.max(
					0,
					Math.min(
						originalSample.numberOfFrames,
						Math.round(
							(videoEndTimestamp - originalSample.timestamp) *
								originalSample.sampleRate,
						),
					),
				);
			}

			if (endFrame <= startFrame) {
				originalSample.close();
				continue;
			}

			const sample =
				startFrame === 0 && endFrame === originalSample.numberOfFrames
					? originalSample
					: originalSample.trim(startFrame, endFrame);
			if (sample !== originalSample) {
				originalSample.close();
			}

			sample.setTimestamp(Math.max(0, sample.timestamp - videoStartTimestamp));

			const samples = sampleSources.map((_, index) =>
				index === sampleSources.length - 1 ? sample : sample.clone(),
			);
			try {
				await Promise.all(
					sampleSources.map((source, index) => source.add(samples[index]!)),
				);
			} finally {
				for (const sampleToClose of samples) {
					sampleToClose.close();
				}
			}

			samplesWritten++;
			if (writeAtLeastOne) {
				return;
			}
		}
	};

	return {
		prime: async () => {
			if (primed || finished || canceled) {
				return;
			}

			primed = true;
			await writeUntil({outputTimestamp: 0, writeAtLeastOne: true});
		},
		writeAudioUntil: async (outputTimestamp) => {
			if (!Number.isFinite(outputTimestamp) || outputTimestamp < 0) {
				throw new TypeError(
					'outputTimestamp must be a finite, non-negative number.',
				);
			}

			if (outputTimestamp < lastWriteTimestamp) {
				throw new RangeError(
					'writeAudioUntil() timestamps must be monotonically increasing.',
				);
			}

			if (finished || canceled) {
				return;
			}

			lastWriteTimestamp = outputTimestamp;
			await writeUntil({
				outputTimestamp: Math.min(
					outputTimestamp,
					videoEndTimestamp - videoStartTimestamp,
				),
				writeAtLeastOne: false,
			});
		},
		finishAudio: async () => {
			if (finished || canceled) {
				return;
			}

			finished = true;
			try {
				await writeUntil({
					outputTimestamp: videoEndTimestamp - videoStartTimestamp,
					writeAtLeastOne: false,
				});
			} finally {
				pendingSample?.close();
				pendingSample = undefined;
				await stopSampleIterator();
				closeSources();
			}
		},
		cancel: async () => {
			if (finished || canceled) {
				return;
			}

			canceled = true;
			try {
				pendingSample?.close();
			} catch {
				// Cancellation cleanup must not replace the original error.
			}

			pendingSample = undefined;
			await stopSampleIterator();
		},
	};
};
