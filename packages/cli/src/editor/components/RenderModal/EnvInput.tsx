import React, {useCallback} from 'react';
import {Row, Spacing} from '../layout';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {InlineEyeButton} from './InlineEyeIcon';
import {InlineRemoveButton} from './InlineRemoveButton';
import {optionRow} from './layout';

const input: React.CSSProperties = {
	flex: 1,
	width: '100%',
};

const validationStyle = {
	paddingLeft: optionRow.paddingLeft,
	paddingRight: optionRow.paddingRight,
};

export const EnvInput: React.FC<{
	onEnvKeyChange: (index: number, newValue: string) => void;
	onEnvValChange: (index: number, newValue: string) => void;
	envKey: string;
	envVal: string;
	onDelete: (index: number) => void;
	index: number;
	autoFocus: boolean;
	isDuplicate: boolean;
}> = ({
	onEnvKeyChange,
	onEnvValChange,
	envKey,
	envVal,
	onDelete,
	index,
	autoFocus,
	isDuplicate,
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

	const isNodeEnvKey = envKey.trim() === 'NODE_ENV';

	return (
		<>
			<Row align="center" style={optionRow}>
				<RemotionInput
					status={isNodeEnvKey || isDuplicate ? 'warning' : 'ok'}
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
				<InlineRemoveButton onClick={handleDelete} />
			</Row>
			{isNodeEnvKey ? (
				<div style={validationStyle}>
					<ValidationMessage
						align="flex-start"
						type="warning"
						message="NODE_ENV will be overwritten by Remotion during the render process."
					/>
				</div>
			) : null}
			{isDuplicate ? (
				<div style={validationStyle}>
					<ValidationMessage
						align="flex-start"
						type="warning"
						message={`${envKey.toUpperCase()} is already defined.`}
					/>
				</div>
			) : null}
		</>
	);
};
