import type {Handles} from './VisualControls';

export const getVisualControlEditedValue = ({
	handles,
	key,
}: {
	handles: Handles;
	key: string;
}): unknown => {
	const handle = handles?.[key];
	if (handle === undefined) {
		return null;
	}

	return handle.unsavedValue;
};
