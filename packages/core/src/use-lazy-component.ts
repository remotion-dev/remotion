import React, {useMemo} from 'react';
import {CompProps} from './internals';

// Expected, it can be any component props
export const useLazyComponent = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	compProps: CompProps<any>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): React.LazyExoticComponent<React.ComponentType<any>> => {
	const lazy = useMemo(() => {
		if ('lazyComponent' in compProps) {
			return React.lazy(compProps.lazyComponent);
		}

		if ('component' in compProps) {
			// In SSR, suspense is not yet supported, we cannot use React.lazy
			if (typeof document === 'undefined') {
				return (compProps.component as unknown) as React.LazyExoticComponent<
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					React.ComponentType<any>
				>;
			}

			return React.lazy(() => Promise.resolve({default: compProps.component}));
		}

		throw new Error("You must pass either 'component' or 'lazyComponent'");
		// @ts-expect-error
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [compProps.lazyComponent, compProps.component]);
	return lazy;
};
