import {createRef, useCallback, useImperativeHandle, useState} from 'react';
import {BACKGROUND} from '../helpers/colors';
import {AssetSelector} from './AssetSelector';
import {CompositionSelector} from './CompositionSelector';
import {Tab, Tabs} from './Tabs';

const container: React.CSSProperties = {
	height: '100%',
	width: '100%',
	maxWidth: '100%',
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
};

type OptionsSidebarPanel = 'compositions' | 'assets';

const localStorageKey = 'remotion.sidebarPanel';

const getSelectedPanel = (): OptionsSidebarPanel => {
	const panel = localStorage.getItem(localStorageKey);
	if (panel === 'assets') {
		return 'assets';
	}

	return 'compositions';
};

const tabsContainer: React.CSSProperties = {
	backgroundColor: BACKGROUND,
};

const persistSelectedOptionsSidebarPanel = (panel: OptionsSidebarPanel) => {
	localStorage.setItem(localStorageKey, panel);
};

const optionsSidebarTabs = createRef<{
	selectRendersPanel: () => void;
}>();

export const ExplorerPanel: React.FC<{}> = () => {
	const [panel, setPanel] = useState<OptionsSidebarPanel>(() =>
		getSelectedPanel(),
	);
	const onCompositionsSelected = useCallback(() => {
		setPanel('compositions');
		persistSelectedOptionsSidebarPanel('compositions');
	}, []);

	const onAssetsSelected = useCallback(() => {
		setPanel('assets');
		persistSelectedOptionsSidebarPanel('assets');
	}, []);

	useImperativeHandle(
		optionsSidebarTabs,
		() => {
			return {
				selectRendersPanel: () => {
					setPanel('assets');
					persistSelectedOptionsSidebarPanel('assets');
				},
			};
		},
		[],
	);

	return (
		<div style={container} className="css-reset">
			<div style={tabsContainer}>
				<Tabs>
					<Tab
						selected={panel === 'compositions'}
						onClick={onCompositionsSelected}
					>
						Compositions
					</Tab>
					<Tab selected={panel === 'assets'} onClick={onAssetsSelected}>
						Assets
					</Tab>
				</Tabs>
			</div>
			{panel === 'compositions' ? <CompositionSelector /> : <AssetSelector />}
		</div>
	);
};
