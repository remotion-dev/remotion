import {useCallback, useMemo, useState} from 'react';
import {Plus} from '../../../icons/plus';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {InlineAction, type RenderInlineAction} from '../../InlineAction';
import {createZodValues} from './create-zod-values';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';

export const ZodArrayItemEditor: React.FC<{
	jsonPath: JSONPath;
	onChange: UpdaterFunction<unknown[]>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	def: any;
	index: number;
	value: unknown;
	defaultValue: unknown;
	onSave: UpdaterFunction<unknown[]>;
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	def,
	onChange,
	jsonPath,
	index,
	value,
	defaultValue,
	onSave: onSaveObject,
	showSaveButton,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const [hovered, setHovered] = useState(false);
	const zodTypes = useZodTypesIfPossible();
	const onRemove = useCallback(() => {
		onChange(
			(oldV) => [...oldV.slice(0, index), ...oldV.slice(index + 1)],
			false,
			true,
		);
	}, [index, onChange]);

	const onAdd = useCallback(() => {
		onChange(
			(oldV) => {
				return [
					...oldV.slice(0, index + 1),
					createZodValues(def.type, z, zodTypes),
					...oldV.slice(index + 1),
				];
			},
			false,
			true,
		);
	}, [def.type, index, onChange, z, zodTypes]);

	const setValue = useCallback(
		(val: ((newV: unknown) => unknown) | unknown) => {
			onChange(
				(oldV) => [
					...oldV.slice(0, index),
					typeof val === 'function' ? val(oldV[index]) : val,
					...oldV.slice(index + 1),
				],
				false,
				false,
			);
		},
		[index, onChange],
	);

	const newJsonPath = useMemo(() => [...jsonPath, index], [index, jsonPath]);

	const onSave = useCallback(
		(updater: (oldState: unknown) => unknown) => {
			onSaveObject(
				(oldV) => [
					...oldV.slice(0, index),
					updater(oldV[index]),
					...oldV.slice(index + 1),
				],
				false,
				false,
			);
		},
		[index, onSaveObject],
	);

	const dynamicAddButtonStyle: React.CSSProperties = useMemo(() => {
		return {
			display: 'flex',
			justifyContent: 'flex-end',
			opacity: hovered ? 1 : 0,
			marginTop: -10,
		};
	}, [hovered]);
	const renderAddButton: RenderInlineAction = useCallback((color) => {
		return <Plus color={color} style={{height: 12}} />;
	}, []);

	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<ZodSwitch
				jsonPath={newJsonPath}
				schema={def.type}
				value={value}
				setValue={setValue}
				defaultValue={defaultValue}
				onSave={onSave}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
			<div style={dynamicAddButtonStyle}>
				<InlineAction onClick={onAdd} renderAction={renderAddButton} />
			</div>
		</div>
	);
};
