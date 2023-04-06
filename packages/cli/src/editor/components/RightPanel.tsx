import React, {
	createRef,
	useCallback,
	useContext,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import type {AnyComposition} from 'remotion';
import {Internals} from 'remotion';
import {BORDER_COLOR} from '../helpers/colors';
import {RenderModalData} from './RenderModal/RenderModalData';
import {RenderQueue} from './RenderQueue';
import {RendersTab} from './RendersTab';
import {Tab, Tabs} from './Tabs';

const container: React.CSSProperties = {
	height: '100%',
	width: '100%',
	position: 'absolute',
	display: 'flex',
	flexDirection: 'column',
};

const PropsEditor: React.FC<{
	composition: AnyComposition;
}> = ({composition}) => {
	const {props, updateProps} = useContext(Internals.EditorPropsContext);

	const setInputProps = useCallback(
		(newProps: unknown | ((oldProps: unknown) => unknown)) => {
			updateProps({
				id: composition.id,
				defaultProps: composition.defaultProps as object,
				newProps: newProps as object,
			});
		},
		[composition.defaultProps, composition.id, updateProps]
	);

	return (
		<RenderModalData
			composition={composition}
			inputProps={props[composition.id] ?? composition.defaultProps}
			setInputProps={setInputProps}
			compact
			mayShowSaveButton
		/>
	);
};

type SidebarPanel = 'input-props' | 'renders';

const localStorageKey = 'remotion.sidebarPanel';

const getSelectedPanel = (): SidebarPanel => {
	const panel = localStorage.getItem(localStorageKey);
	if (panel === 'renders') {
		return 'renders';
	}

	return 'input-props';
};

const tabsContainer: React.CSSProperties = {
	borderBottom: `1px solid ${BORDER_COLOR}`,
};

export const persistSelectedPanel = (panel: SidebarPanel) => {
	localStorage.setItem(localStorageKey, panel);
};

export const rightSidebarTabs = createRef<{
	selectRendersPanel: () => void;
}>();

export const RightPanel: React.FC<{}> = () => {
	const [panel, setPanel] = useState<SidebarPanel>(() => getSelectedPanel());
	const onCompositionsSelected = useCallback(() => {
		setPanel('input-props');
		persistSelectedPanel('input-props');
	}, []);

	const onRendersSelected = useCallback(() => {
		setPanel('renders');
		persistSelectedPanel('renders');
	}, []);

	useImperativeHandle(
		rightSidebarTabs,
		() => {
			return {
				selectRendersPanel: () => {
					setPanel('renders');
					persistSelectedPanel('renders');
				},
			};
		},
		[]
	);

	const {compositions, currentComposition} = useContext(
		Internals.CompositionManager
	);

	const composition = useMemo((): AnyComposition | null => {
		for (const comp of compositions) {
			if (comp.id === currentComposition) {
				return comp;
			}
		}

		return null;
	}, [compositions, currentComposition]);

	if (composition === null) {
		return null;
	}

	return (
		<div style={container} className="css-reset">
			<div style={tabsContainer}>
				<Tabs>
					<Tab
						selected={panel === 'input-props'}
						onClick={onCompositionsSelected}
					>
						Default Props
					</Tab>
					<RendersTab
						onClick={onRendersSelected}
						selected={panel === 'renders'}
					/>
				</Tabs>
			</div>
			{panel === 'renders' ? (
				<RenderQueue />
			) : (
				<PropsEditor composition={composition} />
			)}
		</div>
	);
};
