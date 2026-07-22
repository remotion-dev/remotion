import type React from 'react';
import {useCallback, useContext, useEffect, useMemo} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {getStudioAskAIEnabled} from '../helpers/studio-runtime-config';
import {timelineNodePathInfoToKey} from '../helpers/timeline-node-path-key';
import {useKeybinding} from '../helpers/use-keybinding';
import {CheckerboardContext} from '../state/checkerboard';
import {EditorSnappingContext} from '../state/editor-snapping';
import {ModalsContext} from '../state/modals';
import {askAiModalRef} from './AskAiModal';
import {useCompositionNavigation} from './CompositionSelector';
import {showNotification} from './Notifications/NotificationCenter';
import {
	getTimelineSequenceSelectionKey,
	useCurrentTimelineSelectionStateAsRef,
} from './Timeline/TimelineSelection';

const sequencePropShortcuts: Record<string, string> = {
	p: 'style.translate',
	r: 'style.rotate',
	s: 'style.scale',
	t: 'style.opacity',
};

const hasOwnProperty = (obj: object, key: string) =>
	Object.prototype.hasOwnProperty.call(obj, key);

export const GlobalKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {setSelectedModal} = useContext(ModalsContext);
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

			const {schema, currentRuntimeValueDotNotation} = track.sequence.controls;
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
		const onSequencePropKey = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();
			const fieldKey = sequencePropShortcuts[key];
			if (!fieldKey) {
				return;
			}

			if (selectSequenceProp(fieldKey)) {
				event.preventDefault();
				return;
			}

			if (key === 't') {
				setCheckerboard((c) => !c);
				event.preventDefault();
				return;
			}

			if (key === 'r') {
				openRenderModal();
				event.preventDefault();
			}
		};

		const cmdKKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'k',
			callback: () => {
				setSelectedModal({
					type: 'quick-switcher',
					mode: 'compositions',
					invocationTimestamp: Date.now(),
				});
			},
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
			commandCtrlKey: true,
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
					key: 'i',
					callback: () => {
						askAiModalRef.current?.toggle();
					},
					triggerIfInputFieldFocused: true,
					keepRegisteredWhenNotHighestContext: true,
					commandCtrlKey: true,
					preventDefault: true,
				})
			: null;

		const sequencePropKeys = Object.keys(sequencePropShortcuts).map((key) =>
			keybindings.registerKeybinding({
				event: 'keydown',
				key,
				callback: onSequencePropKey,
				commandCtrlKey: false,
				preventDefault: false,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			}),
		);
		const questionMark = keybindings.registerKeybinding({
			event: 'keypress',
			key: '?',
			callback: () => {
				setSelectedModal({
					type: 'quick-switcher',
					mode: 'docs',
					invocationTimestamp: Date.now(),
				});
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const pageDown = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'PageDown',
			callback: navigateToNextComposition,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const pageUp = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'PageUp',
			callback: navigateToPreviousComposition,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const shiftMKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'm',
			callback: (event) => {
				if (!event.shiftKey) {
					return;
				}

				setEditorSnapping((current) => !current);
				event.preventDefault();
			},
			commandCtrlKey: false,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			for (const sequencePropKey of sequencePropKeys) {
				sequencePropKey.unregister();
			}

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
