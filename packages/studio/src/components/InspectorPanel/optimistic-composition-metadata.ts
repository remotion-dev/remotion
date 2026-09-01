export type CompositionMetadataField =
	| 'durationInFrames'
	| 'fps'
	| 'height'
	| 'width';

export type PendingCompositionMetadataValue = {
	readonly baseline: object;
	readonly status: 'saving' | 'awaiting-hmr';
	readonly value: number;
};

export type PendingCompositionMetadata = Partial<
	Record<CompositionMetadataField, PendingCompositionMetadataValue>
>;

const removePendingValue = ({
	field,
	pending,
}: {
	readonly field: CompositionMetadataField;
	readonly pending: PendingCompositionMetadata;
}): PendingCompositionMetadata => {
	const {[field]: _removed, ...remaining} = pending;
	return remaining;
};

export const failPendingCompositionMetadataValue = ({
	field,
	pending,
	value,
}: {
	readonly field: CompositionMetadataField;
	readonly pending: PendingCompositionMetadata;
	readonly value: PendingCompositionMetadataValue;
}): PendingCompositionMetadata => {
	if (pending[field] !== value) {
		return pending;
	}

	return removePendingValue({field, pending});
};

export const acceptPendingCompositionMetadataValue = ({
	currentConfig,
	field,
	pending,
	value,
}: {
	readonly currentConfig: object;
	readonly field: CompositionMetadataField;
	readonly pending: PendingCompositionMetadata;
	readonly value: PendingCompositionMetadataValue;
}): PendingCompositionMetadata => {
	if (pending[field] !== value) {
		return pending;
	}

	if (currentConfig !== value.baseline) {
		return removePendingValue({field, pending});
	}

	return {
		...pending,
		[field]: {
			...value,
			status: 'awaiting-hmr',
		},
	};
};

export const reconcilePendingCompositionMetadata = ({
	currentConfig,
	pending,
}: {
	readonly currentConfig: object;
	readonly pending: PendingCompositionMetadata;
}): PendingCompositionMetadata => {
	let reconciled = pending;

	for (const field of Object.keys(pending) as CompositionMetadataField[]) {
		const value = pending[field];
		if (value?.status === 'awaiting-hmr' && value.baseline !== currentConfig) {
			reconciled = removePendingValue({field, pending: reconciled});
		}
	}

	return reconciled;
};
