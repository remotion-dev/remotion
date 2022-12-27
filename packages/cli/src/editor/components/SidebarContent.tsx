import React, {
	createRef,
	useCallback,
	useImperativeHandle,
	useState,
} from 'react';
import {BORDER_COLOR} from '../helpers/colors';
import {CompositionSelector} from './CompositionSelector';
import {RenderQueue} from './RenderQueue';
import {useShouldRenderLeftSidebarTabs} from './RenderQueue/context';
import {RendersTab} from './RendersTab';
import {Tab, Tabs} from './Tabs';

type SidebarPanel = 'compositions' | 'renders';

const container: React.CSSProperties = {
	width: '100%',
};

const tabsContainer: React.CSSProperties = {
	borderBottom: `1px solid ${BORDER_COLOR}`,
};

export const leftSidebarTabs = createRef<{
	selectRendersPanel: () => void;
}>();

export const SidebarContent: React.FC = () => {
	const [panel, setPanel] = useState<SidebarPanel>('compositions');
	const shouldRender = useShouldRenderLeftSidebarTabs();

	const onCompositionsSelected = useCallback(() => {
		setPanel('compositions');
	}, []);

	const onRendersSelected = useCallback(() => {
		setPanel('renders');
	}, []);

	useImperativeHandle(
		leftSidebarTabs,
		() => {
			return {
				selectRendersPanel: () => setPanel('renders'),
			};
		},
		[]
	);

	return (
		<div style={container}>
			{shouldRender ? (
				<div style={tabsContainer}>
					<Tabs>
						<Tab
							selected={panel === 'compositions'}
							onClick={onCompositionsSelected}
						>
							Compositions
						</Tab>
						<RendersTab
							onClick={onRendersSelected}
							selected={panel === 'renders'}
						/>
					</Tabs>
				</div>
			) : null}
			{panel === 'renders' && shouldRender ? (
				<RenderQueue />
			) : (
				<CompositionSelector />
			)}
		</div>
	);
};
