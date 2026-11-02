import type {ChangeEventHandler, RefObject} from 'react';
import React from 'react';
import {Spacing} from '../layout';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {InputAndValidationContainer} from './InputAndValidationContainer';
import {RemotionInput} from './RemInput';
import {SlugPreview} from './SlugPreview';
import {ValidationMessage} from './ValidationMessage';

export const CompositionIdField: React.FC<{
	readonly compositionId: string;
	readonly inputRef: RefObject<HTMLInputElement | null>;
	readonly onChange: ChangeEventHandler<HTMLInputElement>;
	readonly validationMessage: string | null;
	readonly value: string;
}> = ({compositionId, inputRef, onChange, validationMessage, value}) => {
	return (
		<div style={optionRow}>
			<div style={label}>ID</div>
			<div style={rightRow}>
				<InputAndValidationContainer>
					<RemotionInput
						ref={inputRef}
						value={value}
						onChange={onChange}
						type="text"
						autoFocus
						placeholder="Composition ID"
						status="ok"
						rightAlign
					/>
					<SlugPreview
						action="create"
						currentName={null}
						input={value}
						slug={compositionId}
					/>
					{validationMessage ? (
						<>
							<Spacing y={1} block />
							<ValidationMessage
								align="flex-start"
								message={validationMessage}
								type="error"
							/>
						</>
					) : null}
				</InputAndValidationContainer>
			</div>
		</div>
	);
};
