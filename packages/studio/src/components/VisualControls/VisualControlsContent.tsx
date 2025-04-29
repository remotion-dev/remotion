import React, {useContext} from 'react';
import {VisualControlsContext} from '../../visual-controls/VisualControls';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {VisualControlHandle} from './VisualControlHandle';

const container: React.CSSProperties = {
	padding: 12,
	overflowY: 'auto',
};

export const VisualControlsContent = () => {
	const {handles} = useContext(VisualControlsContext);

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			{Object.entries(handles).map(([key, value]) => {
				return <VisualControlHandle key={key} keyName={key} value={value} />;
			})}
		</div>
	);
};
