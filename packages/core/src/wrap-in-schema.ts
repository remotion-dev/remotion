import React, {forwardRef, useContext, useMemo, useState} from 'react';
import type {SequenceControls} from './CompositionManager.js';
import {deleteNestedKey} from './delete-nested-key.js';
import {getCodeValuesCtx} from './effects/use-memoized-effects.js';
import {
	flattenActiveSchema,
	getFlatSchemaWithAllKeys,
} from './flatten-schema.js';
import type {SequenceSchema} from './sequence-field-schema.js';
import {OverrideIdsToNodePathsGettersContext} from './sequence-node-path.js';
import {
	VisualModeCodeValuesContext,
	VisualModeDragOverridesContext,
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

export const readValuesFromProps = (
	props: Record<string, unknown>,
	keys: string[],
): Record<string, unknown> => {
	const out: Record<string, unknown> = {};
	for (const key of keys) {
		out[key] = getNestedValue(props, key);
	}

	return out;
};

export const selectActiveKeys = (
	schema: SequenceSchema,
	values: Record<string, unknown>,
): string[] => {
	return Object.keys(flattenActiveSchema(schema, (key) => values[key]));
};

export const mergeValues = ({
	props,
	valuesDotNotation,
	schemaKeys,
	propsToDelete,
}: {
	props: Record<string, unknown>;
	valuesDotNotation: Record<string, unknown>;
	schemaKeys: string[];
	propsToDelete: Set<string>;
}): Record<string, unknown> => {
	const merged = {...props};

	for (const key of schemaKeys) {
		const value = valuesDotNotation[key];
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

	deleteNestedKey(merged, propsToDelete);

	return merged;
};

const stackToOverrideMap: Record<string, string> = {};

export const wrapInSchema = <S extends SequenceSchema, Props extends object>({
	Component,
	schema,
	supportsEffects,
}: {
	Component: React.ComponentType<
		Props & {readonly _experimentalControls: SequenceControls | undefined}
	>;
	schema: S | ((props: Props) => S);
	supportsEffects: boolean;
}): React.ComponentType<Props> => {
	const Wrapped = forwardRef<unknown, Props>((props, ref) => {
		const env = useRemotionEnvironment();

		if (!env.isStudio || env.isReadOnlyStudio || env.isRendering) {
			return React.createElement(Component, {
				...props,
				_experimentalControls: null,
				ref,
			} as Props & {
				_experimentalControls: SequenceControls | undefined;
				ref: typeof ref;
			});
		}

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const {codeValues} = useContext(VisualModeCodeValuesContext);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const {getDragOverrides} = useContext(VisualModeDragOverridesContext);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const nodePathMapping = useContext(OverrideIdsToNodePathsGettersContext);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const frame = useCurrentFrame();

		// If the parent has passed `_experimentalControls`, we should not override it.
		// @ts-expect-error
		if (props._experimentalControls) {
			return React.createElement(Component, {
				...props,
				ref,
			} as unknown as Props & {
				_experimentalControls: SequenceControls | undefined;
				ref: typeof ref;
			});
		}

		const resolvedSchema =
			typeof schema === 'function' ? schema(props as Props) : schema;
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const flatKeys = useMemo(
			() => Object.keys(getFlatSchemaWithAllKeys(resolvedSchema)),
			[resolvedSchema],
		);

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
		const runtimeValues = flatKeys.map((k) =>
			getNestedValue(props as Record<string, unknown>, k),
		);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const currentRuntimeValueDotNotation = useMemo(
			() => readValuesFromProps(props as Record<string, unknown>, flatKeys),
			// eslint-disable-next-line react-hooks/exhaustive-deps
			runtimeValues,
		);

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const controls = useMemo((): SequenceControls => {
			return {
				schema: resolvedSchema,
				currentRuntimeValueDotNotation,
				overrideId,
				supportsEffects,
			};
		}, [currentRuntimeValueDotNotation, overrideId, resolvedSchema]);

		// 3. Apply drag/code overrides on top of the runtime values.
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const {merged: valuesDotNotation, propsToDelete} = useMemo(() => {
			return computeEffectiveSchemaValuesDotNotation({
				schema: resolvedSchema,
				currentValue: currentRuntimeValueDotNotation,
				overrideValues: nodePath === null ? {} : getDragOverrides(nodePath),
				propStatus:
					nodePath === null
						? undefined
						: getCodeValuesCtx(codeValues, nodePath),
				frame,
			});
		}, [
			currentRuntimeValueDotNotation,
			getDragOverrides,
			nodePath,
			codeValues,
			frame,
			resolvedSchema,
		]);

		// 4. Eliminate values forbidden by the resolved discriminated union.
		const activeKeys = selectActiveKeys(resolvedSchema, valuesDotNotation);

		// 5. Apply the active values back onto the props.
		const mergedProps = mergeValues({
			props: props as Record<string, unknown>,
			valuesDotNotation,
			schemaKeys: activeKeys,
			propsToDelete,
		});

		return React.createElement(Component, {
			...mergedProps,
			_experimentalControls: controls,
			ref,
		} as Props & {
			_experimentalControls: SequenceControls | undefined;
			ref: typeof ref;
		});
	});

	Wrapped.displayName = `wrapInSchema(${Component.displayName || Component.name || 'Component'})`;

	return Wrapped as unknown as React.ComponentType<Props>;
};
