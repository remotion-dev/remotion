export const waitForPromisesToFinish = async <
	T extends readonly PromiseLike<unknown>[],
>(
	promises: T,
) => {
	try {
		return await Promise.all(promises);
	} catch (error) {
		await Promise.allSettled(promises);
		throw error;
	}
};
