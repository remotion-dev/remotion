import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import type {VisualControlHook} from '../../visual-controls/VisualControls';
import {
	SetVisualControlsContext,
	VisualControlsContext,
	type VisualControlValue,
} from '../../visual-controls/VisualControls';
import {getVisualControlEditedValue} from '../../visual-controls/get-current-edited-value';
import type {UpdaterFunction} from '../RenderModal/SchemaEditor/ZodSwitch';
import {ZodSwitch} from '../RenderModal/SchemaEditor/ZodSwitch';
import {useLocalState} from '../RenderModal/SchemaEditor/local-state';
import {applyVisualControlChange} from '../RenderQueue/actions';
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
	const {fastRefreshes} = useContext(Internals.NonceContext);

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

	const onSave: UpdaterFunction<unknown> = useCallback(
		(updater) => {
			const val = updater(value.valueInCode);
			window.remotion_ignoreFastRefreshUpdate = fastRefreshes + 1;
			applyVisualControlChange({
				fileName: 'src/VisualControls/index.tsx',
				changes: [
					{
						id: keyName,
						newValueSerialized: JSON.stringify(val),
					},
				],
			});
		},
		[fastRefreshes, keyName, value.valueInCode],
	);

	return (
		<div style={container}>
			<RevisionContextProvider>
				<ZodSwitch
					mayPad
					schema={value.schema}
					showSaveButton
					saving={false}
					saveDisabledByParent={false}
					onSave={onSave}
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
