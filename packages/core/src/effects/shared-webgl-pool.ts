import {CanvasPool} from './canvas-pool.js';

// Keep two lazy pairs, least recently used first. Reusing a matching size avoids
// reallocating drawing buffers when (for example) a thumbnail and a Player draw
// in turn. The runtime owns at most four WebGL contexts regardless of layer count.
const pools: Array<{pool: CanvasPool; width: number; height: number}> = [];
let leased = false;
const waiters: Array<() => void> = [];
const cleanups: Array<() => void> = [];
const listeners = new Set<(canvas: HTMLCanvasElement) => void>();

const release = (): void => {
	const errors: unknown[] = [];
	try {
		// Cleanup callbacks also need exclusive access. Drain them before handing
		// the canvases to the next chain, even if one callback throws.
		while (cleanups.length > 0) {
			try {
				cleanups.shift()!();
			} catch (error) {
				errors.push(error);
			}
		}
	} finally {
		const next = waiters.shift();
		if (next) {
			next();
		} else {
			leased = false;
		}
	}

	if (errors.length === 1) throw errors[0];
	if (errors.length > 1)
		throw new AggregateError(errors, 'Shared WebGL cleanup failed');
};

export const cleanupWithSharedWebGLPool = (cleanup: () => void): void => {
	cleanups.push(cleanup);
	if (!leased) {
		leased = true;
		release();
	}
};

export const subscribeToSharedWebGLContextLoss = (
	onContextLost: (canvas: HTMLCanvasElement) => void,
): (() => void) => {
	listeners.add(onContextLost);
	return () => {
		listeners.delete(onContextLost);
		// Called under a lease or from an exclusive cleanup callback. Keeping a
		// mounted chain subscribed preserves its cached GPU resources across frames.
		if (listeners.size === 0) {
			for (const entry of pools) entry.pool.dispose();
			pools.length = 0;
		}
	};
};

export const acquireSharedWebGLPool = async (
	width: number,
	height: number,
): Promise<{pool: CanvasPool; release: () => void}> => {
	await new Promise<void>((resolve) => {
		if (leased) {
			waiters.push(resolve);
		} else {
			leased = true;
			resolve();
		}
	});

	try {
		const index = pools.findIndex(
			(candidate) => candidate.width === width && candidate.height === height,
		);
		const cached = index === -1 ? null : pools.splice(index, 1)[0];
		const entry = cached ?? (pools.length === 2 ? pools.shift()! : null);
		if (entry) {
			entry.pool.resize(width, height);
			entry.width = width;
			entry.height = height;
			pools.push(entry);
			return {pool: entry.pool, release};
		}

		const pool = new CanvasPool(width, height, (canvas) => {
			const errors: unknown[] = [];
			for (const listener of [...listeners]) {
				try {
					listener(canvas);
				} catch (error) {
					errors.push(error);
				}
			}

			// Browser-evicted contexts are not restorable everywhere. Retire this
			// canvas even if the browser restores it before the next requested frame.
			// Explicit retirement removes ownership before notifying us, so it does
			// not enqueue itself again. In-flight chains retain their lease meanwhile.
			if (pool.owns(canvas)) {
				cleanupWithSharedWebGLPool(() => pool.retireWebGL(canvas));
			}

			if (errors.length === 1) throw errors[0];
			if (errors.length > 1)
				throw new AggregateError(errors, 'Shared WebGL invalidation failed');
		});
		pools.push({pool, width, height});
		return {pool, release};
	} catch (error) {
		release();
		throw error;
	}
};
