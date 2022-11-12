import React, {useCallback, useState} from 'react';
import {CompositionSelector} from './CompositionSelector';
import {RenderQueue} from './RenderQueue';

type SidebarPanel = 'compositions' | 'renders';

export const SidebarContent: React.FC = () => {
	const [panel, setPanel] = useState<SidebarPanel>('compositions');

	const onCompositionsSelected = useCallback(() => {
		setPanel('compositions');
	}, []);

	const onRendersSelected = useCallback(() => {
		setPanel('renders');
	}, []);

	return (
		<div>
			<button type="button" onClick={onCompositionsSelected}>
				Compositions
			</button>
			<button type="button" onClick={onRendersSelected}>
				Renders
			</button>
			{panel === 'compositions' ? <CompositionSelector /> : <RenderQueue />}
		</div>
	);
};
