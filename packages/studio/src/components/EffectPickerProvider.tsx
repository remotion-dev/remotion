import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {canUseEffectOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {isStudioSelectionEnabled} from '../helpers/interactivity-enabled';
import {SidebarContext} from '../state/sidebar';
import {
	getTimelineSelectionKey,
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
	type TimelineSelection,
} from './Timeline/TimelineSelection';

export type EffectPickerState = {
	readonly fileName: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly clientId: string;
	readonly selectItems: ReturnType<typeof useTimelineSelection>['selectItems'];
};

type EffectPickerTarget = Omit<EffectPickerState, 'selectItems'>;

export const EffectPickerStateContext = createContext<EffectPickerState | null>(
	null,
);

export const EffectPickerSetterContext = createContext<{
	readonly openEffectPicker: (target: EffectPickerTarget) => void;
	readonly closeEffectPicker: () => void;
}>({
	openEffectPicker: () => undefined,
	closeEffectPicker: () => undefined,
});

export const EffectPickerProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const compositionManagerRef = useContext(
		Internals.CompositionManagerRefContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewServerStateRef = useRef(previewServerState);
	previewServerStateRef.current = previewServerState;
	const sidebar = useContext(SidebarContext);
	const sidebarRef = useRef(sidebar);
	sidebarRef.current = sidebar;
	const {selectedItems} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const [picker, setPicker] = useState<{
		readonly state: EffectPickerState;
		readonly compositionId: string;
		readonly selectionKey: string;
	} | null>(null);
	const closeEffectPicker = useCallback(() => setPicker(null), []);
	const openEffectPicker = useCallback(
		(target: EffectPickerTarget) => {
			const content = compositionManagerRef.current.canvasContent;
			const connection = previewServerStateRef.current;
			if (
				content?.type !== 'composition' ||
				connection.type !== 'connected' ||
				connection.clientId !== target.clientId ||
				!isStudioSelectionEnabled() ||
				!canUseEffectOperations() ||
				!currentSelection.current.canSelect ||
				!target.nodePathInfo.supportsEffects
			) {
				return;
			}

			const selection: TimelineSelection = {
				type: 'sequence',
				nodePathInfo: {...target.nodePathInfo, auxiliaryKeys: []},
			};
			currentSelection.current.selectItems([selection]);
			if (sidebarRef.current.sidebarCollapsedStateRight === 'collapsed') {
				sidebarRef.current.setSidebarCollapsedState({
					left: null,
					right: 'expanded',
				});
			} else if (
				sidebarRef.current.sidebarCollapsedStateRight === 'responsive'
			) {
				sidebarRef.current.setRightSidebarTemporaryExpansion(true);
			}

			setPicker({
				state: {
					...target,
					selectItems: currentSelection.current.selectItems,
				},
				compositionId: content.compositionId,
				selectionKey: getTimelineSelectionKey(selection),
			});
		},
		[compositionManagerRef, currentSelection],
	);
	const pickerIsCurrent =
		picker !== null &&
		canvasContent?.type === 'composition' &&
		canvasContent.compositionId === picker.compositionId &&
		previewServerState.type === 'connected' &&
		previewServerState.clientId === picker.state.clientId &&
		isStudioSelectionEnabled() &&
		canUseEffectOperations() &&
		selectedItems.length === 1 &&
		getTimelineSelectionKey(selectedItems[0]) === picker.selectionKey;

	useEffect(() => {
		if (!pickerIsCurrent) {
			setPicker(null);
		}
	}, [pickerIsCurrent]);

	const setters = useMemo(
		() => ({openEffectPicker, closeEffectPicker}),
		[closeEffectPicker, openEffectPicker],
	);

	return (
		<EffectPickerSetterContext.Provider value={setters}>
			<EffectPickerStateContext.Provider
				value={pickerIsCurrent ? picker.state : null}
			>
				{children}
			</EffectPickerStateContext.Provider>
		</EffectPickerSetterContext.Provider>
	);
};
