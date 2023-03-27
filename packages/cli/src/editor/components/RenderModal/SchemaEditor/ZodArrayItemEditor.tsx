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
	child: unknown;
	compact: boolean;
}> = ({def, onChange, jsonPath, index, child, compact}) => {
	const onRemove = useCallback(() => {
		onChange(
			(oldV) => [...oldV.slice(0, index), ...oldV.slice(index + 1)],
			true
		);
	}, [index, onChange]);

	const setValue = useCallback(
		(value: ((newV: unknown) => unknown) | unknown) => {
			onChange(
				(oldV) => [
					...oldV.slice(0, index),
					typeof value === 'function' ? value(oldV[index]) : value,
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
					value={child}
					setValue={setValue}
					compact={compact}
				/>
			</div>
		</div>
	);
};
