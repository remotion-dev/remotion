import React, {useState} from 'react';
import type {VisualControlValue} from '../../visual-controls/VisualControls';
import {ZodSwitch} from '../RenderModal/SchemaEditor/ZodSwitch';
import {useLocalState} from '../RenderModal/SchemaEditor/local-state';
import {useZodIfPossible} from '../get-zod-if-possible';

const container: React.CSSProperties = {
	marginBottom: 10,
};

export const VisualControlHandle: React.FC<{
	readonly value: VisualControlValue;
	readonly keyName: string;
}> = ({value, keyName}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const [unsavedValue, setUnsavedValue] = useState(value.valueInCode);

	const {localValue, RevisionContextProvider, onChange} = useLocalState({
		schema: value.schema,
		setValue: setUnsavedValue,
		unsavedValue,
		savedValue: value.valueInCode,
	});

	return (
		<div style={container}>
			<RevisionContextProvider>
				<ZodSwitch
					mayPad={false}
					schema={value.schema}
					showSaveButton
					saving={false}
					saveDisabledByParent
					onSave={() => undefined}
					jsonPath={[keyName]}
					value={localValue.value}
					defaultValue={value.valueInCode}
					setValue={onChange}
					onRemove={() => undefined}
				/>
			</RevisionContextProvider>
		</div>
	);
};
