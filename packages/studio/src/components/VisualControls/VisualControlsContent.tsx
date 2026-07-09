import React, {useContext} from 'react';
import {VisualControlsContext} from '../../visual-controls/VisualControls';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {getSchemaEditorRootInset} from '../RenderModal/SchemaEditor/Fieldset';
import {SchemaSeparationLine} from '../RenderModal/SchemaEditor/SchemaSeparationLine';
import {VisualControlHandle} from './VisualControlHandle';

const rootInset = getSchemaEditorRootInset(INSPECTOR_PANEL_HORIZONTAL_PADDING);

const container: React.CSSProperties = {
	boxSizing: 'border-box',
	paddingLeft: rootInset,
	paddingRight: rootInset,
};

export const VisualControlsContent = () => {
	const {handles} = useContext(VisualControlsContext);

	const entries = Object.entries(handles);

	if (entries.length === 0) {
		return null;
	}

	return (
		<div style={container}>
			{entries.map(([key, value], i) => {
				return (
					<React.Fragment key={key}>
						<VisualControlHandle keyName={key} value={value} />
						{i === entries.length - 1 ? null : <SchemaSeparationLine />}
					</React.Fragment>
				);
			})}
		</div>
	);
};
