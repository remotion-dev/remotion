import type {Handles, VisualControlHook} from './VisualControls';

export const getVisualControlEditedValue = ({
	handles,
	hook,
	key,
}: {
	handles: Handles;
	hook: VisualControlHook;
	key: string;
}): unknown => {
	// TODO: What if z.null()
	return handles?.[hook.id]?.[key]?.unsavedValue ?? null;
};
