import React, {useMemo} from 'react';
import {CompProps} from './internals';

// Expected, it can be any component props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useLazyComponent = (compProps: CompProps<any>) => {
	const lazy = useMemo(() => {
		if ('lazyComponent' in compProps) {
			return React.lazy(compProps.lazyComponent);
		}

		if ('component' in compProps) {
			return React.lazy(() => Promise.resolve({default: compProps.component}));
		}

		throw new Error("You must pass either 'component' or 'lazyComponent'");
		// @ts-expect-error
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [compProps.lazyComponent, compProps.component]);
	return lazy;
};
