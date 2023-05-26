import React, {useCallback, useMemo} from 'react';
import type {z} from 'zod';
import {INPUT_BORDER_COLOR_UNHOVERED} from '../../../helpers/colors';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {optionRow} from '../layout';
import {useLocalState} from './local-state';
import {SchemaFieldsetLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';

const container: React.CSSProperties = {
	width: '100%',
};

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const fieldset: React.CSSProperties = {
	borderRadius: 4,
	borderColor: INPUT_BORDER_COLOR_UNHOVERED,
};

export const ZodObjectEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: Record<string, unknown>;
	defaultValue: Record<string, unknown>;
	setValue: UpdaterFunction<Record<string, unknown>>;
	compact: boolean;
	onSave: UpdaterFunction<Record<string, unknown>>;
	showSaveButton: boolean;
	onRemove: null | (() => void);
	saving: boolean;
	saveDisabledByParent: boolean;
}> = ({
	schema,
	jsonPath,
	setValue,
	value,
	compact,
	defaultValue,
	onSave,
	showSaveButton,
	onRemove,
	saving,
	saveDisabledByParent,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const {localValue, onChange} = useLocalState({
		schema,
		setValue,
		value,
	});

	const def = schema._def;

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodObject) {
		throw new Error('expected object');
	}

	const shape = def.shape();
	const keys = Object.keys(shape);

	const isRoot = jsonPath.length === 0;
	const Element = isRoot ? 'div' : 'fieldset';

	const {paddingTop} = optionRow;

	const style = useMemo((): React.CSSProperties => {
		if (isRoot) {
			return {};
		}

		return {paddingTop};
	}, [isRoot, paddingTop]);

	const onRes = useCallback(() => {
		onChange(() => defaultValue, true);
	}, [defaultValue, onChange]);

	return (
		<div style={style}>
			<div style={fullWidth}>
				<Element style={fieldset}>
					{isRoot ? null : (
						<SchemaFieldsetLabel
							isDefaultValue
							onReset={onRes}
							jsonPath={jsonPath}
							onRemove={onRemove}
						/>
					)}
					<div style={isRoot ? undefined : container}>
						{keys.map((key) => {
							return (
								<ZodSwitch
									key={key}
									jsonPath={[...jsonPath, key]}
									schema={shape[key]}
									value={localValue.value[key]}
									// In case of null | {a: string, b: string} type, we need to fallback to the default value
									defaultValue={(defaultValue ?? value)[key]}
									setValue={(val, forceApply) => {
										setValue((oldVal) => {
											return {
												...oldVal,
												[key]:
													typeof val === 'function' ? val(oldVal[key]) : val,
											};
										}, forceApply);
									}}
									onSave={(val, forceApply) => {
										onSave((oldVal) => {
											return {
												...oldVal,
												[key]:
													typeof val === 'function' ? val(oldVal[key]) : val,
											};
										}, forceApply);
									}}
									onRemove={null}
									compact={compact}
									showSaveButton={showSaveButton}
									saving={saving}
									saveDisabledByParent={saveDisabledByParent}
								/>
							);
						})}
					</div>
				</Element>
			</div>
		</div>
	);
};
