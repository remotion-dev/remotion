import React, {useContext} from 'react';
import {VisualControlsContext} from '../../visual-controls/VisualControls';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {SchemaSeparationLine} from '../RenderModal/SchemaEditor/SchemaSeparationLine';
import {VisualControlHandle} from './VisualControlHandle';

const container: React.CSSProperties = {
	overflowY: 'auto',
};

export const VisualControlsContent = () => {
	const {handles} = useContext(VisualControlsContext);

	const entries = Object.entries(handles);

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
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
