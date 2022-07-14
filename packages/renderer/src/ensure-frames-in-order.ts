type Waiter = {
	id: string;
	forFrame: number;
	resolve: () => void;
};

export const ensureFramesInOrder = (
	framesToRender: number[],
	everyNthFrame: number
) => {
	let [frameToStitch] = framesToRender;
	const finalFrame = framesToRender[framesToRender.length - 1];

	let waiters: Waiter[] = [];

	const resolveWaiters = () => {
		for (const waiter of waiters.slice(0)) {
			if (frameToStitch === waiter.forFrame) {
				waiter.resolve();
				waiters = waiters.filter((w) => w.id !== waiter.id);
			}
		}
	};

	const waitForRightTimeOfFrameToBeInserted = (frameToBe: number) => {
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
		await waitForRightTimeOfFrameToBeInserted(finalFrame + everyNthFrame);
	};

	return {
		waitForRightTimeOfFrameToBeInserted,
		setFrameToStitch,
		waitForFinish,
	};
};
