import {createContext, useContext, useEffect, useState} from 'react';

// Nonces keep track of the order of compositions.
// It's a counter that goes up and seqences and compositions get a nonce
// to keep track of the orders.

// On fast refresh, we reset the counter and all compositions and
// sequences have to re-register.

export type TNonceContext = {
	getNonce: () => number;
	fastRefreshes: number;
};

export const NonceContext = createContext<TNonceContext>({
	getNonce: () => 0,
	fastRefreshes: 0,
});

export const useNonce = (): number => {
	const context = useContext(NonceContext);
	const [nonce, setNonce] = useState(() => context.getNonce());

	useEffect(() => {
		setNonce(context.getNonce);
	}, [context]);

	return nonce;
};
