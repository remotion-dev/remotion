import React, {forwardRef, useContext, useMemo, useState} from 'react';
import type {
	JsxComponentIdentity,
	SequenceControls,
} from './CompositionManager.js';
import {deleteNestedKey} from './delete-nested-key.js';
import {getPropStatusesCtx} from './effects/use-memoized-effects.js';
import {
	flattenActiveSchema,
	getFlatSchemaWithAllKeys,
} from './flatten-schema.js';
import {
	extendSchemaWithSequenceName,
	type InteractivitySchema,
} from './interactivity-schema.js';
import {OverrideIdsToNodePathsGettersContext} from './sequence-node-path.js';
import {
	VisualModeDragOverridesContext,
	VisualModePropStatusesContext,
} from './SequenceManager.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {computeEffectiveSchemaValuesDotNotation} from './use-schema.js';

export const getNestedValue = (
	obj: Record<string, unknown>,
	key: string,
): unknown => {
	const parts = key.split('.');
	let current: unknown = obj;
	for (const part of parts) {
		if (
			current === null ||
			current === undefined ||
			typeof current !== 'object'
		)
			return undefined;
		current = (current as Record<string, unknown>)[part];
	}

	return current;
};

export const getRuntimeValueForSchemaKey = ({
	flatSchema,
	key,
	props,
}: {
	flatSchema: InteractivitySchema;
	key: string;
	props: Record<string, unknown>;
}): unknown => {
	const value = getNestedValue(props, key);

	if (flatSchema[key]?.type === 'text-content' && typeof value !== 'string') {
		return undefined;
	}

	return value;
};

export const readValuesFromProps = (
	props: Record<string, unknown>,
	keys: string[],
	flatSchema?: InteractivitySchema,
): Record<string, unknown> => {
	const out: Record<string, unknown> = {};
	for (const key of keys) {
		out[key] = flatSchema
			? getRuntimeValueForSchemaKey({flatSchema, key, props})
			: getNestedValue(props, key);
	}

	return out;
};

export const selectActiveKeys = (
	schema: InteractivitySchema,
	values: Record<string, unknown>,
): string[] => {
	return Object.keys(flattenActiveSchema(schema, (key) => values[key]));
};

export const mergeValues = ({
	flatSchema,
	props,
	valuesDotNotation,
	schemaKeys,
	propsToDelete,
}: {
	flatSchema: InteractivitySchema;
	props: Record<string, unknown>;
	valuesDotNotation: Record<string, unknown>;
	schemaKeys: string[];
	propsToDelete: Set<string>;
}): Record<string, unknown> => {
	const merged = {...props};

	for (const key of schemaKeys) {
		const value = valuesDotNotation[key];
		if (flatSchema[key]?.type === 'text-content' && value === undefined) {
			continue;
		}

		const parts = key.split('.');

		if (parts.length === 1) {
			merged[key] = value;

			continue;
		}

		// For dot-notation keys like 'style.opacity',
		// clone and set the nested path
		let current = merged;
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			if (typeof current[part] === 'object' && current[part] !== null) {
				current[part] = {...(current[part] as Record<string, unknown>)};
			} else {
				current[part] = {};
			}

			current = current[part] as Record<string, unknown>;
		}

		current[parts[parts.length - 1]] = value;
	}

	const propsToDeleteWithoutTextContent = new Set(
		[...propsToDelete].filter(
			(key) =>
				!(
					flatSchema[key]?.type === 'text-content' &&
					valuesDotNotation[key] === undefined
				),
		),
	);
	deleteNestedKey(merged, propsToDeleteWithoutTextContent);

	return merged;
};

const stackToOverrideMap: Record<string, string> = {};

export const withInteractivitySchema = <
	S extends InteractivitySchema,
	Props extends object,
>({
	Component,
	componentName,
	componentIdentity,
	schema,
	supportsEffects,
}: {
	Component: React.ComponentType<
		Props & {readonly controls: SequenceControls | undefined}
	>;
	componentName: string;
	componentIdentity: JsxComponentIdentity | null;
	schema: S;
	supportsEffects: boolean;
}): React.ComponentType<Props> => {
	// Schema is static for a component, so we move this outside
	const schemaWithSequenceName = extendSchemaWithSequenceName(schema);
	const flatSchema = getFlatSchemaWithAllKeys(schemaWithSequenceName);
	const flatKeys = Object.keys(flatSchema);

	const Wrapped = forwardRef<unknown, Props>((props, ref) => {
		const env = useRemotionEnvironment();

		if (!env.isStudio || env.isReadOnlyStudio || env.isRendering) {
			return React.createElement(Component, {
				...props,
				controls: null,
				ref,
			} as Props & {
				controls: SequenceControls | undefined;
				ref: typeof ref;
			});
		}

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const {propStatuses} = useContext(VisualModePropStatusesContext);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const {getDragOverrides} = useContext(VisualModeDragOverridesContext);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const nodePathMapping = useContext(OverrideIdsToNodePathsGettersContext);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const frame = useCurrentFrame();

		// If the parent has passed `controls`, we should not override it.
		// @ts-expect-error
		if (props.controls) {
			return React.createElement(Component, {
				...props,
				ref,
			} as unknown as Props & {
				controls: SequenceControls | undefined;
				ref: typeof ref;
			});
		}

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [overrideId] = useState(() => {
			const {stack} = props as {stack?: string};
			if (!stack) {
				return String(Math.random());
			}

			const existingOverrideId = stackToOverrideMap[stack];
			if (existingOverrideId) {
				return existingOverrideId;
			}

			const newOverrideId = String(Math.random());
			stackToOverrideMap[stack] = newOverrideId;
			return newOverrideId;
		});
		const nodePath =
			nodePathMapping.overrideIdToNodePathMappings[overrideId] ?? null;

		// Read the runtime values for every flat key from the JSX props,
		// memoized on the leaf values so the object reference is stable
		// when nothing changed — otherwise downstream `useMemo`s churn and
		// effects (e.g. Sequence registration) re-fire every render.
		const runtimeValues = flatKeys.map((key) =>
			getRuntimeValueForSchemaKey({
				flatSchema,
				key,
				props: props as Record<string, unknown>,
			}),
		);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const currentRuntimeValueDotNotation = useMemo(
			() =>
				readValuesFromProps(
					props as Record<string, unknown>,
					flatKeys,
					flatSchema,
				),
			// eslint-disable-next-line react-hooks/exhaustive-deps
			runtimeValues,
		);

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const controls = useMemo((): SequenceControls => {
			return {
				schema: schemaWithSequenceName,
				currentRuntimeValueDotNotation,
				overrideId,
				supportsEffects,
				componentIdentity,
				componentName,
			};
		}, [currentRuntimeValueDotNotation, overrideId]);

		// 3. Apply drag/code overrides on top of the runtime values.
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const {merged: valuesDotNotation, propsToDelete} = useMemo(() => {
			return computeEffectiveSchemaValuesDotNotation({
				schema: schemaWithSequenceName,
				currentValue: currentRuntimeValueDotNotation,
				overrideValues: nodePath === null ? {} : getDragOverrides(nodePath),
				propStatus:
					nodePath === null
						? undefined
						: getPropStatusesCtx(propStatuses, nodePath),
				frame,
			});
		}, [
			currentRuntimeValueDotNotation,
			getDragOverrides,
			nodePath,
			propStatuses,
			frame,
		]);

		// 4. Eliminate values forbidden by the resolved discriminated union.
		const activeKeys = selectActiveKeys(
			schemaWithSequenceName,
			valuesDotNotation,
		);

		// 5. Apply the active values back onto the props.
		const mergedProps = mergeValues({
			flatSchema,
			props: props as Record<string, unknown>,
			valuesDotNotation,
			schemaKeys: activeKeys,
			propsToDelete,
		});

		return React.createElement(Component, {
			...mergedProps,
			controls,
			ref,
		} as Props & {
			controls: SequenceControls | undefined;
			ref: typeof ref;
		});
	});

	Wrapped.displayName = `withInteractivitySchema(${Component.displayName || Component.name || 'Component'})`;

	return Wrapped as unknown as React.ComponentType<Props>;
};
