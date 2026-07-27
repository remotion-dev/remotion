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
import {CaptionInspector, type CaptionSaveStatus} from './CaptionInspector';
import {saveInlineCaptionPatchesWithError} from './Timeline/save-sequence-prop';

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
	const [saveStatus, setSaveStatus] = useState<CaptionSaveStatus>(
		canSave ? {type: 'saved'} : {type: 'read-only'},
	);
	const runtimeSignature = serializeCaptions(captions);
	const lastRuntimeSignature = useRef(runtimeSignature);
	const savedCaptions = useRef(captions);
	const pendingSignature = useRef<string | null>(null);
	const draftIsDirty = useRef(false);
	const saveRevision = useRef(0);

	useEffect(() => {
		if (lastRuntimeSignature.current === runtimeSignature) {
			return;
		}

		lastRuntimeSignature.current = runtimeSignature;
		const pendingSaveWasConfirmed =
			pendingSignature.current === runtimeSignature;
		if (draftIsDirty.current && !pendingSaveWasConfirmed) {
			return;
		}

		draftIsDirty.current = false;
		pendingSignature.current = null;
		savedCaptions.current = captions;
		setDraftCaptions(captions);
		if (pendingSaveWasConfirmed && canSave) {
			setSaveStatus({type: 'saved'});
		}
	}, [canSave, captions, runtimeSignature]);

	useEffect(() => {
		if (!canSave) {
			saveRevision.current += 1;
			pendingSignature.current = null;
			draftIsDirty.current = false;
			savedCaptions.current = captions;
			setDraftCaptions(captions);
			setSaveStatus({type: 'read-only'});
			return;
		}

		if (pendingSignature.current === null) {
			setSaveStatus({type: 'saved'});
		}
	}, [canSave, captions]);

	const saveCaptions = useCallback(
		(nextCaptions: CaptionData[]) => {
			const patches = getCaptionPatches({
				previous: savedCaptions.current,
				next: nextCaptions,
			});
			setDraftCaptions(nextCaptions);
			const nextSignature = serializeCaptions(nextCaptions);
			if (nextSignature === lastRuntimeSignature.current) {
				draftIsDirty.current = false;
				pendingSignature.current = null;
				setSaveStatus(canSave ? {type: 'saved'} : {type: 'read-only'});
				return;
			}

			if (!canSave || clientId === null) {
				return;
			}

			if (patches === null) {
				setSaveStatus({
					type: 'error',
					message: 'Adding or removing inline captions is not supported',
				});
				return;
			}

			if (patches.length === 0) {
				return;
			}

			draftIsDirty.current = true;
			savedCaptions.current = nextCaptions;
			pendingSignature.current = nextSignature;
			setSaveStatus({type: 'saving'});
			const currentSaveRevision = saveRevision.current + 1;
			saveRevision.current = currentSaveRevision;
			let saveFailed = false;
			saveInlineCaptionPatchesWithError({
				fileName: validatedLocation.source,
				nodePath,
				schema: controls.schema,
				patches,
				nextCaptions,
				setPropStatuses,
				clientId,
				undoLabel: 'Update captions',
				redoLabel: 'Update captions again',
				onError: (error) => {
					saveFailed = true;
					if (
						saveRevision.current !== currentSaveRevision ||
						pendingSignature.current !== nextSignature
					) {
						return;
					}

					savedCaptions.current = captions;
					setSaveStatus({
						type: 'error',
						message: error instanceof Error ? error.message : String(error),
					});
				},
			}).then(() => {
				if (
					!saveFailed &&
					saveRevision.current === currentSaveRevision &&
					pendingSignature.current === nextSignature
				) {
					lastRuntimeSignature.current = nextSignature;
					draftIsDirty.current = false;
					pendingSignature.current = null;
					setSaveStatus({type: 'saved'});
				}
			});
		},
		[
			canSave,
			clientId,
			captions,
			controls.schema,
			nodePath,
			setPropStatuses,
			validatedLocation.source,
		],
	);

	const onTextChange = useCallback((nextCaptions: CaptionData[]) => {
		draftIsDirty.current = true;
		setDraftCaptions(nextCaptions);
	}, []);

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
			onTextChange={onTextChange}
			onTextSave={saveCaptions}
			readOnlyTitle={canSave ? null : readOnlyTitle}
			saveStatus={saveStatus}
		/>
	);
};
