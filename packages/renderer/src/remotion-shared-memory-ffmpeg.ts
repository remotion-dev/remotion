import {createInterface} from 'node:readline';
import type {Readable, Writable} from 'node:stream';
import type {
	RemotionRawFrame,
	RemotionSharedMemoryPoolLifetime,
} from './remotion-shared-memory';
import {writeWithBackpressure} from './write-with-backpressure';

type RegisteredPool = {
	poolId: number;
	sharedMemoryName: string;
	poolLifetime: RemotionSharedMemoryPoolLifetime;
	registered: boolean;
	registrationStarted: boolean;
	registrationSettled: boolean;
	registration: Promise<boolean>;
	resolveRegistration: (registered: boolean) => void;
	retired: boolean;
	pendingCount: number;
	drainWaiters: Array<() => void>;
	unregistering: Promise<void> | null;
	unsubscribe: (() => void) | null;
};

type PendingFrame = {
	frame: RemotionRawFrame;
	pool: RegisteredPool;
	resolve: () => void;
	reject: (error: Error) => void;
};

const pendingKey = (poolId: number, slot: number) => `${poolId}:${slot}`;

// The optional sixth field names the backend. It is omitted for POSIX shared
// memory so FFmpeg binaries that predate file-backed pools keep working.
export const serializeRemotionSharedMemoryPool = (frame: RemotionRawFrame) =>
	`P\t${frame.poolId}\t${frame.sharedMemoryName}\t${frame.slotCount}\t${frame.slotCapacity}${frame.backend === 'file' ? '\tfile' : ''}\n`;

export const serializeRemotionSharedMemoryFrame = ({
	frame,
	pts,
}: {
	frame: RemotionRawFrame;
	pts: number;
}) =>
	`F\t${frame.poolId}\t${frame.slot}\t${frame.frameId}\t${frame.width}\t${frame.height}\t${frame.stride}\t${frame.byteLength}\t${pts}\n`;

export const serializeRemotionSharedMemoryPoolRetirement = (poolId: number) =>
	`U\t${poolId}\n`;

export const parseRemotionSharedMemoryAck = (line: string) => {
	const match = /^(\d+)\t(\d+)\t(\d+)$/.exec(line);
	if (!match) {
		throw new Error(`Invalid Remotion shared-memory ACK: ${line}`);
	}

	const poolId = Number(match[1]);
	const slot = Number(match[2]);
	if (
		!Number.isSafeInteger(poolId) ||
		poolId < 1 ||
		!Number.isSafeInteger(slot) ||
		slot < 0
	) {
		throw new Error(`Invalid Remotion shared-memory ACK: ${line}`);
	}

	return {poolId, slot, frameId: match[3]};
};

export const createRemotionSharedMemoryFfmpegBridge = ({
	control,
	acknowledgements,
}: {
	control: Writable;
	acknowledgements: Readable;
}) => {
	const registeredPools = new Map<number, RegisteredPool>();
	const pending = new Map<string, PendingFrame>();
	let fatalError: Error | null = null;
	let finishing = false;
	let controlEnded = false;
	let controlWrites = Promise.resolve();
	let finishPromise: Promise<void> | null = null;

	const toError = (error: unknown) =>
		error instanceof Error ? error : new Error(String(error));

	const releaseIgnoringErrors = async (frame: RemotionRawFrame) => {
		try {
			await frame.release();
		} catch {
			// The original bridge error is more useful. release() still abandons the
			// local slot in a finally block if the CDP session is unavailable.
		}
	};

	const settleRegistration = (pool: RegisteredPool, registered: boolean) => {
		if (pool.registrationSettled) {
			return;
		}

		pool.registrationSettled = true;
		pool.registered = registered;
		pool.resolveRegistration(registered);
	};

	const signalPoolDrained = (pool: RegisteredPool) => {
		if (pool.pendingCount === 0) {
			pool.drainWaiters.splice(0).forEach((waiter) => waiter());
		}
	};

	const removePending = (key: string, value: PendingFrame) => {
		if (pending.get(key) !== value) {
			return false;
		}

		pending.delete(key);
		value.pool.pendingCount--;
		signalPoolDrained(value.pool);
		return true;
	};

	const fail = (error: Error) => {
		if (fatalError) {
			return;
		}

		fatalError = error;
		for (const pool of registeredPools.values()) {
			settleRegistration(pool, false);
		}

		for (const [key, value] of [...pending.entries()]) {
			if (removePending(key, value)) {
				value.reject(error);
				releaseIgnoringErrors(value.frame).catch(() => undefined);
			}
		}
	};

	const enqueueControlWrite = (data: string) => {
		if (finishing || controlEnded) {
			return Promise.reject(
				new Error('FFmpeg shared-memory input has already been finished.'),
			);
		}

		const operation = controlWrites.then(async () => {
			if (fatalError) {
				throw fatalError;
			}

			await writeWithBackpressure({
				data: Buffer.from(data),
				writable: control,
			});
		});
		controlWrites = operation;
		return operation;
	};

	const unregisterPool = (pool: RegisteredPool) => {
		pool.retired = true;
		if (pool.unregistering) {
			return pool.unregistering;
		}

		pool.unregistering = (async () => {
			try {
				const wasRegistered = await pool.registration;
				if (!wasRegistered || fatalError || finishing || controlEnded) {
					return;
				}

				if (pool.pendingCount > 0) {
					await new Promise<void>((resolve) => pool.drainWaiters.push(resolve));
				}

				if (fatalError || finishing || controlEnded) {
					return;
				}

				try {
					await enqueueControlWrite(
						serializeRemotionSharedMemoryPoolRetirement(pool.poolId),
					);
				} catch (error) {
					const normalizedError = toError(error);
					fail(normalizedError);
					throw normalizedError;
				}
			} finally {
				pool.unsubscribe?.();
				pool.unsubscribe = null;
				if (registeredPools.get(pool.poolId) === pool) {
					registeredPools.delete(pool.poolId);
				}
			}
		})();
		return pool.unregistering;
	};

	const createRegisteredPool = (frame: RemotionRawFrame) => {
		let resolveRegistration!: (registered: boolean) => void;
		const registration = new Promise<boolean>((resolve) => {
			resolveRegistration = resolve;
		});
		const pool: RegisteredPool = {
			poolId: frame.poolId,
			sharedMemoryName: frame.sharedMemoryName,
			poolLifetime: frame.poolLifetime,
			registered: false,
			registrationStarted: false,
			registrationSettled: false,
			registration,
			resolveRegistration,
			retired: false,
			pendingCount: 0,
			drainWaiters: [],
			unregistering: null,
			unsubscribe: null,
		};
		const unsubscribe = frame.poolLifetime.onRetired(() =>
			unregisterPool(pool),
		);
		if (!unsubscribe) {
			return null;
		}

		pool.unsubscribe = unsubscribe;
		registeredPools.set(frame.poolId, pool);
		return pool;
	};

	const lines = createInterface({input: acknowledgements});
	lines.on('line', (line) => {
		(async () => {
			const ack = parseRemotionSharedMemoryAck(line);
			const key = pendingKey(ack.poolId, ack.slot);
			const value = pending.get(key);
			if (!value || value.frame.frameId !== ack.frameId) {
				throw new Error(
					`Unexpected Remotion shared-memory ACK for ${ack.poolId}:${ack.slot}:${ack.frameId}.`,
				);
			}

			try {
				await value.frame.release();
			} catch (error) {
				const normalizedError = toError(error);
				if (removePending(key, value)) {
					value.reject(normalizedError);
					fail(normalizedError);
				}

				return;
			}

			if (removePending(key, value)) {
				value.resolve();
			}
		})().catch((error) => fail(toError(error)));
	});
	lines.on('error', (error) => fail(toError(error)));
	lines.on('close', () => {
		if (pending.size > 0 || !finishing) {
			fail(
				new Error(
					`FFmpeg closed its Remotion shared-memory ACK pipe${pending.size > 0 ? ` with ${pending.size} frame(s) pending` : ' before input finished'}.`,
				),
			);
		}
	});
	acknowledgements.on('error', (error) => fail(toError(error)));
	acknowledgements.on('close', () => {
		if (pending.size > 0 || !finishing) {
			fail(
				new Error(
					`FFmpeg closed its Remotion shared-memory ACK pipe${pending.size > 0 ? ` with ${pending.size} frame(s) pending` : ' before input finished'}.`,
				),
			);
		}
	});
	control.on('error', (error) => fail(toError(error)));

	return {
		writeFrame: async ({
			frame,
			pts,
		}: {
			frame: RemotionRawFrame;
			pts: number;
		}) => {
			if (fatalError) {
				await releaseIgnoringErrors(frame);
				throw fatalError;
			}

			if (finishing || controlEnded || frame.poolLifetime.isRetired()) {
				await releaseIgnoringErrors(frame);
				throw new Error(
					`Target closed: Remotion shared-memory pool ${frame.poolId} has already been retired.`,
				);
			}

			let pool = registeredPools.get(frame.poolId);
			if (!pool) {
				const createdPool = createRegisteredPool(frame);
				if (!createdPool) {
					await releaseIgnoringErrors(frame);
					throw new Error(
						`Target closed: Remotion shared-memory pool ${frame.poolId} has already been retired.`,
					);
				}

				pool = createdPool;
			} else if (
				pool.sharedMemoryName !== frame.sharedMemoryName ||
				pool.poolLifetime !== frame.poolLifetime
			) {
				const error = new Error(
					`Remotion shared-memory pool ${frame.poolId} changed its identity.`,
				);
				await releaseIgnoringErrors(frame);
				fail(error);
				throw error;
			}

			if (pool.retired || frame.poolLifetime.isRetired()) {
				await releaseIgnoringErrors(frame);
				throw new Error(
					`Target closed: Remotion shared-memory pool ${frame.poolId} has already been retired.`,
				);
			}

			const key = pendingKey(frame.poolId, frame.slot);
			if (pending.has(key)) {
				const error = new Error(
					`Remotion shared-memory slot ${frame.poolId}:${frame.slot} was reused before its ACK.`,
				);
				await releaseIgnoringErrors(frame);
				fail(error);
				throw error;
			}

			let resolveAck!: () => void;
			let rejectAck!: (error: Error) => void;
			const ack = new Promise<void>((resolve, reject) => {
				resolveAck = resolve;
				rejectAck = reject;
			});
			ack.catch(() => undefined);
			const pendingFrame: PendingFrame = {
				frame,
				pool,
				resolve: resolveAck,
				reject: rejectAck,
			};
			pending.set(key, pendingFrame);
			pool.pendingCount++;

			const registersPool = !pool.registrationStarted;
			if (registersPool) {
				pool.registrationStarted = true;
			}

			const operation = enqueueControlWrite(
				(registersPool ? serializeRemotionSharedMemoryPool(frame) : '') +
					serializeRemotionSharedMemoryFrame({frame, pts}),
			);
			if (registersPool) {
				operation.then(
					() => settleRegistration(pool, true),
					() => settleRegistration(pool, false),
				);
			}

			try {
				await operation;
			} catch (error) {
				const normalizedError = toError(error);
				fail(normalizedError);
				throw normalizedError;
			}

			return {waitForAck: ack};
		},
		finish: () => {
			if (finishPromise) {
				return finishPromise;
			}

			finishing = true;
			finishPromise = (async () => {
				try {
					await controlWrites;
					if (fatalError) {
						throw fatalError;
					}

					await new Promise<void>((resolve, reject) => {
						control.end((error?: Error | null) => {
							if (error) {
								reject(error);
							} else {
								resolve();
							}
						});
					});
					controlEnded = true;
				} catch (error) {
					const normalizedError = toError(error);
					fail(normalizedError);
					throw normalizedError;
				}
			})();
			return finishPromise;
		},
		fail,
	};
};
