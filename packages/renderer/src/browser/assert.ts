export const assert: (value: unknown, message?: string) => asserts value = (
	value,
	message,
) => {
	if (!value) {
		throw new Error(message);
	}
};
