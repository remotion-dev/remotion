import React from 'react';
import type {z} from 'zod';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {Spacing} from '../../layout';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {InfoBubble} from '../InfoBubble';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import {Fieldset} from './Fieldset';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const stackTrace: React.CSSProperties = {
	padding: 10,
};

const stackTraceLabel: React.CSSProperties = {
	fontSize: 14,
};

const legend: React.CSSProperties = {
	display: 'flex',
};

export const ZodEffectEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	setValue: UpdaterFunction<unknown>;
	compact: boolean;
	defaultValue: unknown;
	onSave: UpdaterFunction<unknown>;
	showSaveButton: boolean;
	onRemove: null | (() => void);
	saving: boolean;
}> = ({
	schema,
	jsonPath,
	value,
	setValue: updateValue,
	compact,
	defaultValue,
	onSave,
	onRemove,
	showSaveButton,
	saving,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const {localValue, onChange} = useLocalState({
		value,
		schema,
		setValue: updateValue,
	});

	const def = schema._def;
	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodEffects) {
		throw new Error('expected effect');
	}

	return (
		<Fieldset shouldPad={false} success={localValue.zodValidation.success}>
			<div style={fullWidth}>
				<ZodSwitch
					value={value}
					setValue={onChange}
					jsonPath={jsonPath}
					schema={def.schema}
					compact={compact}
					defaultValue={defaultValue}
					onSave={onSave}
					showSaveButton={showSaveButton}
					onRemove={onRemove}
					saving={saving}
					saveDisabledByParent={!localValue.zodValidation.success}
				/>
			</div>
			{!localValue.zodValidation.success && (
				<legend style={legend}>
					<ValidationMessage
						align="flex-start"
						message={localValue.zodValidation.error.format()._errors[0]}
						type="error"
					/>
					<Spacing x={0.5} />
					<InfoBubble title="Zod validation failure">
						<div style={stackTrace}>
							<div style={stackTraceLabel}>Zod Validation has failed:</div>
							{localValue.zodValidation.error.errors.map((error, index) => (
								// eslint-disable-next-line react/no-array-index-key
								<div key={index} style={stackTraceLabel}>
									Type: {error.code} <br />
									Message: {error.message}
								</div>
							))}
						</div>
					</InfoBubble>
					<Spacing x={0.5} />
				</legend>
			)}
		</Fieldset>
	);
};
