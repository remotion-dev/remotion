import {
	BufferTarget,
	Output,
	StreamTarget,
	type OutputFormat,
	type StreamTargetChunk,
} from 'mediabunny';
import type {VideoLayerOutput, VideoLayerOutputOptions} from './output-target';
import {
	canUseWebFsWriter,
	createWebFsVideoLayerTarget,
	type WebFsVideoLayerTarget,
} from './web-fs-target';

type VideoLayerMediabunnyTarget = BufferTarget | StreamTarget;

export type CreatedVideoLayerOutput<F extends OutputFormat> = {
	output: Output<F, VideoLayerMediabunnyTarget>;
	finalize: () => Promise<VideoLayerOutput>;
	cancel: () => Promise<void>;
	discard: () => Promise<void>;
};

export const createVideoLayerOutput = async <F extends OutputFormat>({
	format,
	options,
}: {
	format: F;
	options: VideoLayerOutputOptions | undefined;
}): Promise<CreatedVideoLayerOutput<F>> => {
	if (
		options?.outputTarget !== undefined &&
		options.outputWritable !== undefined
	) {
		throw new Error(
			'outputTarget and outputWritable cannot both be specified for a video layer',
		);
	}

	let webFsTarget: WebFsVideoLayerTarget | null = null;
	let target: VideoLayerMediabunnyTarget;
	let outputMode: 'arraybuffer' | 'web-fs' | 'writable';
	const outputWritable = options?.outputWritable;
	let outputWritableWriter: WritableStreamDefaultWriter<StreamTargetChunk> | null =
		null;
	let outputWritableClosePromise: Promise<void> | null = null;
	let outputWritableAbortPromise: Promise<void> | null = null;
	let outputWritableWasClosed = false;
	const getOutputWritableWriter = () => {
		if (outputWritable === undefined) {
			throw new Error('Expected a caller-provided output WritableStream');
		}

		outputWritableWriter ??= outputWritable.getWriter();
		return outputWritableWriter;
	};

	const releaseOutputWritableWriter = () => {
		if (outputWritableWriter === null) {
			return;
		}

		outputWritableWriter.releaseLock();
		outputWritableWriter = null;
	};

	const closeOutputWritable = () => {
		if (outputWritable === undefined || outputWritableWasClosed) {
			return Promise.resolve();
		}

		if (outputWritableAbortPromise !== null) {
			return outputWritableAbortPromise;
		}

		if (outputWritableClosePromise === null) {
			const writer = getOutputWritableWriter();
			outputWritableClosePromise = (async () => {
				try {
					await writer.close();
					outputWritableWasClosed = true;
				} finally {
					releaseOutputWritableWriter();
				}
			})();
		}

		return outputWritableClosePromise;
	};

	const abortOutputWritable = (reason: unknown) => {
		if (outputWritable === undefined || outputWritableWasClosed) {
			return Promise.resolve();
		}

		if (outputWritableAbortPromise === null) {
			const writer = getOutputWritableWriter();
			outputWritableAbortPromise = (async () => {
				try {
					await writer.abort(reason);
				} finally {
					releaseOutputWritableWriter();
				}
			})();
		}

		return outputWritableAbortPromise;
	};

	if (outputWritable !== undefined) {
		target = new StreamTarget(
			new WritableStream<StreamTargetChunk>({
				write: (chunk) => getOutputWritableWriter().write(chunk),
				// Mediabunny closes its target for both cancellation and finalization.
				// The caller's stream is settled once we know which case occurred.
				close: () => Promise.resolve(),
				abort: (reason) => abortOutputWritable(reason),
			}),
		);
		outputMode = 'writable';
	} else {
		const outputTarget =
			options?.outputTarget ??
			((await canUseWebFsWriter()) ? 'web-fs' : 'arraybuffer');

		if (outputTarget === 'web-fs') {
			webFsTarget = await createWebFsVideoLayerTarget();
			target = new StreamTarget(webFsTarget.stream);
			outputMode = 'web-fs';
		} else {
			target = new BufferTarget();
			outputMode = 'arraybuffer';
		}
	}

	const output = new Output({format, target});
	let finalizationPromise: Promise<VideoLayerOutput> | null = null;
	let cancellationPromise: Promise<void> | null = null;
	let finalized = false;
	let cancellationRequested = false;
	const discardWithReason = (reason: Error) => {
		if (webFsTarget !== null) {
			return webFsTarget.remove();
		}

		return abortOutputWritable(reason);
	};

	const discard = () =>
		discardWithReason(new Error('Video layer output was discarded'));

	const cancelMediabunnyOutput = async () => {
		if (output.state === 'canceled' || output.state === 'finalized') {
			return;
		}

		await output.cancel();
	};

	const cancel = (): Promise<void> => {
		if (finalized) {
			return Promise.resolve();
		}

		if (cancellationPromise !== null) {
			return cancellationPromise;
		}

		cancellationRequested = true;
		cancellationPromise = (async () => {
			const discardPromise = discardWithReason(
				new Error('Video layer output was canceled'),
			);
			let cancellationError: unknown = null;
			try {
				await cancelMediabunnyOutput();
			} catch (error) {
				cancellationError = error;
			}

			if (finalizationPromise !== null) {
				try {
					await finalizationPromise;
				} catch {
					// The finalization promise is expected to reject after cancellation.
				}
			}

			try {
				await discardPromise;
			} catch (error) {
				cancellationError ??= error;
			}

			if (cancellationError !== null) {
				throw cancellationError;
			}
		})();

		return cancellationPromise;
	};

	const finalize = (): Promise<VideoLayerOutput> => {
		if (cancellationRequested) {
			return Promise.reject(new Error('Video layer output was canceled'));
		}

		if (finalizationPromise !== null) {
			return finalizationPromise;
		}

		finalizationPromise = (async () => {
			try {
				await output.finalize();
				if (cancellationRequested) {
					throw new Error('Video layer output was canceled');
				}

				const mimeType = await output.getMimeType();
				if (cancellationRequested) {
					throw new Error('Video layer output was canceled');
				}

				await closeOutputWritable();
				if (cancellationRequested) {
					throw new Error('Video layer output was canceled');
				}

				finalized = true;

				if (outputMode === 'writable') {
					return {
						dispose: () => Promise.resolve(),
						getBlob: () =>
							Promise.reject(
								new Error(
									'getBlob() is unavailable when outputWritable is used',
								),
							),
					};
				}

				if (outputMode === 'web-fs') {
					if (webFsTarget === null) {
						throw new Error('Expected an OPFS-backed output target');
					}

					let blobPromise: Promise<Blob> | null = null;

					return {
						dispose: discard,
						getBlob: () => {
							blobPromise ??= (async () => {
								const file = await webFsTarget.getBlob();
								const buffer = await file.arrayBuffer();
								return new Blob([buffer], {type: mimeType});
							})();

							return blobPromise;
						},
					};
				}

				if (!(target instanceof BufferTarget)) {
					throw new Error('Expected an in-memory output target');
				}

				return {
					dispose: () => Promise.resolve(),
					getBlob: () => {
						if (target.buffer === null) {
							return Promise.reject(new Error('The resulting buffer is empty'));
						}

						return Promise.resolve(new Blob([target.buffer], {type: mimeType}));
					},
				};
			} catch (error) {
				await Promise.allSettled([cancelMediabunnyOutput(), discard()]);
				throw error;
			}
		})();

		return finalizationPromise;
	};

	return {output, finalize, cancel, discard};
};
