import {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {saveSequenceProps} from './save-sequence-prop';

type SequenceNameSaveAction =
	| {
			type: 'noop';
	  }
	| {
			type: 'save';
			defaultValue: string | null;
	  };

export const getSequenceNameSaveAction = ({
	editedName,
	currentDisplayName,
	fallbackDisplayName,
	hasStaticNameProp,
}: {
	editedName: string;
	currentDisplayName: string;
	fallbackDisplayName: string;
	hasStaticNameProp: boolean;
}): SequenceNameSaveAction => {
	if (
		!hasStaticNameProp &&
		(editedName === '' || editedName === fallbackDisplayName)
	) {
		return {type: 'noop'};
	}

	if (hasStaticNameProp && editedName === currentDisplayName) {
		return {type: 'noop'};
	}

	return {
		type: 'save',
		defaultValue: editedName === '' ? JSON.stringify('') : null,
	};
};

export const useRenameSequence = ({
	clientId,
	nodePathInfo,
	sequence,
	validatedLocation,
}: {
	readonly clientId: string | null;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequence: TSequence;
	readonly validatedLocation: CodePosition | null;
}) => {
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const nodePath = nodePathInfo?.sequenceSubscriptionKey ?? null;

	const propStatusesForOverride = useMemo(() => {
		return nodePath
			? Internals.getPropStatusesCtx(propStatuses, nodePath)
			: undefined;
	}, [propStatuses, nodePath]);

	const codeNameStatus = propStatusesForOverride?.name;
	const fallbackDisplayName = sequence.controls?.componentName ?? '<Sequence>';
	const staticNamePropValue =
		codeNameStatus?.status === 'static' &&
		typeof codeNameStatus.codeValue === 'string'
			? codeNameStatus.codeValue
			: null;
	const hasStaticNameProp = staticNamePropValue !== null;

	const displayName = useMemo(() => {
		if (staticNamePropValue !== null) {
			return staticNamePropValue;
		}

		if (codeNameStatus?.status === 'static') {
			return fallbackDisplayName;
		}

		return sequence.displayName;
	}, [
		codeNameStatus?.status,
		fallbackDisplayName,
		sequence.displayName,
		staticNamePropValue,
	]);

	const canRename =
		clientId !== null &&
		!window.remotion_isReadOnlyStudio &&
		Boolean(sequence.controls) &&
		nodePath !== null &&
		validatedLocation !== null &&
		codeNameStatus !== undefined &&
		codeNameStatus !== null &&
		codeNameStatus.status === 'static';

	const saveName = useCallback(
		async (name: string) => {
			if (
				!canRename ||
				clientId === null ||
				!sequence.controls ||
				!nodePath ||
				!validatedLocation
			) {
				return;
			}

			const action = getSequenceNameSaveAction({
				editedName: name,
				currentDisplayName: displayName,
				fallbackDisplayName,
				hasStaticNameProp,
			});

			if (action.type === 'noop') {
				return;
			}

			await saveSequenceProps({
				addedKeyframes: null,
				movedKeyframes: null,
				changes: [
					{
						fileName: validatedLocation.source,
						nodePath,
						fieldKey: 'name',
						value: name,
						defaultValue: action.defaultValue,
						schema: sequence.controls.schema,
					},
				],
				setPropStatuses,
				clientId,
				undoLabel: 'Rename sequence',
				redoLabel: 'Rename sequence again',
			});
		},
		[
			canRename,
			clientId,
			displayName,
			fallbackDisplayName,
			hasStaticNameProp,
			nodePath,
			sequence.controls,
			setPropStatuses,
			validatedLocation,
		],
	);

	return {
		canRename,
		codeNameStatus,
		displayName,
		fallbackDisplayName,
		hasStaticNameProp,
		propStatusesForOverride,
		saveName,
	};
};
