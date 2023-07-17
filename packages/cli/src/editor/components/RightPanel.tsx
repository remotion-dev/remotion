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
import {cmdOrCtrlCharacter} from '../../preview-server/error-overlay/remotion-overlay/ShortcutHint';
import {BACKGROUND, LIGHT_TEXT} from '../helpers/colors';
import {DataEditor} from './RenderModal/DataEditor';
import {deepEqual} from './RenderModal/SchemaEditor/deep-equal';
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

const circle: React.CSSProperties = {
	width: 8,
	height: 8,
	borderRadius: 4,
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
	backgroundColor: BACKGROUND,
};

export const persistSelectedPanel = (panel: SidebarPanel) => {
	localStorage.setItem(localStorageKey, panel);
};

export const rightSidebarTabs = createRef<{
	selectRendersPanel: () => void;
}>();

export const RightPanel: React.FC<{}> = () => {
	const {props, updateProps} = useContext(Internals.EditorPropsContext);
	const [saving, setSaving] = useState(false);
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
	const circleStyle = useMemo((): React.CSSProperties => {
		const onTabColor = saving ? LIGHT_TEXT : 'white';

		return {
			...circle,
			backgroundColor: panel === 'input-props' ? onTabColor : LIGHT_TEXT,
			cursor: 'help',
		};
	}, [panel, saving]);

	const composition = useMemo((): AnyComposition | null => {
		for (const comp of compositions) {
			if (comp.id === currentComposition) {
				return comp;
			}
		}

		return null;
	}, [compositions, currentComposition]);

	const setInputProps = useCallback(
		(
			newProps:
				| Record<string, unknown>
				| ((oldProps: Record<string, unknown>) => Record<string, unknown>)
		) => {
			if (composition === null) {
				return;
			}

			updateProps({
				id: composition.id,
				defaultProps: composition.defaultProps as Record<string, unknown>,
				newProps,
			});
		},
		[composition, updateProps]
	);

	const actualProps = useMemo(() => {
		if (composition === null) {
			return {};
		}

		return props[composition.id] ?? composition.defaultProps ?? {};
	}, [composition, props]);

	const unsavedChangesExist = useMemo(() => {
		if (composition === null || composition.defaultProps === undefined) {
			return false;
		}

		return !deepEqual(composition.defaultProps, actualProps);
	}, [actualProps, composition]);

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
						style={{justifyContent: 'space-between'}}
					>
						Props
						{unsavedChangesExist ? (
							<div
								title={`Save by using ${cmdOrCtrlCharacter}+S`}
								style={circleStyle}
							/>
						) : null}
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
				<DataEditor
					key={composition.id}
					unresolvedComposition={composition}
					inputProps={actualProps}
					setInputProps={setInputProps}
					mayShowSaveButton
					propsEditType="default-props"
					saving={saving}
					setSaving={setSaving}
				/>
			)}
		</div>
	);
};
