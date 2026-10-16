import React, {useCallback, useContext, useState} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {UnwrapIcon} from '../../icons/unwrap';
import {SetSelectedModalContext} from '../../state/modals';
import {showNotification} from '../Notifications/NotificationCenter';
import {unwrapSequenceFromSource} from '../Timeline/unwrap-sequence-from-source';
import {InspectorQuickAction} from './common';

const iconStyle: React.CSSProperties = {
	display: 'block',
	height: 16,
	width: 16,
};

export const SequenceUnwrapAction: React.FC<{
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: TSequence;
	readonly sourceActionsDisabled: boolean;
	readonly sourceLocation: {readonly source: string; readonly line: number};
}> = ({nodePathInfo, sequence, sourceActionsDisabled, sourceLocation}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [busy, setBusy] = useState(false);
	const compositionId =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;

	const onUnwrap = useCallback(async () => {
		if (
			busy ||
			sourceActionsDisabled ||
			compositionId === null ||
			sequence.type !== 'sequence'
		) {
			return;
		}

		setBusy(true);
		try {
			await unwrapSequenceFromSource({
				compositionId,
				displayName:
					sequence.displayName || sequence.controls?.componentName || null,
				nodePath: nodePathInfo.sequenceSubscriptionKey,
				sourceLocation,
				setSelectedModal,
			});
		} catch (error) {
			showNotification((error as Error).message, 4000);
		} finally {
			setBusy(false);
		}
	}, [
		busy,
		sourceActionsDisabled,
		compositionId,
		sequence,
		nodePathInfo,
		sourceLocation,
		setSelectedModal,
	]);

	if (
		sourceActionsDisabled ||
		compositionId === null ||
		sequence.type !== 'sequence'
	) {
		return null;
	}

	return (
		<InspectorQuickAction
			disabled={busy}
			onClick={onUnwrap}
			aria-label="Unwrap: remove this element and keep its children"
			renderIcon={(color) => <UnwrapIcon color={color} style={iconStyle} />}
		>
			Unwrap
		</InspectorQuickAction>
	);
};
