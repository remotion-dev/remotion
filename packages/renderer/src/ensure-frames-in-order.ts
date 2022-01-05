type Waiter = {
	id: string;
	forFrame: number;
	resolve: () => void;
};

export const ensureFramesInOrder = (frameRange: [number, number]) => {
	let [frameToStitch, finalFrame] = frameRange;

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
		return new Promise<void>((resolve) => {
			waiters.push({
				id: String(Math.random()),
				forFrame: frameToBe,
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
		await waitForRightTimeOfFrameToBeInserted(finalFrame + 1);
	};

	return {
		waitForRightTimeOfFrameToBeInserted,
		setFrameToStitch,
		waitForFinish,
	};
};
