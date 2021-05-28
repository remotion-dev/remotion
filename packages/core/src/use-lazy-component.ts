import React, {useMemo} from 'react';
import {LooseAnyComponent} from './any-component';
import {CompProps} from './internals';

// Expected, it can be any component props
export const useLazyComponent = <T>(
	compProps: CompProps<T>
): React.LazyExoticComponent<LooseAnyComponent<T>> => {
	const lazy = useMemo(() => {
		if ('lazyComponent' in compProps) {
			return React.lazy(
				compProps.lazyComponent as () => Promise<{
					default: LooseAnyComponent<T>;
				}>
			);
		}

		if ('component' in compProps) {
			// In SSR, suspense is not yet supported, we cannot use React.lazy
			if (typeof document === 'undefined') {
				return (compProps.component as unknown) as React.LazyExoticComponent<
					LooseAnyComponent<T>
				>;
			}

			return React.lazy(() =>
				Promise.resolve({default: compProps.component as LooseAnyComponent<T>})
			);
		}

		throw new Error("You must pass either 'component' or 'lazyComponent'");

		// Very important to leave the dependencies as they are, or instead
		// the player will remount on every frame.

		// @ts-expect-error
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [compProps.component, compProps.lazyComponent]);
	return lazy;
};
