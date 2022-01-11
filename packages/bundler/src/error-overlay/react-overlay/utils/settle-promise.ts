export const settle = (
	val: Array<Promise<unknown>> | Promise<unknown>
): Promise<unknown> => {
	if (!Array.isArray(val)) val = [val];
	return Promise.all(
		val.map((p) =>
			p
				.then((value) => ({
					isFulfilled: true,
					isRejected: false,
					value,
				}))
				.catch((reason) => ({
					isFulfilled: false,
					isRejected: true,
					reason,
				}))
		)
	);
};
