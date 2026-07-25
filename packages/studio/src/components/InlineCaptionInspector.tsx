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
import type {CaptionJson} from './caption-json';
import {CaptionInspector, type CaptionSaveStatus} from './CaptionInspector';
import {saveSequencePropsWithError} from './Timeline/save-sequence-prop';

const serializeCaptions = (captions: CaptionJson[]) => JSON.stringify(captions);

export const InlineCaptionInspector: React.FC<{
	readonly captions: CaptionJson[];
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
			setDraftCaptions(captions);
			setSaveStatus({type: 'read-only'});
			return;
		}

		if (pendingSignature.current === null) {
			setSaveStatus({type: 'saved'});
		}
	}, [canSave, captions]);

	const saveCaptions = useCallback(
		(nextCaptions: CaptionJson[]) => {
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

			draftIsDirty.current = true;
			pendingSignature.current = nextSignature;
			setSaveStatus({type: 'saving'});
			const currentSaveRevision = saveRevision.current + 1;
			saveRevision.current = currentSaveRevision;
			let saveFailed = false;
			saveSequencePropsWithError({
				addedKeyframes: null,
				movedKeyframes: null,
				changes: [
					{
						fileName: validatedLocation.source,
						nodePath,
						fieldKey: 'captions',
						value: nextCaptions,
						defaultValue: null,
						schema: controls.schema,
					},
				],
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
					// The queue resolves after the Studio server confirms the source edit.
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
			controls.schema,
			nodePath,
			setPropStatuses,
			validatedLocation.source,
		],
	);

	const onTextChange = useCallback((nextCaptions: CaptionJson[]) => {
		draftIsDirty.current = true;
		setDraftCaptions(nextCaptions);
	}, []);

	const readOnlyTitle = readOnlyStudio
		? 'Caption editing is unavailable in read-only Studio'
		: clientId === null
			? 'Caption editing requires a Studio server connection'
			: captionStatus?.status === 'computed'
				? 'Captions must be an inline JSX array to edit them'
				: 'Captions are not ready for editing';

	return (
		<CaptionInspector
			captions={draftCaptions}
			onTextChange={onTextChange}
			onTextChangeEnd={saveCaptions}
			onTimingChange={saveCaptions}
			readOnlyTitle={canSave ? null : readOnlyTitle}
			saveStatus={saveStatus}
		/>
	);
};
