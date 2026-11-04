import type {
	ComponentPropsWithRef,
	ComponentType,
	ExoticComponent,
} from 'react';
import React, {useEffect, useLayoutEffect, useMemo} from 'react';
import type {CompProps} from './Composition.js';
import {createRegistryStore, type RegistryStore} from './registry-store.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;

type LazyExoticComponent<T extends ComponentType<any>> = ExoticComponent<
	ComponentPropsWithRef<T>
> & {
	readonly _result: T;
};

const createComponentWrapper = <Props>(
	componentStore: RegistryStore<ComponentType<Props> | null>,
): ComponentType<Props> => {
	const Wrapper = (props: Props) => {
		const Comp = useSyncExternalStore(
			componentStore.subscribe,
			componentStore.getSnapshot,
			componentStore.getSnapshot,
		)!;
		return React.createElement(Comp as React.ComponentType<{}>, props as {});
	};

	return Wrapper;
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
	// Why a store + stable wrapper instead of returning compProps.component directly?
	//
	// When a user edits their component and saves, React Fast Refresh re-executes
	// the module, giving compProps.component a new function reference.
	// Previously, this new reference flowed into useMemo (which depended on
	// compProps.component), producing a new `lazy` value. Composition.tsx then
	// rendered `<Comp />` where Comp had a different identity, so React unmounted
	// the old tree and mounted a fresh one — losing all component state.
	//
	// A stable Wrapper preserves the tree across Fast Refresh updates. Publish its
	// implementation on commit so an abandoned render cannot change the component
	// exposed by an already registered composition. The subscription updates mounted
	// wrappers even when the registration's component identity stays the same.
	//
	// To reproduce: use packages/example/src/NewVideo.tsx, edit Component
	// (e.g. change volume={1} to volume={2}) and save. Without this fix,
	// Component would fully remount instead of fast-refreshing in place.
	const componentFromProps =
		'component' in compProps
			? (compProps.component as ComponentType<Props> | undefined)
			: null;
	if (
		componentFromProps === undefined &&
		typeof document !== 'undefined' &&
		!noSuspense
	) {
		throw new Error(
			`A value of \`undefined\` was passed to the \`component\` prop. Check the value you are passing to the <${componentName}/> component.`,
		);
	}

	const lazyComponentFromProps =
		'lazyComponent' in compProps ? compProps.lazyComponent : null;
	const componentStore = useMemo(
		() =>
			createRegistryStore<ComponentType<Props> | null>(
				componentFromProps ?? null,
			),
		// A new lazy loader replaces the wrapper too. Component edits only update
		// the existing store on commit, preserving the wrapper identity.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[lazyComponentFromProps],
	);
	useIsomorphicLayoutEffect(() => {
		if (componentFromProps !== null && componentFromProps !== undefined) {
			componentStore.setSnapshot(() => componentFromProps);
		}
	}, [componentFromProps, componentStore]);
	// Passing a bound factory keeps its closure separate from the render, including
	// after minification. The wrapper must only retain the store, not initial props.
	const createWrapper = createComponentWrapper<Props>;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const Wrapper = useMemo(createWrapper.bind(null, componentStore), [
		componentStore,
	]);

	const lazy = useMemo(() => {
		if ('component' in compProps) {
			return Wrapper;
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
		// compProps.component — the stable wrapper subscribes to componentStore instead.

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lazyComponentFromProps, componentStore, Wrapper]);

	// Read the current component on every render when bypassing the wrapper.
	if (
		'component' in compProps &&
		(typeof document === 'undefined' || noSuspense)
	) {
		return compProps.component as ComponentType<Props>;
	}

	return lazy;
};
