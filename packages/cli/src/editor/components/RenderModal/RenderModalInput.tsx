import React from 'react';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {label, optionRow, rightRow} from './layout';

type Props = {
	existence: boolean;
	inputStyle: React.CSSProperties;
	outName: string;
	onValueChange: React.ChangeEventHandler<HTMLInputElement>;
	validationMessage: string | null;
};

// eslint-disable-next-line react/function-component-definition
export function RenderModalInput({
	existence,
	inputStyle,
	outName,
	onValueChange,
	validationMessage,
}: Props) {
	return (
		<div style={optionRow}>
			<div style={{flexDirection: 'column'}}>
				<div style={label}>Output name</div>
				{/**
				 *
				// TODO improve this
				*/}
				{validationMessage || existence ? (
					<div style={{height: '25px'}} />
				) : null}
			</div>

			<div style={rightRow}>
				<div>
					<RemotionInput
						status={validationMessage ? 'error' : existence ? 'warning' : 'ok'}
						style={inputStyle}
						type="text"
						value={outName}
						onChange={onValueChange}
					/>
					{validationMessage ? (
						<ValidationMessage
							align="flex-end"
							message={validationMessage}
							type={'error'}
						/>
					) : existence ? (
						<ValidationMessage
							align="flex-end"
							message="Will be overwritten"
							type={'warning'}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
}
