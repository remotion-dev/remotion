import React from 'react';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {Column, Spacing} from '../layout';
import {label, optionRow, rightRow} from './layout';

type Props = {
	readonly existence: boolean;
	readonly inputStyle: React.CSSProperties;
	readonly outName: string;
	readonly onValueChange: React.ChangeEventHandler<HTMLInputElement>;
	readonly validationMessage: string | null;
	readonly label: string;
};

export const RenderModalOutputName = ({
	existence,
	inputStyle,
	outName,
	onValueChange,
	validationMessage,
	label: labelText,
}: Props) => {
	return (
		<div style={optionRow}>
			<Column>
				<div style={label}>{labelText}</div>
			</Column>
			<div style={rightRow}>
				<div>
					<RemotionInput
						status={validationMessage ? 'error' : existence ? 'warning' : 'ok'}
						style={inputStyle}
						type="text"
						value={outName}
						onChange={onValueChange}
						rightAlign
					/>
					{validationMessage ? (
						<>
							<Spacing y={1} block />
							<ValidationMessage
								align="flex-end"
								message={validationMessage}
								type={'error'}
							/>
						</>
					) : existence ? (
						<>
							<Spacing y={1} block />
							<ValidationMessage
								align="flex-end"
								message="Will be overwritten"
								type={'warning'}
							/>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
};
