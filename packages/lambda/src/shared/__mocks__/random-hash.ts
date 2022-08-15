import type {randomHash as original} from '../random-hash';

export const randomHash: typeof original = (options?: {
	randomInTests: boolean;
}) => {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

	return options?.randomInTests
		? Array(10)
				.fill(1)
				.map(() => {
					return alphabet[Math.floor(Math.random() * alphabet.length)];
				})
				.join('')
		: 'abcdef';
};
