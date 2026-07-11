export const raceWithFrameError = async <T>({
	cleanup,
	frameError,
	operation,
}: {
	cleanup: () => void;
	frameError: Promise<never>;
	operation: () => Promise<T> | T;
}): Promise<T> => {
	try {
		return await Promise.race([Promise.resolve().then(operation), frameError]);
	} catch (error) {
		cleanup();
		throw error;
	}
};
