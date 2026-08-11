import type {
	ComponentPropsWithRef,
	ComponentType,
	ExoticComponent,
} from 'react';
import React, {useMemo, useRef} from 'react';
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
}): LazyExoticComponent<ComponentType<Props>> | ComponentType<Props> => {
	// Why a ref + stable wrapper instead of returning compProps.component directly?
	//
	// When a user edits their component and saves, React Fast Refresh re-executes
	// the module, giving compProps.component a new function reference.
	// Previously, this new reference flowed into useMemo (which depended on
	// compProps.component), producing a new `lazy` value. Composition.tsx then
	// rendered `<Comp />` where Comp had a different identity, so React unmounted
	// the old tree and mounted a fresh one — losing all component state.
	//
	// To fix this, we store the latest component in a ref (updated every render)
	// and return a stable Wrapper from useMemo (created once). React sees the same
	// Wrapper component across Fast Refresh updates, preserves the tree and state,
	// while the ref ensures the Wrapper always delegates to the latest code.
	//
	// To reproduce: use packages/example/src/NewVideo.tsx, edit Component
	// (e.g. change volume={1} to volume={2}) and save. Without this fix,
	// Component would fully remount instead of fast-refreshing in place.
	const componentRef = useRef<ComponentType<Props> | null>(null);

	if ('component' in compProps) {
		componentRef.current = compProps.component as ComponentType<Props>;
	}

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

			const Wrapper = (props: Props) => {
				const Comp = componentRef.current!;
				return React.createElement(
					Comp as React.ComponentType<{}>,
					props as {},
				);
			};

			return Wrapper as ComponentType<Props>;
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
		// For the 'component' case, we intentionally do NOT depend on
		// compProps.component — the stable wrapper reads from componentRef instead.

		// @ts-expect-error
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [compProps.lazyComponent]);
	return lazy;
};
