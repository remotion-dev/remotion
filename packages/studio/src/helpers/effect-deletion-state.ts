let selectionRevision = 0;
export const getEffectDeletionSelectionRevision = () => selectionRevision;
export const invalidateEffectDeletionSelection = () => selectionRevision++;
