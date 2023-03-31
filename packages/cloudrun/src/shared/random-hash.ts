const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const randomHash = (_options?: {randomInTests: boolean}): string => {
	return new Array(10)
		.fill(1)
		.map(() => {
			return alphabet[Math.floor(Math.random() * alphabet.length)];
		})
		.join('');
};
