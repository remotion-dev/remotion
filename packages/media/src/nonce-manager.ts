export type Nonce = {
	isStale: () => boolean;
};

export type NonceManager = ReturnType<typeof makeNonceManager>;

export const makeNonceManager = () => {
	let nonce = 0;

	const getCurrentNonce = () => {
		const currentNonce = nonce;
		return {
			isStale: () => nonce !== currentNonce,
		};
	};

	return {
		createAsyncOperation: () => {
			nonce++;
			return getCurrentNonce();
		},
		getCurrentNonce,
	};
};
