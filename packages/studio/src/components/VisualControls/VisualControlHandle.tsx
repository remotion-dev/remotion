import React, {useContext} from 'react';
import type {VisualControlHook} from '../../visual-controls/VisualControls';
import {
	SetVisualControlsContext,
	VisualControlsContext,
	type VisualControlValue,
} from '../../visual-controls/VisualControls';
import {getVisualControlEditedValue} from '../../visual-controls/get-current-edited-value';
import {ZodSwitch} from '../RenderModal/SchemaEditor/ZodSwitch';
import {useLocalState} from '../RenderModal/SchemaEditor/local-state';
import {useZodIfPossible} from '../get-zod-if-possible';

const container: React.CSSProperties = {
	marginBottom: 10,
};

export const VisualControlHandle: React.FC<{
	readonly value: VisualControlValue;
	readonly keyName: string;
	readonly hook: VisualControlHook;
}> = ({value, keyName, hook}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const state = useContext(VisualControlsContext);
	const {updateValue} = useContext(SetVisualControlsContext);

	const currentValue = getVisualControlEditedValue({
		handles: state.handles,
		hook,
		key: keyName,
	});

	const {localValue, RevisionContextProvider, onChange} = useLocalState({
		schema: value.schema,
		setValue: (updater) => updateValue(hook, keyName, updater(currentValue)),
		unsavedValue: currentValue,
		savedValue: value.valueInCode,
	});

	return (
		<div style={container}>
			<RevisionContextProvider>
				<ZodSwitch
					mayPad
					schema={value.schema}
					showSaveButton
					saving={false}
					saveDisabledByParent={false}
					onSave={() => undefined}
					jsonPath={[keyName]}
					value={localValue.value}
					defaultValue={value.valueInCode}
					setValue={onChange}
					onRemove={null}
				/>
			</RevisionContextProvider>
		</div>
	);
};
