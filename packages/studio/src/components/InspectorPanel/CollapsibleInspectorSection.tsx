import React from 'react';
import {CollapsibleInspectorSectionHeader} from './CollapsibleInspectorSectionHeader';
import {InspectorSectionBody, InspectorSectionHeader} from './common';
import {useInspectorSectionExpanded} from './use-inspector-section-expanded';

export const CollapsibleInspectorSection: React.FC<{
	readonly children: React.ReactNode;
	readonly collapsible: boolean;
	readonly label: string;
	readonly sectionId: string;
}> = ({children, collapsible, label, sectionId}) => {
	const [expanded, setExpanded] = useInspectorSectionExpanded(sectionId);

	return (
		<>
			<InspectorSectionHeader>
				<CollapsibleInspectorSectionHeader
					action={null}
					expanded={expanded}
					label={label}
					onToggle={collapsible ? () => setExpanded(!expanded) : null}
				/>
			</InspectorSectionHeader>
			<InspectorSectionBody expanded={!collapsible || expanded}>
				{children}
			</InspectorSectionBody>
		</>
	);
};
