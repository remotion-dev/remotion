import {createContext, useCallback, useContext, useMemo, useRef} from 'react';

// Nonces keep track of the order of compositions.
// It's a counter that goes up and sequences and compositions get a nonce
// to keep track of the orders.

// On fast refresh, we reset the counter and all compositions and
// sequences have to re-register.

export type TNonceContext = {
	getNonce: () => number;
};

type NonceHistoryItem = [number, number];

export type NonceHistory = NonceHistoryItem[];

export type NonceHistoryContext = {
	get: () => NonceHistory;
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

try {
	if (typeof __webpack_module__ !== 'undefined') {
		if (__webpack_module__.hot) {
			__webpack_module__.hot.addStatusHandler((status) => {
				if (status === 'idle') {
					fastRefreshNonce++;
				}
			});
		}
	}
} catch {
	// __webpack_module__ may throw ReferenceError in some environments
}

export const useNonce = (): NonceHistoryContext => {
	const context = useContext(NonceContext);
	const nonce = context.getNonce();
	const nonceRef = useRef(nonce);
	nonceRef.current = nonce;
	const history = useRef<NonceHistoryItem[]>([[fastRefreshNonce, nonce]]);

	const get = useCallback(() => {
		if (fastRefreshNonce !== history.current[history.current.length - 1][0]) {
			history.current = [
				...history.current,
				[fastRefreshNonce, nonceRef.current],
			];
		}

		return history.current;
	}, [history]);

	return useMemo(() => {
		return {get};
	}, [get]);
};
