import React from 'react';
import {Column, Spacing} from '../layout';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {label, optionRow, rightRow} from './layout';
import type {RenderType} from './RenderModalAdvanced';

type Props = {
	existence: boolean;
	inputStyle: React.CSSProperties;
	outName: string;
	onValueChange: React.ChangeEventHandler<HTMLInputElement>;
	validationMessage: string | null;
	renderType: RenderType;
};

export const RenderModalOutputName = ({
	existence,
	inputStyle,
	outName,
	onValueChange,
	validationMessage,
	renderType,
}: Props) => {
	return (
		<div style={optionRow}>
			<Column>
				<div style={label}>
					{renderType === 'sequence' ? 'Folder name' : 'Output name'}
				</div>
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
