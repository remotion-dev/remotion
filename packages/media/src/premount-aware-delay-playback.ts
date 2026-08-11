import type {useBufferState} from 'remotion';
import type {DelayPlaybackIfNotPremounting} from './delay-playback-if-not-premounting';

type TrackedDelayHandle = {
	arm: () => void;
	disarm: () => void;
	dispose: () => void;
};

export class PremountAwareDelayPlayback {
	private isPremounting: boolean;
	private isPostmounting: boolean;
	private readonly activeHandles = new Set<TrackedDelayHandle>();
	private readonly delayPlayback: ReturnType<
		typeof useBufferState
	>['delayPlayback'];

	constructor({
		bufferState,
		isPremounting,
		isPostmounting,
	}: {
		bufferState: ReturnType<typeof useBufferState>;
		isPremounting: boolean;
		isPostmounting: boolean;
	}) {
		this.delayPlayback = bufferState.delayPlayback;
		this.isPremounting = isPremounting;
		this.isPostmounting = isPostmounting;
	}

	private shouldDelayPlayback(): boolean {
		return !this.isPremounting && !this.isPostmounting;
	}

	private syncHandles(): void {
		for (const handle of this.activeHandles) {
			if (this.shouldDelayPlayback()) {
				handle.arm();
			} else {
				handle.disarm();
			}
		}
	}

	public setIsPremounting(isPremounting: boolean): void {
		this.isPremounting = isPremounting;
		this.syncHandles();
	}

	public setIsPostmounting(isPostmounting: boolean): void {
		this.isPostmounting = isPostmounting;
		this.syncHandles();
	}

	public createHandle(): DelayPlaybackIfNotPremounting {
		let armed = false;
		let unblock: (() => void) | null = null;
		let disposed = false;

		const arm = () => {
			if (armed || disposed) {
				return;
			}

			unblock = this.delayPlayback().unblock;
			armed = true;
		};

		const disarm = () => {
			if (!armed) {
				return;
			}

			unblock?.();
			unblock = null;
			armed = false;
		};

		const entry: TrackedDelayHandle = {
			arm,
			disarm,
			dispose: () => {},
		};

		entry.dispose = () => {
			if (disposed) {
				return;
			}

			disposed = true;
			disarm();
			this.activeHandles.delete(entry);
		};

		this.activeHandles.add(entry);

		if (this.shouldDelayPlayback()) {
			arm();
		}

		return {
			unblock: entry.dispose,
			[Symbol.dispose]: entry.dispose,
		};
	}
}
