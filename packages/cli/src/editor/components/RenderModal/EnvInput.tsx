import React, {useCallback} from 'react';
import {Spacing} from '../layout';
import {RemotionInput} from '../NewComposition/RemInput';
import {InlineEyeButton} from './InlineEyeIcon';
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
	autoFocus: boolean;
}> = ({
	onEnvKeyChange,
	onEnvValChange,
	envKey,
	envVal,
	onDelete,
	index,
	autoFocus,
}) => {
	const [showInPlainText, setShowInPlainText] = React.useState(false);

	const handleDelete = useCallback(() => {
		onDelete(index);
	}, [index, onDelete]);

	const togglePlainText = useCallback(() => {
		setShowInPlainText((prev) => !prev);
	}, []);

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

	// TODO: Does align well
	return (
		<div style={optionRow}>
			<RemotionInput
				status="ok"
				type="text"
				placeholder="Key"
				style={input}
				value={envKey}
				autoFocus={autoFocus}
				onChange={handleKeyChange}
			/>
			<Spacing x={1} />
			<RemotionInput
				status="ok"
				placeholder="Value"
				type={showInPlainText ? 'text' : 'password'}
				style={input}
				value={envVal}
				onChange={handleValueChange}
			/>
			<Spacing x={1.5} />
			<InlineEyeButton enabled={!showInPlainText} onClick={togglePlainText} />
			<Spacing x={1.5} />
			<InlineRemoveButton onClick={handleDelete} />
		</div>
	);
};
