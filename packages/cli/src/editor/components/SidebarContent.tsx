import React, {useCallback, useState} from 'react';
import {BORDER_COLOR} from '../helpers/colors';
import {CompositionSelector} from './CompositionSelector';
import {RenderQueue} from './RenderQueue';
import {Tab, Tabs} from './Tabs';

type SidebarPanel = 'compositions' | 'renders';

const container: React.CSSProperties = {
	width: '100%',
};

const tabsContainer: React.CSSProperties = {
	padding: 4,
	borderBottom: `1px solid ${BORDER_COLOR}`,
};

export const SidebarContent: React.FC = () => {
	const [panel, setPanel] = useState<SidebarPanel>('compositions');

	const onCompositionsSelected = useCallback(() => {
		setPanel('compositions');
	}, []);

	const onRendersSelected = useCallback(() => {
		setPanel('renders');
	}, []);

	return (
		<div style={container}>
			<div style={tabsContainer}>
				<Tabs>
					<Tab
						selected={panel === 'compositions'}
						onClick={onCompositionsSelected}
					>
						Compositions
					</Tab>
					<Tab selected={panel === 'renders'} onClick={onRendersSelected}>
						Renders
					</Tab>
				</Tabs>
			</div>
			{panel === 'compositions' ? <CompositionSelector /> : <RenderQueue />}
		</div>
	);
};
