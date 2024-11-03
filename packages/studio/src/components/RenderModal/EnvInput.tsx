import React, {useCallback} from 'react';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {Row, Spacing} from '../layout';
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
	readonly onEnvKeyChange: (index: number, newValue: string) => void;
	readonly onEnvValChange: (index: number, newValue: string) => void;
	readonly envKey: string;
	readonly envVal: string;
	readonly onDelete: (index: number) => void;
	readonly index: number;
	readonly autoFocus: boolean;
	readonly isDuplicate: boolean;
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
	const [initialWarningKeyMissing, setKeyWarningEligible] = React.useState(
		() => {
			return envKey.trim() === '' && envVal.trim() !== '';
		},
	);
	const [initialWarningValMissing, setValueWarningEligible] = React.useState(
		() => {
			return envKey.trim() !== '' && envVal.trim() === '';
		},
	);

	const isKeyMissing =
		envKey.trim() === '' && initialWarningKeyMissing && envVal.trim() !== '';
	const isValMissing =
		envVal.trim() === '' && initialWarningValMissing && envKey.trim() !== '';

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
		[index, onEnvKeyChange],
	);

	const handleValueChange: React.ChangeEventHandler = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onEnvValChange(index, e.target.value);
		},
		[index, onEnvValChange],
	);

	const makeKeyWarningEligible = useCallback(() => {
		setKeyWarningEligible(true);
	}, []);

	const makeValueWarningEligible = useCallback(() => {
		setValueWarningEligible(true);
	}, []);

	const isNodeEnvKey = envKey.trim() === 'NODE_ENV';

	return (
		<>
			<Row align="center" style={optionRow}>
				<RemotionInput
					status={
						isNodeEnvKey || isDuplicate || isKeyMissing ? 'warning' : 'ok'
					}
					type="text"
					placeholder="Key"
					style={input}
					value={envKey}
					onBlur={makeKeyWarningEligible}
					autoFocus={autoFocus}
					onChange={handleKeyChange}
					rightAlign={false}
				/>
				<Spacing x={1} />
				<RemotionInput
					status={isValMissing ? 'warning' : 'ok'}
					placeholder="Value"
					type={showInPlainText ? 'text' : 'password'}
					style={input}
					value={envVal}
					onBlur={makeValueWarningEligible}
					onChange={handleValueChange}
					rightAlign={false}
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
			{isKeyMissing ? (
				<div style={validationStyle}>
					<ValidationMessage
						align="flex-start"
						type="warning"
						message="Key is missing."
					/>
				</div>
			) : null}
			{isValMissing ? (
				<div style={validationStyle}>
					<ValidationMessage
						align="flex-start"
						type="warning"
						message="Value is missing."
					/>
				</div>
			) : null}
		</>
	);
};
