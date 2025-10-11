import type {Handles} from './VisualControls';

export const getVisualControlEditedValue = ({
	handles,
	key,
}: {
	handles: Handles;
	key: string;
}): unknown => {
	// TODO: What if z.null()
	return handles?.[key]?.unsavedValue ?? null;
};
