import React, {useCallback, useContext, useState} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {getConnectedCompositions} from '../../helpers/get-connected-compositions';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {FilmIcon} from '../../icons/video';
import {SetSelectedModalContext} from '../../state/modals';
import {selectCompositionWhenReady} from '../InitialCompositionLoader';
import {showNotification} from '../Notifications/NotificationCenter';
import {precomposeJsxNodes} from '../precompose-jsx-nodes-api';
import {useResolvedStack} from '../Timeline/use-resolved-stack';
import {InspectorQuickAction} from './common';

const iconStyle: React.CSSProperties = {
	display: 'block',
	height: 16,
	width: 16,
};

export const SequencePrecomposeAction: React.FC<{
	readonly targets: readonly {
		readonly nodePathInfo: SequenceNodePathInfo;
		readonly displayName: string | null;
		readonly line: number | null;
		readonly singleChildComponent: unknown;
	}[];
	readonly sourceActionsDisabled: boolean;
}> = ({targets, sourceActionsDisabled}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const {width, height, fps, durationInFrames} = useVideoConfig();
	const [busy, setBusy] = useState(false);
	const browserStudioOperations = getBrowserStudioOperations();
	const compositionId =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const composition = compositions.find((item) => item.id === compositionId);
	const hasConnectedComposition = targets.some(
		({singleChildComponent}) =>
			getConnectedCompositions({compositions, singleChildComponent}).length > 0,
	);
	const resolvedCompositionLocation = useResolvedStack(
		composition?.stack ?? null,
	);
	const compositionFile =
		resolvedCompositionLocation?.source ??
		(compositionId && browserStudioOperations
			? browserStudioOperations.getCompositionFile(compositionId)
			: null);
	const canChangeSource =
		!sourceActionsDisabled &&
		(browserStudioOperations === null ||
			typeof browserStudioOperations.precomposeJsxNodes === 'function');

	const onPrecompose = useCallback(() => {
		if (
			busy ||
			!canChangeSource ||
			hasConnectedComposition ||
			targets.length === 0
		) {
			return;
		}

		const nodes = targets.map(({nodePathInfo}) => ({
			fileName: nodePathInfo.sequenceSubscriptionKey.absolutePath,
			nodePath: nodePathInfo.sequenceSubscriptionKey.nodePath,
		}));
		const modalTargets = targets.map(({nodePathInfo, displayName, line}) => ({
			fileName: nodePathInfo.sequenceSubscriptionKey.absolutePath,
			displayName,
			line,
		}));
		const openRefactorModal = () => {
			setSelectedModal({
				type: 'precompose-refactor',
				targets: modalTargets,
			});
		};

		if (compositionFile === null || compositionId === null) {
			openRefactorModal();
			return;
		}

		const request = {
			compositionFile,
			compositionId,
			existingCompositionIds: compositions.map(({id}) => id),
			metadata: {width, height, fps, durationInFrames},
		};

		const uniqueSourceNodes =
			targets.every(
				({nodePathInfo}) =>
					nodePathInfo.numberOfSequencesWithThisNodePath === 1,
			) &&
			new Set(nodes.map((node) => JSON.stringify(node))).size === nodes.length;

		if (!uniqueSourceNodes) {
			openRefactorModal();
			return;
		}

		if (nodes.some((node) => node.fileName !== nodes[0].fileName)) {
			openRefactorModal();
			return;
		}

		setBusy(true);
		precomposeJsxNodes({...request, nodes, dryRun: false})
			.then((result) => {
				if (!result.success) {
					showNotification(result.reason, 4000);
					return;
				}

				if (!result.canPrecompose) {
					openRefactorModal();
					return;
				}

				if (result.newCompositionId !== null) {
					selectCompositionWhenReady(result.newCompositionId);
				}
			})
			.catch((error) => {
				showNotification((error as Error).message, 4000);
			})
			.finally(() => setBusy(false));
	}, [
		busy,
		canChangeSource,
		compositionFile,
		compositionId,
		compositions,
		durationInFrames,
		fps,
		hasConnectedComposition,
		height,
		setSelectedModal,
		targets,
		width,
	]);

	if (!canChangeSource || hasConnectedComposition || targets.length === 0) {
		return null;
	}

	return (
		<InspectorQuickAction
			disabled={busy}
			onClick={onPrecompose}
			renderIcon={(color) => <FilmIcon color={color} style={iconStyle} />}
		>
			Pre-compose
		</InspectorQuickAction>
	);
};
