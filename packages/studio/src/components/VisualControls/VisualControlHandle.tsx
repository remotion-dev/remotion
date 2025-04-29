import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {
	SetVisualControlsContext,
	VisualControlsContext,
	type VisualControlValue,
} from '../../visual-controls/VisualControls';
import {getVisualControlEditedValue} from '../../visual-controls/get-current-edited-value';
import {showNotification} from '../Notifications/NotificationCenter';
import type {UpdaterFunction} from '../RenderModal/SchemaEditor/ZodSwitch';
import {ZodSwitch} from '../RenderModal/SchemaEditor/ZodSwitch';
import {useLocalState} from '../RenderModal/SchemaEditor/local-state';
import {applyVisualControlChange} from '../RenderQueue/actions';
import {useZodIfPossible} from '../get-zod-if-possible';
import {Spacing} from '../layout';
import {ClickableFileName} from './ClickableFileName';
import {useOriginalFileName} from './get-original-stack-trace';

export const VisualControlHandle: React.FC<{
	readonly value: VisualControlValue;
	readonly keyName: string;
}> = ({value, keyName}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const state = useContext(VisualControlsContext);
	const {updateValue} = useContext(SetVisualControlsContext);
	const {fastRefreshes} = useContext(Internals.NonceContext);

	const currentValue = getVisualControlEditedValue({
		handles: state.handles,
		key: keyName,
	});

	const originalFileName = useOriginalFileName(value.stack);

	const {localValue, RevisionContextProvider, onChange} = useLocalState({
		schema: value.schema,
		setValue: (updater) => updateValue(keyName, updater(currentValue)),
		unsavedValue: currentValue,
		savedValue: value.valueInCode,
	});

	const disableSave =
		window.remotion_isReadOnlyStudio ||
		originalFileName === null ||
		originalFileName.source === null;

	const onSave: UpdaterFunction<unknown> = useCallback(
		(updater) => {
			if (disableSave) {
				return;
			}

			const val = updater(value.valueInCode);

			window.remotion_ignoreFastRefreshUpdate = fastRefreshes + 1;
			applyVisualControlChange({
				fileName: originalFileName.source as string,
				changes: [
					{
						id: keyName,
						newValueSerialized: JSON.stringify(val),
					},
				],
			}).catch((e) => {
				showNotification(`Could not save visual control: ${e.message}`, 3000);
			});
		},
		[fastRefreshes, keyName, value.valueInCode, originalFileName, disableSave],
	);

	return (
		<>
			<ClickableFileName originalFileName={originalFileName} />
			<Spacing block y={0.5} />
			<RevisionContextProvider>
				<ZodSwitch
					mayPad
					schema={value.schema}
					showSaveButton={!disableSave}
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
		</>
	);
};
