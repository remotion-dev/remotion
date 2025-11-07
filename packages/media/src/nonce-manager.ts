export type Nonce = {
	isStale: () => boolean;
};

export type NonceManager = ReturnType<typeof makeNonceManager>;

export const makeNonceManager = () => {
	let nonce = 0;

	const createAsyncOperation = () => {
		nonce++;
		const currentNonce = nonce;
		return {
			isStale: () => nonce !== currentNonce,
		};
	};

	return {
		createAsyncOperation,
	};
};
