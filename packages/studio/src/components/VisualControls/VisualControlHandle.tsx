import React, {useCallback, useContext, useEffect, useState} from 'react';
import {NoReactInternals} from 'remotion/no-react';
import {FastRefreshContext} from '../../fast-refresh-context';
import {getVisualControlEditedValue} from '../../visual-controls/get-current-edited-value';
import {
	SetVisualControlsContext,
	VisualControlsContext,
	type VisualControlValue,
} from '../../visual-controls/VisualControls';
import {useZodIfPossible, useZodTypesIfPossible} from '../get-zod-if-possible';
import {Spacing} from '../layout';
import {showNotification} from '../Notifications/NotificationCenter';
import {extractEnumJsonPaths} from '../RenderModal/SchemaEditor/extract-enum-json-paths';
import type {UpdaterFunction} from '../RenderModal/SchemaEditor/ZodSwitch';
import {ZodSwitch} from '../RenderModal/SchemaEditor/ZodSwitch';
import {applyVisualControlChange} from '../RenderQueue/actions';
import {useOriginalFileName} from './get-original-stack-trace';
import {VisualControlHandleHeader} from './VisualControlHandleHeader';

export const VisualControlHandle: React.FC<{
	readonly value: VisualControlValue;
	readonly keyName: string;
}> = ({value, keyName}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const state = useContext(VisualControlsContext);
	const {updateValue} = useContext(SetVisualControlsContext);
	const {fastRefreshes, increaseManualRefreshes} =
		useContext(FastRefreshContext);

	const [_saving, setSaving] = useState(false);

	const currentValue = getVisualControlEditedValue({
		handles: state.handles,
		key: keyName,
	});

	const originalFileName = useOriginalFileName(value.stack);

	const disableSave =
		window.remotion_isReadOnlyStudio || originalFileName.type !== 'loaded';

	const saveToFile = useCallback(
		(updater: (old: unknown) => unknown) => {
			if (disableSave) {
				return;
			}

			if (originalFileName.type !== 'loaded') {
				throw new Error('Original file name is not loaded');
			}

			const val = updater(value.valueInCode);

			window.remotion_ignoreFastRefreshUpdate = fastRefreshes + 1;
			const enumPaths = extractEnumJsonPaths({
				schema: value.schema,
				zodRuntime: z,
				currentPath: [],
				zodTypes,
			});

			setSaving(true);

			Promise.resolve()
				.then(() => {
					return applyVisualControlChange({
						fileName: originalFileName.originalFileName.source as string,
						changes: [
							{
								id: keyName,
								newValueSerialized:
									val === undefined
										? ''
										: NoReactInternals.serializeJSONWithSpecialTypes({
												data: val as Record<string, unknown>,
												indent: 2,
												staticBase: window.remotion_staticBase,
											}).serializedString,
								newValueIsUndefined: val === undefined,
								enumPaths,
							},
						],
					});
				})
				.catch((e) => {
					showNotification(`Could not save visual control: ${e.message}`, 3000);
				});
		},
		[
			disableSave,
			value.valueInCode,
			value.schema,
			fastRefreshes,
			z,
			originalFileName,
			keyName,
			zodTypes,
		],
	);

	useEffect(() => {
		setSaving(false);
	}, [fastRefreshes]);

	const setValue: UpdaterFunction<unknown> = useCallback(
		(updater, {shouldSave}) => {
			updateValue(keyName, updater(currentValue));
			increaseManualRefreshes();
			if (shouldSave) {
				saveToFile(updater);
			}
		},
		[currentValue, increaseManualRefreshes, keyName, saveToFile, updateValue],
	);

	return (
		<>
			<VisualControlHandleHeader originalFileName={originalFileName} />
			<Spacing block y={0.5} />
			<ZodSwitch
				mayPad
				schema={value.schema}
				jsonPath={[keyName]}
				value={currentValue}
				setValue={setValue}
				onRemove={null}
			/>
		</>
	);
};
