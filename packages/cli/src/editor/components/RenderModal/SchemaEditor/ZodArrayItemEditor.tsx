import {useCallback, useMemo} from 'react';
import {Spacing} from '../../layout';
import {InlineRemoveButton} from '../InlineRemoveButton';
import type {JSONPath} from './zod-types';
import {ZodSwitch} from './ZodSwitch';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	width: '100%',
	alignItems: 'center',
};

const flex: React.CSSProperties = {
	flex: 1,
};

export const ZodArrayItemEditor: React.FC<{
	jsonPath: JSONPath;
	onChange: (
		updater: (oldV: unknown[]) => unknown[],
		incrementRevision: boolean
	) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	def: any;
	index: number;
	value: unknown;
	compact: boolean;
	defaultValue: unknown;
	onSave: (updater: (oldState: unknown[]) => unknown[]) => void;
	showSaveButton: boolean;
}> = ({
	def,
	onChange,
	jsonPath,
	index,
	value,
	compact,
	defaultValue,
	onSave,
	showSaveButton,
}) => {
	const onRemove = useCallback(() => {
		onChange(
			(oldV) => [...oldV.slice(0, index), ...oldV.slice(index + 1)],
			true
		);
	}, [index, onChange]);

	const setValue = useCallback(
		(val: ((newV: unknown) => unknown) | unknown) => {
			onChange(
				(oldV) => [
					...oldV.slice(0, index),
					typeof val === 'function' ? val(oldV[index]) : val,
					...oldV.slice(index + 1),
				],
				false
			);
		},
		[index, onChange]
	);

	const newJsonPath = useMemo(() => [...jsonPath, index], [index, jsonPath]);

	return (
		<div style={row}>
			<InlineRemoveButton onClick={onRemove} />
			<Spacing x={1} />
			<div style={flex}>
				<ZodSwitch
					jsonPath={newJsonPath}
					schema={def.type}
					value={value}
					setValue={setValue}
					compact={compact}
					defaultValue={defaultValue}
					onSave={onSave as (oldState: unknown) => unknown}
					showSaveButton={showSaveButton}
				/>
			</div>
		</div>
	);
};
