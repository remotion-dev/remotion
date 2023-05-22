import React, {useCallback, useMemo, useRef} from 'react';
import type {z} from 'zod';
import {Button} from '../../../../preview-server/error-overlay/remotion-overlay/Button';
import {
	FAIL_COLOR,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../../../helpers/colors';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Spacing} from '../../layout';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {optionRow} from '../layout';
import {createZodValues} from './create-zod-values';
import {useLocalState} from './local-state';
import {SchemaFieldsetLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import {ZodArrayItemEditor} from './ZodArrayItemEditor';
import type {UpdaterFunction} from './ZodSwitch';

const container: React.CSSProperties = {
	width: '100%',
};

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodArrayEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown[];
	defaultValue: unknown[];
	setValue: UpdaterFunction<unknown[]>;
	onSave: UpdaterFunction<unknown[]>;
	compact: boolean;
	showSaveButton: boolean;
	onRemove: null | (() => void);
	saving: boolean;
}> = ({
	schema,
	jsonPath,
	compact,
	setValue,
	defaultValue,
	value,
	onSave,
	showSaveButton,
	onRemove,
	saving,
}) => {
	const {localValue, onChange} = useLocalState({
		value,
		schema,
		setValue,
	});

	const stateRef = useRef(localValue);
	stateRef.current = localValue;

	const def = schema._def as z.ZodArrayDef;

	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodArray) {
		throw new Error('expected object');
	}

	const isRoot = jsonPath.length === 0;
	const Element = isRoot ? 'div' : 'fieldset';

	const {paddingTop} = optionRow;

	const fieldset: React.CSSProperties = useMemo(() => {
		return {
			borderRadius: 4,
			borderColor: localValue.zodValidation.success
				? INPUT_BORDER_COLOR_UNHOVERED
				: FAIL_COLOR,
		};
	}, [localValue.zodValidation.success]);

	const style = useMemo((): React.CSSProperties | undefined => {
		if (isRoot) {
			return undefined;
		}

		return {paddingTop};
	}, [isRoot, paddingTop]);

	const onAdd = useCallback(() => {
		onChange((oldV) => {
			return [...oldV, createZodValues(def.type, z, zodTypes)];
		}, false);
	}, [def.type, onChange, z, zodTypes]);

	const reset = useCallback(() => {
		onChange(() => defaultValue, true);
	}, [defaultValue, onChange]);

	const isDefaultValue = useMemo(() => {
		return deepEqual(localValue.value, defaultValue);
	}, [defaultValue, localValue]);

	return (
		<div style={style}>
			<div style={fullWidth}>
				<Element style={fieldset}>
					{isRoot ? null : (
						<SchemaFieldsetLabel
							onReset={reset}
							isDefaultValue={isDefaultValue}
							jsonPath={jsonPath}
							onRemove={onRemove}
						/>
					)}
					<div style={isRoot ? undefined : container}>
						{localValue.value.map((child, i) => {
							return (
								<ZodArrayItemEditor
									// eslint-disable-next-line react/no-array-index-key
									key={`${i}${localValue.revision}`}
									onChange={onChange}
									value={child}
									def={def}
									index={i}
									jsonPath={jsonPath}
									compact={compact}
									defaultValue={defaultValue[i] ?? child}
									onSave={onSave}
									showSaveButton={showSaveButton}
									saving={saving}
								/>
							);
						})}
					</div>
					{!localValue.zodValidation.success && (
						<>
							<Spacing x={1} />
							<ValidationMessage
								align="flex-start"
								message={localValue.zodValidation.error.format()._errors[0]}
								type="error"
							/>
						</>
					)}
					<Spacing y={1} block />
					<Button onClick={onAdd}>+ Add item</Button>
				</Element>
			</div>
		</div>
	);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepEqual(a: any, b: any): boolean {
	if (a === b) {
		return true;
	}

	if (
		typeof a !== 'object' ||
		a === null ||
		typeof b !== 'object' ||
		b === null
	) {
		return false;
	}

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) {
		return false;
	}

	for (const key of keysA) {
		if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
			return false;
		}
	}

	return true;
}
