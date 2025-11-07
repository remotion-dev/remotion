import type {WrappedAudioBuffer} from 'mediabunny';

export type AllowWait = {
	type: 'allow-wait';
	waitCallback: () => () => void;
};

export const allowWaitRoutine = async (
	next: Promise<IteratorResult<WrappedAudioBuffer, void>>,
	waitFn: AllowWait,
) => {
	const result = await Promise.race([
		next,
		new Promise<void>((resolve) => {
			Promise.resolve().then(() => resolve());
		}),
	]);

	if (!result) {
		const unblock = waitFn.waitCallback();
		const newRes = await next;
		unblock();

		return newRes;
	}

	return result;
};
