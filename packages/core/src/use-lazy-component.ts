import type {
	ComponentPropsWithRef,
	ComponentType,
	ExoticComponent,
} from 'react';
import React, {useMemo} from 'react';
import type {CompProps} from './Composition.js';

type LazyExoticComponent<T extends ComponentType<any>> = ExoticComponent<
	ComponentPropsWithRef<T>
> & {
	readonly _result: T;
};

// Expected, it can be any component props
export const useLazyComponent = <Props>({
	compProps,
	componentName,
	noSuspense,
}: {
	compProps: CompProps<Props>;
	componentName: string;
	noSuspense: boolean;
}): LazyExoticComponent<ComponentType<Props>> => {
	const lazy = useMemo(() => {
		if ('component' in compProps) {
			// In SSR, suspense is not yet supported, we cannot use React.lazy
			if (typeof document === 'undefined' || noSuspense) {
				return compProps.component as unknown as React.LazyExoticComponent<
					ComponentType<Props>
				>;
			}

			if (typeof compProps.component === 'undefined') {
				throw new Error(
					`A value of \`undefined\` was passed to the \`component\` prop. Check the value you are passing to the <${componentName}/> component.`,
				);
			}

			return React.lazy(() =>
				Promise.resolve({default: compProps.component as ComponentType<Props>}),
			);
		}

		if (
			'lazyComponent' in compProps &&
			typeof compProps.lazyComponent !== 'undefined'
		) {
			if (typeof compProps.lazyComponent === 'undefined') {
				throw new Error(
					`A value of \`undefined\` was passed to the \`lazyComponent\` prop. Check the value you are passing to the <${componentName}/> component.`,
				);
			}

			return React.lazy(
				compProps.lazyComponent as () => Promise<{
					default: ComponentType<Props>;
				}>,
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
