import type {Caption} from '@remotion/captions';
import type {CaptionPatch} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import type {
	SequencePropsSubscriptionKey,
	SequenceRegistrationControls,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {CaptionInspector} from './CaptionInspector';
import {saveInlineCaptionPatches} from './Timeline/save-sequence-prop';

const serializeCaptions = (captions: Caption[]): string => {
	return JSON.stringify(captions);
};

const getCaptionPatches = ({
	previous,
	next,
}: {
	previous: Caption[];
	next: Caption[];
}): CaptionPatch[] | null => {
	if (previous.length !== next.length) {
		return null;
	}

	const patches: CaptionPatch[] = [];
	for (const [index, before] of previous.entries()) {
		const after = next[index];
		if (!after) {
			return null;
		}

		if (before.text !== after.text) {
			patches.push({
				index,
				before,
				changes: {text: after.text},
			});
		}
	}

	return patches;
};

export const InlineCaptionInspector: React.FC<{
	readonly captions: Caption[];
	readonly controls: SequenceRegistrationControls;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly readOnlyStudio: boolean;
	readonly validatedLocation: CodePosition;
}> = ({captions, controls, nodePath, readOnlyStudio, validatedLocation}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const captionStatus = Internals.getPropStatusesCtx(
		propStatuses,
		nodePath,
	)?.captions;
	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;
	const canSave =
		!readOnlyStudio && clientId !== null && captionStatus?.status === 'static';
	const [draftCaptions, setDraftCaptions] = useState(captions);
	const savedCaptions = useRef(captions);
	const runtimeSignature = serializeCaptions(captions);
	const lastRuntimeSignature = useRef(runtimeSignature);

	useEffect(() => {
		if (lastRuntimeSignature.current === runtimeSignature) {
			return;
		}

		lastRuntimeSignature.current = runtimeSignature;
		savedCaptions.current = captions;
		setDraftCaptions(captions);
		clearDragOverrides(nodePath);
	}, [captions, clearDragOverrides, nodePath, runtimeSignature]);

	const updateCaptions = useCallback(
		(nextCaptions: Caption[]) => {
			setDraftCaptions(nextCaptions);
			setDragOverrides(
				nodePath,
				'captions',
				Internals.makeStaticDragOverride(nextCaptions),
			);
		},
		[nodePath, setDragOverrides],
	);

	const cancelCaptions = useCallback(() => {
		setDraftCaptions(savedCaptions.current);
		clearDragOverrides(nodePath);
	}, [clearDragOverrides, nodePath]);

	const saveCaptions = useCallback(
		(nextCaptions: Caption[]) => {
			const patches = getCaptionPatches({
				previous: savedCaptions.current,
				next: nextCaptions,
			});
			setDraftCaptions(nextCaptions);

			if (
				!canSave ||
				clientId === null ||
				patches === null ||
				patches.length === 0
			) {
				clearDragOverrides(nodePath);
				return;
			}

			savedCaptions.current = nextCaptions;
			saveInlineCaptionPatches({
				fileName: validatedLocation.source,
				nodePath,
				schema: controls.schema,
				patches,
				nextCaptions,
				setPropStatuses,
				clientId,
				undoLabel: 'Update captions',
				redoLabel: 'Update captions again',
			});
			clearDragOverrides(nodePath);
		},
		[
			canSave,
			clearDragOverrides,
			clientId,
			controls.schema,
			nodePath,
			setPropStatuses,
			validatedLocation.source,
		],
	);

	const readOnlyTitle = readOnlyStudio
		? 'Caption editing is unavailable in read-only Studio'
		: clientId === null
			? 'Caption editing requires a Studio server connection'
			: captionStatus?.status === 'computed'
				? 'Captions must be a direct inline JSX array to edit them'
				: 'Captions are not ready for editing';

	return (
		<CaptionInspector
			captions={draftCaptions}
			onTextChange={updateCaptions}
			onTextSave={saveCaptions}
			onTextCancel={cancelCaptions}
			readOnly={!canSave}
			readOnlyTitle={canSave ? null : readOnlyTitle}
		/>
	);
};
