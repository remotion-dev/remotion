import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusStatic,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';

const isStaticSequenceNameStatus = (
	status: CanUpdateSequencePropStatus | null | undefined,
): status is CanUpdateSequencePropStatusStatic => {
	return status !== undefined && status !== null && status.status === 'static';
};

export const getSequenceDisplayName = ({
	codeNameStatus,
	fallbackName,
}: {
	readonly codeNameStatus: CanUpdateSequencePropStatus | null | undefined;
	readonly fallbackName: string;
}) => {
	if (
		isStaticSequenceNameStatus(codeNameStatus) &&
		typeof codeNameStatus.codeValue === 'string'
	) {
		return codeNameStatus.codeValue;
	}

	return fallbackName;
};

export const canRenameSequence = ({
	codeNameStatus,
	nodePath,
	previewConnected,
	readOnlyStudio,
	sequence,
	validatedLocation,
}: {
	readonly codeNameStatus: CanUpdateSequencePropStatus | null | undefined;
	readonly nodePath: SequencePropsSubscriptionKey | null;
	readonly previewConnected: boolean;
	readonly readOnlyStudio: boolean;
	readonly sequence: TSequence;
	readonly validatedLocation: unknown | null;
}) => {
	return (
		previewConnected &&
		!readOnlyStudio &&
		Boolean(sequence.controls) &&
		nodePath !== null &&
		validatedLocation !== null &&
		isStaticSequenceNameStatus(codeNameStatus)
	);
};
