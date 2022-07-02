import type {
	ComponentPropsWithRef,
	ComponentType,
	ExoticComponent} from 'react';
import React, {
	useMemo,
} from 'react';
import type {CompProps} from './internals';

type LazyExoticComponent<T extends ComponentType<any>> = ExoticComponent<
	ComponentPropsWithRef<T>
> & {
	readonly _result: T;
};

// Expected, it can be any component props
export const useLazyComponent = <T>(
	compProps: CompProps<T>
): LazyExoticComponent<ComponentType<T>> => {
	const lazy = useMemo(() => {
		if ('lazyComponent' in compProps) {
			return React.lazy(
				compProps.lazyComponent as () => Promise<{
					default: ComponentType<T>;
				}>
			);
		}

		if ('component' in compProps) {
			// In SSR, suspense is not yet supported, we cannot use React.lazy
			if (typeof document === 'undefined') {
				return compProps.component as unknown as React.LazyExoticComponent<
					ComponentType<T>
				>;
			}

			return React.lazy(() =>
				Promise.resolve({default: compProps.component as ComponentType<T>})
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
