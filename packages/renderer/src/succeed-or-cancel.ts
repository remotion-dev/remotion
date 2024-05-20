import {type CancelSignal} from './make-cancel-signal';

export const succeedOrCancel = <T>({
	happyPath,
	cancelSignal,
	cancelMessage,
}: {
	happyPath: Promise<T>;
	cancelSignal: CancelSignal | undefined;
	cancelMessage: string;
}): Promise<T> => {
	if (!cancelSignal) {
		return happyPath;
	}

	let resolveCancel: (val: T) => void = () => undefined;

	const cancelProm = new Promise<T>((_resolve, reject) => {
		cancelSignal?.(() => {
			resolveCancel = _resolve;
			reject(new Error(cancelMessage));
		});
	});

	return Promise.race([
		happyPath.then((result) => {
			process.nextTick(() => resolveCancel?.(undefined as unknown as T));
			return result;
		}),
		cancelProm,
	]);
};
