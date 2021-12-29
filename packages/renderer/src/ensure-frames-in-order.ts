import {FrameRange} from 'remotion';

type Waiter = {
	id: string;
	forFrame: number;
	resolve: () => void;
};

export const ensureFramesInOrder = (frameRange: FrameRange | null) => {
	let lastFrame = 0;
	let frameToStitch =
		typeof frameRange === 'number'
			? frameRange
			: frameRange === null
			? 0
			: frameRange[0];

	let waiters: Waiter[] = [];

	const resolveWaiters = () => {
		for (const waiter of waiters.slice(0)) {
			if (frameToStitch === waiter.forFrame) {
				waiter.resolve();
				waiters = waiters.filter((w) => w.id !== waiter.id);
			}
		}
	};

	const waitForRightTimeOfFrameToBeInserted = async (frameToBe: number) => {
		lastFrame = Math.max(frameToBe, lastFrame);
		return new Promise<void>((resolve) => {
			waiters.push({
				id: String(Math.random()),
				forFrame: lastFrame,
				resolve,
			});
			resolveWaiters();
		});
	};

	const setFrameToStitch = (f: number) => {
		frameToStitch = f;
		resolveWaiters();
	};

	const waitForFinish = async () => {
		await waitForRightTimeOfFrameToBeInserted(lastFrame + 1);
	};

	return {
		waitForRightTimeOfFrameToBeInserted,
		setFrameToStitch,
		waitForFinish,
	};
};
