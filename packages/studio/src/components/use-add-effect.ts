import {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {canUseEffectOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {subscribeToExternalSourceChanges} from '../helpers/external-source-changes';
import {isStudioSelectionEnabled} from '../helpers/interactivity-enabled';
import {normalizeSourceFileName} from '../helpers/rebase-source-request';
import {subscribeToSequenceNodePathMutations} from '../helpers/sequence-node-path-mutations';
import {useConfirmationDialog} from './ConfirmationDialog';
import {addEffectToSequence} from './effect-drag-and-drop';
import {showNotification} from './Notifications/NotificationCenter';
import {useCurrentTimelineSelectionStateAsRef} from './Timeline/TimelineSelection';
import {usePrepareHtmlInCanvasWrap} from './use-prepare-html-in-canvas-wrap';

export const useAddEffect = () => {
	const confirm = useConfirmationDialog();
	const prepareWrap = usePrepareHtmlInCanvasWrap();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const compositionManagerRef = useContext(
		Internals.CompositionManagerRefContext,
	);

	return useCallback(
		async ({
			effect,
			nodePathInfo,
		}: Pick<
			Parameters<typeof addEffectToSequence>[0],
			'effect' | 'nodePathInfo'
		>) => {
			if (
				previewServerState.type !== 'connected' ||
				!isStudioSelectionEnabled() ||
				!canUseEffectOperations()
			) {
				return;
			}

			let sourceChanged = false;
			const fileName = nodePathInfo.sequenceSubscriptionKey.absolutePath;
			const unsubscribe = subscribeToExternalSourceChanges((file) => {
				if (
					normalizeSourceFileName(file, '') ===
					normalizeSourceFileName(fileName, '')
				) {
					sourceChanged = true;
				}
			});
			const unsubscribeFromMutations = subscribeToSequenceNodePathMutations(
				(mutation) => {
					if (
						mutation.files.some(({absolutePath}) => absolutePath === fileName)
					)
						sourceChanged = true;
				},
			);
			const {canvasContent} = compositionManagerRef.current;
			let pending: ReturnType<typeof showNotification> | null = null;
			try {
				let wrapInHtmlInCanvas = null;
				if (!nodePathInfo.supportsEffects) {
					const prepared = await prepareWrap({
						nodePathInfo,
						wrapper: 'HtmlInCanvas',
						effect,
						sourceLocation: null,
					});
					if (prepared === null) return;
					const confirmed = await confirm({
						title: 'Add effect with HTML-in-canvas',
						message: `To apply ${effect.name}() to this element, it needs to be wrapped in <HtmlInCanvas>.`,
						confirmLabel: 'Wrap and add effect',
						cancelLabel: 'Cancel',
					});
					if (!confirmed) return;
					if (
						sourceChanged ||
						compositionManagerRef.current.canvasContent !== canvasContent
					) {
						throw new Error(
							'The source or composition changed. Select the element and add the effect again.',
						);
					}

					wrapInHtmlInCanvas = prepared;
					pending = showNotification(
						'Wrapping element and adding effect…',
						null,
					);
				}

				await addEffectToSequence({
					clientId: previewServerState.clientId,
					effect,
					fileName,
					nodePathInfo,
					selectItems: currentSelection.current.selectItems,
					wrapInHtmlInCanvas,
				});
			} catch (error) {
				showNotification((error as Error).message, 4000);
			} finally {
				pending?.dismiss();
				unsubscribe();
				unsubscribeFromMutations();
			}
		},
		[
			compositionManagerRef,
			confirm,
			currentSelection,
			prepareWrap,
			previewServerState,
		],
	);
};
