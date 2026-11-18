import React, {useContext, useLayoutEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';

export type MotionBlurRegistry = NonNullable<
	React.ContextType<typeof Internals.MotionBlurContext>
>['registry'];

export const useMotionBlurRegistry = (
	componentName: string,
): MotionBlurRegistry | null => {
	const parent = useContext(Internals.MotionBlurContext);
	const [registry] = useState<MotionBlurRegistry>(() => ({
		canvases: new Map(),
		nestedScopes: new Map(),
	}));
	const [nested, setNested] = useState<{
		parent: typeof parent;
		registry: MotionBlurRegistry;
	} | null>(null);

	useLayoutEffect(() => {
		if (parent === null) return;
		const scopes = parent.registry.nestedScopes.get(componentName) ?? [];
		parent.registry.nestedScopes.set(componentName, scopes);
		let scope = scopes.find(
			(candidate) => !candidate.registrations.has(parent.sampleIndex),
		);
		if (!scope) {
			scope = {
				registrations: new Set(),
				registry: {canvases: new Map(), nestedScopes: new Map()},
			};
			scopes.push(scope);
		}

		scope.registrations.add(parent.sampleIndex);
		setNested({parent, registry: scope.registry});
		const current = scope;
		return () => {
			current.registrations.delete(parent.sampleIndex);
			if (current.registrations.size === 0) {
				scopes.splice(scopes.indexOf(current), 1);
				if (scopes.length === 0) {
					parent.registry.nestedScopes.delete(componentName);
				}
			}
		};
	}, [componentName, parent]);

	return parent === null
		? registry
		: nested?.parent === parent
			? nested.registry
			: null;
};

export const MotionBlurSampleProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly sampleIndex: number;
	readonly registry: MotionBlurRegistry;
}> = ({children, sampleIndex, registry}) => {
	const parent = useContext(Internals.MotionBlurContext);
	const parentIndex = parent?.sampleIndex ?? '';
	const parentIsPrimary = parent?.isPrimarySample ?? true;
	const value = useMemo(
		() => ({
			sampleIndex: `${parentIndex}/${sampleIndex}`,
			isPrimarySample: parentIsPrimary && sampleIndex === 0,
			registry,
		}),
		[parentIndex, parentIsPrimary, sampleIndex, registry],
	);

	return (
		<Internals.DisableSequenceRegistrationProvider
			disabled={!value.isPrimarySample}
		>
			<Internals.MotionBlurContext.Provider value={value}>
				{children}
			</Internals.MotionBlurContext.Provider>
		</Internals.DisableSequenceRegistrationProvider>
	);
};
