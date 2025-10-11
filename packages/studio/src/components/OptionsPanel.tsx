import React, {
	createRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {useMobileLayout} from '../helpers/mobile-layout';
import {VisualControlsTabActivatedContext} from '../visual-controls/VisualControls';
import {GlobalPropsEditorUpdateButton} from './GlobalPropsEditorUpdateButton';
import {DataEditor} from './RenderModal/DataEditor';
import {deepEqual} from './RenderModal/SchemaEditor/deep-equal';
import {RenderQueue} from './RenderQueue';
import {RendersTab} from './RendersTab';
import {Tab, Tabs} from './Tabs';
import {VisualControlsContent} from './VisualControls/VisualControlsContent';

type OptionsSidebarPanel = 'input-props' | 'renders' | 'visual-controls';

const localStorageKey = 'remotion.sidebarPanel';

const getSelectedPanel = (readOnlyStudio: boolean): OptionsSidebarPanel => {
	if (readOnlyStudio) {
		return 'input-props';
	}

	const panel = localStorage.getItem(localStorageKey);
	if (panel === 'renders') {
		return 'renders';
	}

	if (panel === 'visual-controls') {
		return 'visual-controls';
	}

	return 'input-props';
};

const tabsContainer: React.CSSProperties = {
	backgroundColor: BACKGROUND,
};

export const persistSelectedOptionsSidebarPanel = (
	panel: OptionsSidebarPanel,
) => {
	localStorage.setItem(localStorageKey, panel);
};

export const optionsSidebarTabs = createRef<{
	selectRendersPanel: () => void;
}>();

export const OptionsPanel: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {props, updateProps, resetUnsaved} = useContext(
		Internals.EditorPropsContext,
	);
	const [saving, setSaving] = useState(false);

	const isMobileLayout = useMobileLayout();

	const visualControlsTabActivated = useContext(
		VisualControlsTabActivatedContext,
	);

	const container: React.CSSProperties = useMemo(
		() => ({
			height: '100%',
			width: '100%',
			display: 'flex',
			position: isMobileLayout ? 'relative' : 'absolute',
			flexDirection: 'column',
			flex: 1,
		}),
		[isMobileLayout],
	);

	const [panel, setPanel] = useState<OptionsSidebarPanel>(() =>
		getSelectedPanel(readOnlyStudio),
	);
	const onPropsSelected = useCallback(() => {
		setPanel('input-props');
		persistSelectedOptionsSidebarPanel('input-props');
	}, []);

	const onRendersSelected = useCallback(() => {
		setPanel('renders');
		persistSelectedOptionsSidebarPanel('renders');
	}, []);

	const onVisualControlsSelected = useCallback(() => {
		setPanel('visual-controls');
		persistSelectedOptionsSidebarPanel('visual-controls');
	}, []);

	useImperativeHandle(optionsSidebarTabs, () => {
		return {
			selectRendersPanel: () => {
				setPanel('renders');
				persistSelectedOptionsSidebarPanel('renders');
			},
		};
	}, []);

	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);

	const composition = useMemo((): _InternalTypes['AnyComposition'] | null => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return null;
		}

		for (const comp of compositions) {
			if (comp.id === canvasContent.compositionId) {
				return comp;
			}
		}

		return null;
	}, [canvasContent, compositions]);

	const setDefaultProps = useCallback(
		(
			newProps:
				| Record<string, unknown>
				| ((oldProps: Record<string, unknown>) => Record<string, unknown>),
		) => {
			if (composition === null) {
				return;
			}

			window.remotion_ignoreFastRefreshUpdate = null;

			updateProps({
				id: composition.id,
				defaultProps: composition.defaultProps as Record<string, unknown>,
				newProps,
			});
		},
		[composition, updateProps],
	);

	const currentDefaultProps = useMemo(() => {
		if (composition === null) {
			return {};
		}

		return props[composition.id] ?? composition.defaultProps ?? {};
	}, [composition, props]);

	const unsavedChangesExist = useMemo(() => {
		if (composition === null || composition.defaultProps === undefined) {
			return false;
		}

		return !deepEqual(composition.defaultProps, currentDefaultProps);
	}, [currentDefaultProps, composition]);

	const reset = useCallback(
		(e: Event) => {
			if ((e as CustomEvent).detail.resetUnsaved) {
				resetUnsaved((e as CustomEvent).detail.resetUnsaved);
			}
		},
		[resetUnsaved],
	);

	useEffect(() => {
		window.addEventListener(Internals.PROPS_UPDATED_EXTERNALLY, reset);

		return () => {
			window.removeEventListener(Internals.PROPS_UPDATED_EXTERNALLY, reset);
		};
	}, [reset]);

	return (
		<div style={container} className="css-reset">
			<div style={tabsContainer}>
				<Tabs>
					{visualControlsTabActivated ? (
						<Tab
							selected={panel === 'visual-controls'}
							onClick={onVisualControlsSelected}
						>
							Controls
						</Tab>
					) : null}
					{composition ? (
						<Tab
							selected={panel === 'input-props'}
							onClick={onPropsSelected}
							style={{justifyContent: 'space-between'}}
						>
							Props
							{unsavedChangesExist ? (
								<GlobalPropsEditorUpdateButton
									compositionId={composition.id}
									currentDefaultProps={currentDefaultProps}
								/>
							) : null}
						</Tab>
					) : null}
					{readOnlyStudio ? null : (
						<RendersTab
							onClick={onRendersSelected}
							selected={panel === 'renders'}
						/>
					)}
				</Tabs>
			</div>
			{panel === `input-props` && composition ? (
				<DataEditor
					key={composition.id}
					unresolvedComposition={composition}
					defaultProps={currentDefaultProps}
					setDefaultProps={setDefaultProps}
					mayShowSaveButton
					propsEditType="default-props"
					saving={saving}
					setSaving={setSaving}
					readOnlyStudio={readOnlyStudio}
				/>
			) : panel === 'visual-controls' && visualControlsTabActivated ? (
				<VisualControlsContent />
			) : readOnlyStudio ? null : (
				<RenderQueue />
			)}
		</div>
	);
};
