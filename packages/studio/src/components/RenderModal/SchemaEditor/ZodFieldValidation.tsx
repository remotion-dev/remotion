import {Spacing} from '../../layout';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {InfoBubble} from '../InfoBubble';
import type {LocalState} from './local-state';
import type {JSONPath} from './zod-types';

const legend: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const stackTrace: React.CSSProperties = {
	padding: 10,
};

const stackTraceLabel: React.CSSProperties = {
	fontSize: 14,
};

export const ZodFieldValidation: React.FC<{
	localValue: LocalState<unknown>;
	path: JSONPath;
}> = ({localValue, path}) => {
	if (localValue.zodValidation.success) {
		return null;
	}

	return (
		<div style={legend}>
			<ValidationMessage
				align="flex-start"
				message={localValue.zodValidation.error.format()._errors[0]}
				type="error"
			/>
			<Spacing x={0.5} />
			<InfoBubble title="Zod validation failure">
				<div style={stackTrace}>
					<div style={stackTraceLabel}>Zod Validation has failed:</div>
					{localValue.zodValidation.error.errors.map((error, index) => (
						// eslint-disable-next-line react/no-array-index-key
						<div key={index} style={stackTraceLabel}>
							Type: {error.code} <br />
							Message: {error.message}
							<br />
							Path: {path.join('.')}
						</div>
					))}
				</div>
			</InfoBubble>
			<Spacing x={0.5} />
		</div>
	);
};
