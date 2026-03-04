import {createContext, useContext, useEffect, useRef, useState} from 'react';

// Nonces keep track of the order of compositions.
// It's a counter that goes up and sequences and compositions get a nonce
// to keep track of the orders.

// On fast refresh, we reset the counter and all compositions and
// sequences have to re-register.

export type TNonceContext = {
	getNonce: () => number;
};

export const NonceContext = createContext<TNonceContext>({
	getNonce: () => 0,
});

let fastRefreshNonce = 0;

declare const __webpack_module__: {
	hot: {
		addStatusHandler(callback: (status: string) => void): void;
	};
};

if (typeof __webpack_module__ !== 'undefined') {
	if (__webpack_module__.hot) {
		__webpack_module__.hot.addStatusHandler((status) => {
			if (status === 'idle') {
				fastRefreshNonce++;
			}
		});
	}
}

export const useNonce = (): number => {
	const context = useContext(NonceContext);
	const [nonce, setNonce] = useState(() => context.getNonce());
	const lastContext = useRef<TNonceContext | null>(context);

	// Only if context changes, but not initially
	useEffect(() => {
		if (lastContext.current === context) {
			return;
		}

		lastContext.current = context;

		setNonce(context.getNonce);
	}, [context]);

	console.log('fastRefreshNonce', fastRefreshNonce);
	return nonce;
};
