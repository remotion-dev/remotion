import type {Page} from './browser/BrowserPage';
import type {
	RemotionRawFrame as CdpRemotionRawFrame,
	RemotionFramePoolBackend,
} from './browser/devtools-types';
import {isTargetClosedErr} from './browser/flaky-errors';
import type {LogLevel} from './log-level';
import {Log} from './logger';

const encoderPadding = 64;
const slotsPerPage = 1;

// Escape hatch for testing a specific backend, for example the file backend on
// a host that also has POSIX shared memory. Unset means "auto".
export const getPreferredRemotionSharedMemoryBackend = ():
	| 'auto'
	| RemotionFramePoolBackend => {
	const value = process.env.REMOTION_SHARED_MEMORY_BACKEND;
	if (value === 'posix-shm' || value === 'file') {
		return value;
	}

	return 'auto';
};

type FramePool = {
	page: Page;
	poolId: number;
	sharedMemoryName: string;
	backend: RemotionFramePoolBackend;
	slotCount: number;
	slotCapacity: number;
	availableSlots: number[];
	waiters: Array<() => void>;
	drainWaiters: Array<() => void>;
	ownedSlots: Map<number, string>;
	forgotten: boolean;
	poolLifetime: ManagedRemotionSharedMemoryPoolLifetime;
};

export type RemotionSharedMemoryPoolLifetime = {
	isRetired: () => boolean;
	waitForRetirement: () => Promise<void>;
	onRetired: (listener: () => Promise<void>) => (() => void) | null;
};

type ManagedRemotionSharedMemoryPoolLifetime =
	RemotionSharedMemoryPoolLifetime & {
		retire: () => Promise<void>;
	};

export type RemotionRawFrame = CdpRemotionRawFrame & {
	type: 'remotion-shared-memory';
	poolId: number;
	sharedMemoryName: string;
	backend: RemotionFramePoolBackend;
	slotCount: number;
	slotCapacity: number;
	poolLifetime: RemotionSharedMemoryPoolLifetime;
	release: () => Promise<void>;
};

export type CapturedFrame = Buffer | RemotionRawFrame;

const isExpectedCapabilityError = (error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	return (
		message.includes("'Page.remotionCreateFramePool' wasn't found") ||
		message.includes('Method not found') ||
		message.includes('Raw frames require') ||
		message.includes('Raw frames are only supported') ||
		message.includes('Could not create Remotion shared memory') ||
		message.includes('Could not size Remotion shared memory') ||
		message.includes('Could not map Remotion shared memory') ||
		message.includes('Invalid Remotion frame pool dimensions')
	);
};

export class RemotionSharedMemoryCapture {
	#pools = new Map<Page, FramePool>();
	#nextPoolId = 1;
	#nextFrameId = 1;
	#supported: boolean | null = null;
	#initialization: Promise<void> | null = null;
	readonly #options: {
		width: number;
		height: number;
		indent: boolean;
		logLevel: LogLevel;
		// Private per-render directory for file-backed pools, or null when the
		// FFmpeg binary cannot open them (then only POSIX shared memory is tried).
		backingDirectory: string | null;
	};

	constructor(options: {
		width: number;
		height: number;
		indent: boolean;
		logLevel: LogLevel;
		backingDirectory: string | null;
	}) {
		this.#options = options;
	}

	isSupported() {
		return this.#supported === true;
	}

	async initializePages(pages: Page[]) {
		if (this.#initialization) {
			await this.#initialization;
			if (this.#supported) {
				for (const page of pages) {
					await this.ensurePage(page);
				}
			}

			return;
		}

		this.#initialization = (async () => {
			try {
				for (const page of pages) {
					await this.#createPool(page);
				}

				this.#supported = true;
			} catch (error) {
				await this.#destroyPools();
				if (!isExpectedCapabilityError(error)) {
					throw error;
				}

				this.#supported = false;
				Log.verbose(
					{indent: this.#options.indent, logLevel: this.#options.logLevel},
					`Remotion shared-memory capture is unavailable. Falling back to encoded screenshots. Reason: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		})();

		await this.#initialization;
	}

	async ensurePage(page: Page) {
		if (this.#pools.has(page) || this.#supported === false) {
			return;
		}

		if (this.#supported === null) {
			await this.initializePages([page]);
			return;
		}

		await this.#createPool(page);
	}

	async acquire(page: Page) {
		if (!this.#supported) {
			return null;
		}

		const pool = this.#pools.get(page);
		if (!pool) {
			throw new Error('No Remotion shared-memory pool exists for this page.');
		}

		while (pool.availableSlots.length === 0) {
			if (pool.forgotten) {
				throw new Error('The page owning this shared-memory pool was closed.');
			}

			await new Promise<void>((resolve) => pool.waiters.push(resolve));
		}

		const slot = pool.availableSlots.shift();
		if (slot === undefined) {
			throw new Error('Expected an available Remotion shared-memory slot.');
		}

		if (!Number.isSafeInteger(this.#nextFrameId)) {
			throw new Error(
				'Remotion shared-memory frame ID exceeded the safe range.',
			);
		}

		const frameId = String(this.#nextFrameId++);
		pool.ownedSlots.set(slot, frameId);
		let published = false;
		let releasePromise: Promise<void> | null = null;
		const releasePublished = () => {
			releasePromise ??= (async () => {
				try {
					await page._client().send('Page.remotionReleaseFrame', {
						slot,
						frameId,
					});
				} catch (error) {
					if (!isTargetClosedErr(error as Error)) {
						throw error;
					}
				} finally {
					this.#returnSlot(pool, slot, frameId);
				}
			})();
			return releasePromise;
		};

		return {
			slot,
			frameId,
			fail: () => {
				if (!published) {
					this.#returnSlot(pool, slot, frameId);
				}
			},
			discardPublished: async () => {
				published = true;
				await releasePublished();
			},
			publish: async (
				metadata: CdpRemotionRawFrame,
			): Promise<RemotionRawFrame> => {
				published = true;
				if (
					metadata.slot !== slot ||
					metadata.frameId !== frameId ||
					metadata.width !== this.#options.width ||
					metadata.height !== this.#options.height ||
					metadata.stride < metadata.width * 4 ||
					metadata.byteLength > pool.slotCapacity - encoderPadding ||
					metadata.pixelFormat !== 'bgra' ||
					metadata.colorSpace !== 'srgb'
				) {
					await releasePublished();
					throw new Error(
						`Chromium returned invalid Remotion shared-memory metadata: ${JSON.stringify(metadata)}`,
					);
				}

				return {
					...metadata,
					type: 'remotion-shared-memory',
					poolId: pool.poolId,
					sharedMemoryName: pool.sharedMemoryName,
					backend: pool.backend,
					slotCount: pool.slotCount,
					slotCapacity: pool.slotCapacity,
					poolLifetime: pool.poolLifetime,
					release: releasePublished,
				};
			},
		};
	}

	async destroy() {
		await this.#destroyPools();
	}

	async forgetPage(page: Page) {
		await this.#forgetPage(page, false);
	}

	async forgetAllPages() {
		await Promise.all(
			[...this.#pools.keys()].map((page) => this.#forgetPage(page, false)),
		);
	}

	async dispose() {
		await Promise.all(
			[...this.#pools.keys()].map((page) => this.#forgetPage(page, true)),
		);

		this.#supported = false;
	}

	async #forgetPage(page: Page, bestEffort: boolean) {
		const pool = this.#pools.get(page);
		if (!pool) {
			return;
		}

		this.#pools.delete(page);
		pool.forgotten = true;
		pool.waiters.splice(0).forEach((waiter) => waiter());

		let cleanupError: unknown = null;
		try {
			await pool.poolLifetime.retire();
		} catch (error) {
			cleanupError = error;
		}

		if (pool.ownedSlots.size > 0) {
			await new Promise<void>((resolve) => pool.drainWaiters.push(resolve));
		}

		try {
			await page._client().send('Page.remotionDestroyFramePool');
		} catch (error) {
			if (!bestEffort && !isTargetClosedErr(error as Error) && !cleanupError) {
				cleanupError = error;
			}
		}

		if (cleanupError && !bestEffort) {
			throw cleanupError;
		}
	}

	async #createPool(page: Page) {
		if (this.#pools.has(page)) {
			return;
		}

		const slotCapacity =
			this.#options.width * this.#options.height * 4 + encoderPadding;
		if (!Number.isSafeInteger(slotCapacity)) {
			throw new Error(
				'Remotion shared-memory frame pool size is not a safe integer.',
			);
		}

		const preferredBackend = getPreferredRemotionSharedMemoryBackend();
		const {backingDirectory} = this.#options;
		if (preferredBackend === 'file' && backingDirectory === null) {
			throw new Error(
				'REMOTION_SHARED_MEMORY_BACKEND=file requires an FFmpeg binary that supports file-backed pools (-pool_dir).',
			);
		}

		const {value} = await page._client().send('Page.remotionCreateFramePool', {
			slotCount: slotsPerPage,
			slotCapacity,
			...(backingDirectory === null ? {} : {backingDirectory}),
			...(preferredBackend === 'auto' ? {} : {preferredBackend}),
		});
		// Chromium builds before v3 of the patch only know POSIX shared memory and
		// omit the backend field.
		const backend = value.backend ?? 'posix-shm';
		if (
			!value.sharedMemoryName ||
			value.slotCount !== slotsPerPage ||
			value.slotCapacity !== slotCapacity ||
			(backend !== 'posix-shm' && backend !== 'file') ||
			(backend === 'posix-shm' &&
				!/^\/rmshm-[A-Za-z0-9._-]+$/.test(value.sharedMemoryName)) ||
			(backend === 'file' &&
				(backingDirectory === null ||
					!value.sharedMemoryName.startsWith(`${backingDirectory}/rmshm-`)))
		) {
			throw new Error(
				`Chromium returned invalid Remotion frame pool metadata: ${JSON.stringify(value)}`,
			);
		}

		if (this.#pools.size === 0) {
			Log.verbose(
				{indent: this.#options.indent, logLevel: this.#options.logLevel},
				`Remotion shared-memory capture uses the ${backend === 'file' ? `file backend in ${backingDirectory}` : 'POSIX shared-memory backend'}.`,
			);
		}

		let retired = false;
		let retirement: Promise<void> | null = null;
		let notifyRetirement!: () => void;
		const retirementSignal = new Promise<void>((resolve) => {
			notifyRetirement = resolve;
		});
		const retirementListeners = new Set<() => Promise<void>>();
		const poolLifetime: ManagedRemotionSharedMemoryPoolLifetime = {
			isRetired: () => retired,
			waitForRetirement: () => retirementSignal,
			onRetired: (listener) => {
				if (retired) {
					return null;
				}

				retirementListeners.add(listener);
				return () => retirementListeners.delete(listener);
			},
			retire: () => {
				if (!retirement) {
					retired = true;
					notifyRetirement();
					retirement = (async () => {
						await Promise.all(
							[...retirementListeners].map((listener) => listener()),
						);
					})();
				}

				return retirement;
			},
		};

		this.#pools.set(page, {
			page,
			poolId: this.#nextPoolId++,
			sharedMemoryName: value.sharedMemoryName,
			backend,
			slotCount: value.slotCount,
			slotCapacity: value.slotCapacity,
			availableSlots: Array.from(
				{length: value.slotCount},
				(_, index) => index,
			),
			waiters: [],
			drainWaiters: [],
			ownedSlots: new Map(),
			forgotten: false,
			poolLifetime,
		});
	}

	#returnSlot(pool: FramePool, slot: number, frameId: string) {
		if (pool.ownedSlots.get(slot) !== frameId) {
			throw new Error(
				`Remotion shared-memory slot ${pool.poolId}:${slot} is not owned by frame ${frameId}.`,
			);
		}

		pool.ownedSlots.delete(slot);
		if (pool.forgotten) {
			if (pool.ownedSlots.size === 0) {
				pool.drainWaiters.splice(0).forEach((waiter) => waiter());
			}
		} else {
			pool.availableSlots.push(slot);
			pool.waiters.shift()?.();
		}
	}

	async #destroyPools() {
		for (const pool of this.#pools.values()) {
			if (pool.ownedSlots.size > 0) {
				throw new Error(
					`Cannot destroy Remotion shared-memory pool ${pool.poolId} while it owns ${pool.ownedSlots.size} frame(s).`,
				);
			}

			try {
				await pool.page._client().send('Page.remotionDestroyFramePool');
			} catch (error) {
				if (!isTargetClosedErr(error as Error)) {
					throw error;
				}
			}
		}

		this.#pools.clear();
	}
}

export const isRemotionRawFrame = (
	frame: CapturedFrame,
): frame is RemotionRawFrame => !Buffer.isBuffer(frame);
