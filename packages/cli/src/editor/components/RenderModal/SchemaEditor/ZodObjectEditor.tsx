import React, {useMemo} from 'react';
import {z} from 'remotion';
import {INPUT_BORDER_COLOR_UNHOVERED} from '../../../helpers/colors';
import {optionRow} from '../layout';
import {SchemaFieldsetLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
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

// TODO: First validate locally
export const ZodObjectEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	defaultValue: unknown;
	setValue: React.Dispatch<React.SetStateAction<unknown>>;
	compact: boolean;
	onSave: (
		updater: (oldVal: Record<string, unknown>) => Record<string, unknown>
	) => void;
	showSaveButton: boolean;
	onRemove: null | (() => void);
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
}) => {
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

	return (
		<div style={style}>
			<div style={fullWidth}>
				<Element style={fieldset}>
					{isRoot ? null : (
						<SchemaFieldsetLabel jsonPath={jsonPath} onRemove={onRemove} />
					)}
					<div style={isRoot ? undefined : container}>
						{keys.map((key) => {
							return (
								<ZodSwitch
									key={key}
									jsonPath={[...jsonPath, key]}
									schema={shape[key]}
									value={(value as Record<string, string>)[key]}
									// In case of null | {a: string, b: string} type, we need to fallback to the default value
									defaultValue={
										((defaultValue as Record<string, string>) ?? value)[key]
									}
									setValue={(val) => {
										setValue((oldVal: Record<string, string>) => {
											return {
												...oldVal,
												[key]:
													typeof val === 'function' ? val(oldVal[key]) : val,
											};
										});
									}}
									onSave={(val) => {
										onSave((oldVal: Record<string, unknown>) => {
											return {
												...oldVal,
												[key]:
													typeof val === 'function' ? val(oldVal[key]) : val,
											};
										});
									}}
									onRemove={null}
									compact={compact}
									showSaveButton={showSaveButton}
								/>
							);
						})}
					</div>
				</Element>
			</div>
		</div>
	);
};
