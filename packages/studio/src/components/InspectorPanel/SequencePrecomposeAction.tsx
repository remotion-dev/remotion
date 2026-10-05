import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {getConnectedCompositions} from '../../helpers/get-connected-compositions';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {FilmIcon} from '../../icons/video';
import {SetSelectedModalContext} from '../../state/modals';
import {
	getCurrentDimensions,
	getCurrentDuration,
	getCurrentFps,
} from '../Timeline/imperative-state';
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
		if (!canChangeSource || hasConnectedComposition || targets.length === 0) {
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
			metadata: {
				...getCurrentDimensions(),
				fps: getCurrentFps(),
				durationInFrames: getCurrentDuration(),
			},
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

		setSelectedModal({
			type: 'precompose-name',
			request: {...request, nodes, dryRun: false},
			targets: modalTargets,
		});
	}, [
		canChangeSource,
		compositionFile,
		compositionId,
		compositions,
		hasConnectedComposition,
		setSelectedModal,
		targets,
	]);

	if (!canChangeSource || hasConnectedComposition || targets.length === 0) {
		return null;
	}

	return (
		<InspectorQuickAction
			disabled={false}
			onClick={onPrecompose}
			renderIcon={(color) => <FilmIcon color={color} style={iconStyle} />}
		>
			Pre-compose
		</InspectorQuickAction>
	);
};
