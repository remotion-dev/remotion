import React, {useContext} from 'react';
import type {VisualControlHook} from '../../visual-controls/VisualControls';
import {VisualControlsContext} from '../../visual-controls/VisualControls';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ClickableFileName} from './ClickableFileName';
import {VisualControlHandle} from './VisualControlHandle';

const Control: React.FC<{
	readonly control: VisualControlHook;
}> = ({control}) => {
	const {handles} = useContext(VisualControlsContext);

	const handle = handles[control.id];

	if (!handle) {
		return null;
	}

	return (
		<div key={control.id}>
			<ClickableFileName stack={control.stack} />
			<Spacing block y={1} />
			{Object.entries(handle).map(([key, value]) => {
				return <VisualControlHandle key={key} keyName={key} value={value} />;
			})}
		</div>
	);
};

const container: React.CSSProperties = {
	padding: 12,
	overflowY: 'auto',
};

export const VisualControlsContent = () => {
	const {controls} = useContext(VisualControlsContext);

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			{controls.map((control) => (
				<Control key={control.id} control={control} />
			))}
		</div>
	);
};
