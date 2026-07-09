import React, {
	useCallback,
	useContext,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {useMobileLayout} from '../helpers/mobile-layout';
import {SHOW_BROWSER_RENDERING} from '../helpers/show-browser-rendering';
import {useZodIfPossible, useZodTypesIfPossible} from './get-zod-if-possible';
import {InspectorPanel} from './InspectorPanel';
import {showNotification} from './Notifications/NotificationCenter';
import {optionsSidebarTabs} from './options-sidebar-tabs';
import {deepEqual} from './RenderModal/SchemaEditor/deep-equal';
import {extractEnumJsonPaths} from './RenderModal/SchemaEditor/extract-enum-json-paths';
import {SchemaResetButton} from './RenderModal/SchemaEditor/SchemaResetButton';
import type {AnyZodSchema} from './RenderModal/SchemaEditor/zod-schema-type';
import type {UpdaterFunction} from './RenderModal/SchemaEditor/ZodSwitch';
import {RenderQueue} from './RenderQueue';
import {callUpdateDefaultPropsApi} from './RenderQueue/actions';
import {RendersTab} from './RendersTab';
import {Tab, Tabs} from './Tabs';

type OptionsSidebarPanel = 'inspector' | 'renders';

const localStorageKey = 'remotion.sidebarPanel';

const getSelectedPanel = (renderingAvailable: boolean): OptionsSidebarPanel => {
	if (!renderingAvailable) {
		return 'inspector';
	}

	const panel = localStorage.getItem(localStorageKey);
	if (panel === 'renders') {
		return 'renders';
	}

	return 'inspector';
};

const tabsContainer: React.CSSProperties = {
	backgroundColor: BACKGROUND,
};

export const persistSelectedOptionsSidebarPanel = (
	panel: OptionsSidebarPanel,
) => {
	localStorage.setItem(localStorageKey, panel);
};

export const OptionsPanel: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {props, updateProps} = useContext(Internals.EditorPropsContext);

	const renderingAvailable = !readOnlyStudio || SHOW_BROWSER_RENDERING;

	const isMobileLayout = useMobileLayout();

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
		getSelectedPanel(renderingAvailable),
	);
	const onInspectorSelected = useCallback(() => {
		setPanel('inspector');
		persistSelectedOptionsSidebarPanel('inspector');
	}, []);

	const onRendersSelected = useCallback(() => {
		setPanel('renders');
		persistSelectedOptionsSidebarPanel('renders');
	}, []);

	useImperativeHandle(optionsSidebarTabs, () => {
		return {
			selectInspectorPanel: () => {
				setPanel('inspector');
				persistSelectedOptionsSidebarPanel('inspector');
			},
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

	const z = useZodIfPossible();
	const zodTypes = useZodTypesIfPossible();

	const noComposition = !composition;

	const schema = useMemo(() => {
		if (!z) {
			return 'no-zod' as const;
		}

		if (noComposition) {
			return 'no-composition' as const;
		}

		if (!composition.schema) {
			return 'no-schema' as const;
		}

		if (
			!(
				typeof (composition.schema as {safeParse?: unknown}).safeParse ===
				'function'
			)
		) {
			throw new Error(
				'A value which is not a Zod schema was passed to `schema`',
			);
		}

		return composition.schema as AnyZodSchema;
	}, [composition?.schema, noComposition, z]);

	const currentDefaultProps = useMemo(() => {
		if (composition === null) {
			return {};
		}

		return props[composition.id] ?? composition.defaultProps ?? {};
	}, [composition, props]);

	const saveToFile = useCallback(
		(updater: (old: Record<string, unknown>) => Record<string, unknown>) => {
			if (readOnlyStudio) {
				return;
			}

			if (
				schema === 'no-zod' ||
				schema === 'no-schema' ||
				schema === 'no-composition' ||
				z === null
			) {
				showNotification('Cannot update default props: No Zod schema', 2000);
				return;
			}

			if (!composition) {
				throw new Error('Composition is not found');
			}

			const oldDefaultProps = currentDefaultProps;
			const newDefaultProps = updater(
				oldDefaultProps as Record<string, unknown>,
			);
			callUpdateDefaultPropsApi(
				composition.id,
				newDefaultProps,
				extractEnumJsonPaths({
					schema,
					zodRuntime: z,
					currentPath: [],
					zodTypes,
				}),
			)
				.then((response) => {
					if (!response.success) {
						// eslint-disable-next-line no-console
						console.log(response.stack);
						showNotification(
							`Cannot update default props: ${response.reason}. See console for more information.`,
							2000,
						);
					}
				})
				.catch((err) => {
					showNotification(`Cannot update default props: ${err.message}`, 2000);
				});
		},
		[composition, currentDefaultProps, readOnlyStudio, schema, z, zodTypes],
	);

	const compositionId = useMemo(() => {
		return composition?.id ?? '';
	}, [composition?.id]);

	const compositionDefaultProps = useMemo(() => {
		return composition?.defaultProps ?? {};
	}, [composition?.defaultProps]);

	const hasLocalModifications = useMemo(() => {
		if (!readOnlyStudio || !composition || !composition.defaultProps) {
			return false;
		}

		return !deepEqual(composition.defaultProps, currentDefaultProps);
	}, [readOnlyStudio, composition, currentDefaultProps]);

	const resetToOriginal = useCallback(() => {
		if (!composition) {
			return;
		}

		updateProps({
			id: composition.id,
			defaultProps: (composition.defaultProps ?? {}) as Record<string, unknown>,
			newProps: (composition.defaultProps ?? {}) as Record<string, unknown>,
		});
	}, [composition, updateProps]);

	const setDefaultProps: UpdaterFunction<Record<string, unknown>> = useCallback(
		(updater, {shouldSave}) => {
			updateProps({
				id: compositionId,
				defaultProps: compositionDefaultProps as Record<string, unknown>,
				newProps: updater,
			});

			if (shouldSave) {
				saveToFile(updater);
			}
		},
		[compositionId, compositionDefaultProps, saveToFile, updateProps],
	);

	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		// Prevent deselection of currently selected items
		e.stopPropagation();
	}, []);

	return (
		<div style={container} className="css-reset" onPointerDown={onPointerDown}>
			<div style={tabsContainer}>
				<Tabs>
					<Tab
						selected={panel === 'inspector'}
						onClick={onInspectorSelected}
						style={{justifyContent: 'space-between'}}
					>
						Inspector
						{hasLocalModifications ? (
							<SchemaResetButton onClick={resetToOriginal} />
						) : null}
					</Tab>
					{renderingAvailable ? (
						<RendersTab
							onClick={onRendersSelected}
							selected={panel === 'renders'}
						/>
					) : null}
				</Tabs>
			</div>
			{panel === 'inspector' ? (
				<InspectorPanel
					composition={composition}
					currentDefaultProps={currentDefaultProps}
					readOnlyStudio={readOnlyStudio}
					setDefaultProps={setDefaultProps}
				/>
			) : !renderingAvailable ? null : (
				<RenderQueue />
			)}
		</div>
	);
};
