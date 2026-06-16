import React from 'react';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import type {RenderModalWarning} from '../RenderModal/DataEditor';
import {
	centeredMessage,
	defaultPropsWarningMessages,
	detailLabel,
	detailRow,
	detailValue,
	resolveLinkStyle,
	sectionHeader,
} from './styles';

export const InspectorSectionHeader: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => <div style={sectionHeader}>{children}</div>;

export const InspectorMessage: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => <div style={centeredMessage}>{children}</div>;

export const InspectorDetailRow: React.FC<{
	readonly label: string;
	readonly children: React.ReactNode;
}> = ({label, children}) => (
	<div style={detailRow}>
		<div style={detailLabel}>{label}</div>
		<div style={detailValue}>{children}</div>
	</div>
);

export const InspectorDefaultPropsWarnings: React.FC<{
	readonly warnings: RenderModalWarning[];
}> = ({warnings}) => {
	return (
		<div style={defaultPropsWarningMessages}>
			{warnings.map((warning) => (
				<ValidationMessage
					key={warning.id}
					message={warning.message}
					align="flex-start"
					type="warning"
					size="compact"
					action={
						warning.resolveLink ? (
							<a
								href={warning.resolveLink}
								target="_blank"
								rel="noopener noreferrer"
								style={resolveLinkStyle}
							>
								Resolve
							</a>
						) : null
					}
				/>
			))}
		</div>
	);
};
