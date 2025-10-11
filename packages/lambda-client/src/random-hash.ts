const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

export const randomHashImplementation = (): string => {
	return new Array(10)
		.fill(1)
		.map(() => {
			return alphabet[Math.floor(Math.random() * alphabet.length)];
		})
		.join('');
};
