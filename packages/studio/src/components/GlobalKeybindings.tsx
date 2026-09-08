import type {StudioKeyboardShortcutAction} from '@remotion/studio-shared';
import type React from 'react';
import {useCallback, useContext, useEffect, useMemo} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {getStudioAskAIEnabled} from '../helpers/studio-runtime-config';
import {timelineNodePathInfoToKey} from '../helpers/timeline-node-path-key';
import {useKeybinding} from '../helpers/use-keybinding';
import {CheckerboardContext} from '../state/checkerboard';
import {EditorSnappingContext} from '../state/editor-snapping';
import {SetSelectedModalContext} from '../state/modals';
import {askAiModalRef} from './AskAiModal';
import {useCompositionNavigation} from './CompositionSelector';
import {explorerSidebarTabs} from './ExplorerPanelRef';
import {showNotification} from './Notifications/NotificationCenter';
import {
	getTimelineSequenceSelectionKey,
	useCurrentTimelineSelectionStateAsRef,
} from './Timeline/TimelineSelection';

const sequencePropShortcuts = [
	{action: 'selectTranslateProp', fieldKey: 'style.translate'},
	{action: 'selectRotateProp', fieldKey: 'style.rotate'},
	{action: 'selectScaleProp', fieldKey: 'style.scale'},
	{action: 'selectOpacityProp', fieldKey: 'style.opacity'},
] as const satisfies readonly {
	readonly action: StudioKeyboardShortcutAction;
	readonly fieldKey: string;
}[];

const hasOwnProperty = (obj: object, key: string) =>
	Object.prototype.hasOwnProperty.call(obj, key);

export const GlobalKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {setCheckerboard} = useContext(CheckerboardContext);
	const {setEditorSnapping} = useContext(EditorSnappingContext);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const {sequences} = useContext(Internals.SequenceManager);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {navigateToNextComposition, navigateToPreviousComposition} =
		useCompositionNavigation();
	const video = Internals.useVideo();
	const timeline = useMemo(() => {
		if (videoConfig === null) {
			return [];
		}

		return calculateTimeline({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		});
	}, [overrideIdToNodePathMappings, sequences, videoConfig]);

	const selectSequenceProp = useCallback(
		(fieldKey: string) => {
			const {selectedItems, selectItems} = currentSelection.current;
			if (selectedItems.length !== 1) {
				return false;
			}

			const [selection] = selectedItems;
			if (selection.type !== 'sequence' && selection.type !== 'sequence-prop') {
				return false;
			}

			const selectedTrackKey = getTimelineSequenceSelectionKey(
				selection.nodePathInfo,
			);
			const track = timeline.find(
				(candidate) =>
					candidate.nodePathInfo !== null &&
					timelineNodePathInfoToKey(candidate.nodePathInfo) ===
						selectedTrackKey,
			);

			if (!track?.sequence.controls) {
				return false;
			}

			const {schema, runtimeValues} = track.sequence.controls;
			const currentRuntimeValueDotNotation = runtimeValues.getSnapshot();
			if (
				!hasOwnProperty(schema, fieldKey) &&
				!hasOwnProperty(currentRuntimeValueDotNotation, fieldKey)
			) {
				return false;
			}

			selectItems(
				[
					{
						type: 'sequence-prop',
						nodePathInfo: {
							...selection.nodePathInfo,
							auxiliaryKeys: ['controls', fieldKey],
						},
						key: fieldKey,
					},
				],
				{reveal: true},
			);
			return true;
		},
		[currentSelection, timeline],
	);

	const openRenderModal = useCallback(() => {
		if (!video) {
			return;
		}

		const renderButton = document.getElementById(
			'render-modal-button',
		) as HTMLDivElement;

		renderButton.click();
	}, [video]);

	useEffect(() => {
		const cmdKKey = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'quickSwitcher',
			callback: () => {
				setSelectedModal({
					type: 'quick-switcher',
					mode:
						explorerSidebarTabs.current?.getSelectedPanel() === 'assets'
							? 'assets'
							: 'compositions',
					invocationTimestamp: Date.now(),
					assetSelection: null,
					compositionSelection: null,
				});
			},
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
			preventDefault: true,
		});
		const cmdSKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 's',
			callback: () => {
				showNotification('Remotion saves automatically', 2000);
			},
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
			commandCtrlKey: true,
			preventDefault: true,
		});
		const cmdIKey = getStudioAskAIEnabled()
			? keybindings.registerKeybinding({
					event: 'keydown',
					action: 'askAI',
					callback: () => {
						askAiModalRef.current?.toggle();
					},
					triggerIfInputFieldFocused: true,
					keepRegisteredWhenNotHighestContext: true,
					preventDefault: true,
				})
			: null;

		const sequencePropKeys = sequencePropShortcuts.map(({action, fieldKey}) =>
			keybindings.registerKeybinding({
				event: 'keydown',
				action,
				callback: (event) => {
					if (selectSequenceProp(fieldKey)) {
						event.preventDefault();
					}
				},
				preventDefault: false,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			}),
		);
		const render = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'render',
			callback: (event) => {
				if (event.defaultPrevented) return;
				openRenderModal();
				event.preventDefault();
			},
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const checkerboard = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'toggleCheckerboard',
			callback: (event) => {
				if (event.defaultPrevented) return;
				setCheckerboard((current) => !current);
				event.preventDefault();
			},
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const questionMark = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'showKeyboardShortcuts',
			callback: () => {
				setSelectedModal({
					type: 'settings',
					initialTab: 'shortcuts',
					initialPublicLicenseKey:
						window.remotion_renderDefaults?.publicLicenseKey ?? null,
				});
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const pageDown = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'nextComposition',
			callback: navigateToNextComposition,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const pageUp = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'previousComposition',
			callback: navigateToPreviousComposition,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const shiftMKey = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'toggleSnapping',
			callback: () => {
				setEditorSnapping((current) => !current);
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			for (const sequencePropKey of sequencePropKeys) {
				sequencePropKey.unregister();
			}

			render.unregister();
			checkerboard.unregister();

			questionMark.unregister();
			cmdKKey.unregister();
			cmdSKey.unregister();
			cmdIKey?.unregister();
			pageDown.unregister();
			pageUp.unregister();
			shiftMKey.unregister();
		};
	}, [
		keybindings,
		openRenderModal,
		selectSequenceProp,
		setCheckerboard,
		setEditorSnapping,
		setSelectedModal,
		navigateToNextComposition,
		navigateToPreviousComposition,
	]);

	return null;
};
