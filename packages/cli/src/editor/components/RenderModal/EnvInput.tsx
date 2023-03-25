import React, {useCallback} from 'react';
import {Spacing} from '../layout';
import {RemotionInput} from '../NewComposition/RemInput';
import {InlineRemoveButton} from './InlineRemoveButton';
import {optionRow} from './layout';

const input: React.CSSProperties = {
	flex: 1,
	width: '100%',
};

export const EnvInput: React.FC<{
	onEnvKeyChange: (index: number, newValue: string) => void;
	onEnvValChange: (index: number, newValue: string) => void;
	envKey: string;
	envVal: string;
	onDelete: (index: number) => void;
	index: number;
}> = ({onEnvKeyChange, onEnvValChange, envKey, envVal, onDelete, index}) => {
	const handleDelete = useCallback(() => {
		onDelete(index);
	}, [index, onDelete]);

	const handleKeyChange: React.ChangeEventHandler = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onEnvKeyChange(index, e.target.value);
		},
		[index, onEnvKeyChange]
	);

	const handleValueChange: React.ChangeEventHandler = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onEnvValChange(index, e.target.value);
		},
		[index, onEnvValChange]
	);

	return (
		<div style={optionRow}>
			<RemotionInput
				status={'ok'}
				type="text"
				style={input}
				value={envKey}
				onChange={handleKeyChange}
			/>
			<Spacing x={1} />
			<RemotionInput
				status={'ok'}
				type="text"
				style={input}
				value={envVal}
				onChange={handleValueChange}
			/>
			<Spacing x={2} />
			<InlineRemoveButton onClick={handleDelete} />
		</div>
	);
};
