import React, {forwardRef, useMemo} from 'react';
import type {SequenceControls} from './CompositionManager.js';
import type {
	SchemaKeysRecord,
	SequenceSchema,
} from './sequence-field-schema.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useSchema} from './use-schema.js';

const getNestedValue = (obj: Record<string, unknown>, key: string): unknown => {
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

const mergeValues = (
	props: Record<string, unknown>,
	values: Record<string, unknown>,
	schemaKeys: string[],
): Record<string, unknown> => {
	const merged = {...props};

	for (const key of schemaKeys) {
		const value = values[key];
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

	return merged;
};

export const wrapInSchema = <S extends SequenceSchema, Props extends object>(
	Component: React.ComponentType<
		Props & {readonly _experimentalControls: SequenceControls | undefined}
	>,
	schema: S,
): React.ComponentType<Props> => {
	const schemaKeys = Object.keys(schema);

	const Wrapped = forwardRef<unknown, Props>((props, ref) => {
		const env = useRemotionEnvironment();
		if (
			!env.isStudio ||
			env.isReadOnlyStudio ||
			env.isRendering ||
			!process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED
		) {
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
		const schemaInput = useMemo(
			() => {
				const input = {} as Record<string, unknown>;
				for (const key of schemaKeys) {
					input[key] = getNestedValue(props as Record<string, unknown>, key);
				}

				return input as SchemaKeysRecord<S>;
			},
			// eslint-disable-next-line react-hooks/exhaustive-deps
			schemaKeys.map((key) =>
				getNestedValue(props as Record<string, unknown>, key),
			),
		);

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const {controls, values} = useSchema(
			schema,
			schemaInput as SchemaKeysRecord<S> &
				Record<Exclude<keyof SchemaKeysRecord<S>, keyof S>, never>,
		);

		const mergedProps = mergeValues(
			props as Record<string, unknown>,
			values as Record<string, unknown>,
			schemaKeys,
		);

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
