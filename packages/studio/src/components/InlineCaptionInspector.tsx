import type {CaptionPatch} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import type {SequenceControls, SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import type {CaptionData} from './caption-data';
import {CaptionInspector} from './CaptionInspector';
import {saveInlineCaptionPatches} from './Timeline/save-sequence-prop';

const serializeCaptions = (captions: CaptionData[]): string => {
	return JSON.stringify(captions);
};

const getCaptionPatches = ({
	previous,
	next,
}: {
	previous: CaptionData[];
	next: CaptionData[];
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
	readonly captions: CaptionData[];
	readonly controls: SequenceControls;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly readOnlyStudio: boolean;
	readonly validatedLocation: CodePosition;
}> = ({captions, controls, nodePath, readOnlyStudio, validatedLocation}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
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
	}, [captions, runtimeSignature]);

	const saveCaptions = useCallback(
		(nextCaptions: CaptionData[]) => {
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
		},
		[
			canSave,
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
			onTextChange={setDraftCaptions}
			onTextSave={saveCaptions}
			readOnly={!canSave}
			readOnlyTitle={canSave ? null : readOnlyTitle}
		/>
	);
};
