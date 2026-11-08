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
import {FOCUS_VISIBLE_ONLY_CLASS_NAME} from '../helpers/hoverable';
import {useMobileLayout} from '../helpers/mobile-layout';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import {ActionTooltip} from './ActionTooltip';
import {useZodIfPossible, useZodTypesIfPossible} from './get-zod-if-possible';
import {InlineAction} from './InlineAction';
import {InspectorPanel} from './InspectorPanel';
import {
	getSameSequenceInspectorSelection,
	isSequenceSectionSelection,
	type SequenceSectionSelection,
} from './InspectorPanel/inspector-selection';
import {useTrackForSelection} from './InspectorPanel/use-track-for-selection';
import {showNotification} from './Notifications/NotificationCenter';
import {optionsSidebarTabs} from './options-sidebar-tabs';
import {deepEqual} from './RenderModal/SchemaEditor/deep-equal';
import {extractEnumJsonPaths} from './RenderModal/SchemaEditor/extract-enum-json-paths';
import {resolveCompositionSchema} from './RenderModal/SchemaEditor/infer-zod-schema-from-value';
import {SchemaResetButton} from './RenderModal/SchemaEditor/SchemaResetButton';
import type {UpdaterFunction} from './RenderModal/SchemaEditor/ZodSwitch';
import {RenderQueue} from './RenderQueue';
import {callUpdateDefaultPropsApi} from './RenderQueue/actions';
import {RendersTab} from './RendersTab';
import {Tab, Tabs} from './Tabs';
import {shouldClearSelectionOnPointerDown} from './Timeline/should-clear-selection-on-pointer-down';
import {
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
} from './Timeline/TimelineSelection';
import {
	getCachedResolvedStack,
	useResolvedStack,
} from './Timeline/use-resolved-stack';

type OptionsSidebarPanel = 'inspector' | 'renders';

const localStorageKey = 'remotion.sidebarPanel';

const getSelectedPanel = (): OptionsSidebarPanel => {
	const panel = localStorage.getItem(localStorageKey);
	if (panel === 'renders') {
		return 'renders';
	}

	return 'inspector';
};

const tabsContainer: React.CSSProperties = {
	backgroundColor: BACKGROUND,
};

const inspectorTitleStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flex: 1,
	fontSize: 13,
	gap: 4,
	minWidth: 0,
};

const inspectorTitleLabelStyle: React.CSSProperties = {
	color: 'inherit',
	flex: 1,
	fontSize: 13,
	maskImage:
		'linear-gradient(to right, black calc(100% - 16px), transparent calc(100% - 6px))',
	minWidth: 0,
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	WebkitMaskImage:
		'linear-gradient(to right, black calc(100% - 16px), transparent calc(100% - 6px))',
};

const inspectorBackStyle: React.CSSProperties = {
	cursor: 'default',
};

const inspectorBackIcon: React.CSSProperties = {
	display: 'block',
	height: 12,
	width: 8,
};

const inspectorContainer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minHeight: 0,
	paddingTop: 5,
};

const SequenceInspectorTitle: React.FC<{
	readonly selection: SequenceSectionSelection;
}> = ({selection}) => {
	const track = useTrackForSelection(selection);
	return (
		<span style={inspectorTitleLabelStyle}>
			{track?.sequence.controls?.componentName ?? '<Sequence>'}
		</span>
	);
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

	const isMobileLayout = useMobileLayout();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

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

	const [panel, setPanel] = useState<OptionsSidebarPanel>(getSelectedPanel);
	const onInspectorSelected = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (panel === 'inspector' && shouldClearSelectionOnPointerDown(event)) {
				currentSelection.current.stepBackSelection(true);
			}

			setPanel('inspector');
			persistSelectedOptionsSidebarPanel('inspector');
		},
		[currentSelection, panel],
	);

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

	const {selectedItems: timelineSelectedItems, selectItems} =
		useTimelineSelection();
	const pendingDeletions = Internals.usePendingSequenceDeletions();
	const selectedItems = useMemo(() => {
		if (pendingDeletions.size === 0) {
			return timelineSelectedItems;
		}

		// Keep the underlying selection for rollback and undo, but stop inspecting
		// sequences as soon as their optimistic deletion removes them from the tree.
		return timelineSelectedItems.filter(
			(item) =>
				item.type === 'guide' ||
				!Internals.OptimisticSequenceDeletion.isDeleted(
					item.nodePathInfo.sequenceSubscriptionKey,
					pendingDeletions,
				),
		);
	}, [pendingDeletions, timelineSelectedItems]);
	const effectsSelection =
		selectedItems.length === 1 &&
		selectedItems[0].type === 'sequence-all-effects'
			? selectedItems[0]
			: null;
	const onEffectsBack = useCallback(() => {
		if (effectsSelection === null) {
			return;
		}

		selectItems([
			{
				type: 'sequence',
				nodePathInfo: {...effectsSelection.nodePathInfo, auxiliaryKeys: []},
			},
		]);
	}, [effectsSelection, selectItems]);
	const inspectorTitle = useMemo(() => {
		if (effectsSelection !== null) {
			return 'Add effect';
		}

		if (selectedItems.length === 0) {
			if (canvasContent?.type === 'asset') {
				return 'Asset';
			}

			return composition === null ? 'Selection' : 'Composition';
		}

		const selection =
			selectedItems.length === 1
				? selectedItems[0]
				: getSameSequenceInspectorSelection(selectedItems);
		if (selection === null) {
			return selectedItems.every((item) => item.type === 'sequence')
				? 'Sequences'
				: 'Selection';
		}

		if (isSequenceSectionSelection(selection)) {
			return <SequenceInspectorTitle selection={selection} />;
		}

		switch (selection.type) {
			case 'keyframe':
				return 'Keyframe';
			case 'easing':
				return 'Easing';
			case 'guide':
				return 'Guide';
			default:
				throw new Error(
					`Unexpected inspector selection: ${selection satisfies never}`,
				);
		}
	}, [canvasContent, composition, effectsSelection, selectedItems]);

	// Re-renders once the stack is resolved. Read from the cache so the location
	// always belongs to the current composition, not the previously selected one.
	useResolvedStack(composition?.stack ?? null);
	const resolvedLocation = getCachedResolvedStack(composition?.stack ?? null);
	const symbolicatedStack = useMemo(
		() => resolvedStackToSymbolicated(resolvedLocation),
		[resolvedLocation],
	);

	const z = useZodIfPossible();
	const zodTypes = useZodTypesIfPossible();

	const noComposition = !composition;

	const schema = useMemo(() => {
		if (noComposition) {
			return 'no-composition' as const;
		}

		return resolveCompositionSchema({
			explicitSchema: composition.schema,
			defaultProps: composition.defaultProps ?? {},
			z,
			zodTypes,
		});
	}, [composition, noComposition, z, zodTypes]);

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
				symbolicatedStack,
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
		[
			composition,
			currentDefaultProps,
			readOnlyStudio,
			schema,
			symbolicatedStack,
			z,
			zodTypes,
		],
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

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			e.stopPropagation();
			if (
				panel !== 'inspector' ||
				!shouldClearSelectionOnPointerDown(e) ||
				(e.target instanceof Element &&
					e.target.closest(
						'button, input, textarea, select, a, [contenteditable="true"], [role="button"], [role="tab"]',
					))
			) {
				return;
			}

			currentSelection.current.stepBackSelection(true);
		},
		[currentSelection, panel],
	);

	return (
		<div style={container} className="css-reset" onPointerDown={onPointerDown}>
			<div style={tabsContainer}>
				<Tabs>
					<Tab
						selected={panel === 'inspector'}
						onClick={onInspectorSelected}
						style={{justifyContent: 'space-between', minWidth: 0}}
					>
						<span style={inspectorTitleStyle}>
							{effectsSelection === null ? null : (
								<ActionTooltip
									label="Back to inspector"
									shortcut={null}
									delay={800}
									dismissOnClick
								>
									<InlineAction
										aria-label="Back to inspector"
										className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
										onClick={onEffectsBack}
										style={inspectorBackStyle}
										variant="compact"
										renderAction={(color) => (
											<svg
												aria-hidden="true"
												viewBox="0 0 8 12"
												style={inspectorBackIcon}
											>
												<path
													d="M6 1L2 6L6 11"
													fill="none"
													stroke={color}
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="1.5"
												/>
											</svg>
										)}
									/>
								</ActionTooltip>
							)}
							{inspectorTitle}
						</span>
						{hasLocalModifications ? (
							<SchemaResetButton onClick={resetToOriginal} />
						) : null}
					</Tab>
					<RendersTab
						onClick={onRendersSelected}
						selected={panel === 'renders'}
					/>
				</Tabs>
			</div>
			{panel === 'inspector' ? (
				<div style={inspectorContainer}>
					<InspectorPanel
						composition={composition}
						currentDefaultProps={currentDefaultProps}
						readOnlyStudio={readOnlyStudio}
						selectedItems={selectedItems}
						setDefaultProps={setDefaultProps}
					/>
				</div>
			) : (
				<RenderQueue />
			)}
		</div>
	);
};
