import type {
	VisualControlHook,
	VisualControlsContextType,
} from './VisualControls';

export const getVisualControlEditedValue = ({
	state,
	hook,
	key,
}: {
	state: VisualControlsContextType;
	hook: VisualControlHook;
	key: string;
}) => {
	// TODO: What if z.null()
	return state.handles?.[hook.id]?.[key]?.unsavedValue ?? null;
};
