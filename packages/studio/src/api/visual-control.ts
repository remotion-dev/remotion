import {getRemotionEnvironment} from 'remotion';
import {
	visualControlRef,
	type VisualControlRef,
} from '../visual-controls/VisualControls';

export const visualControl: VisualControlRef['globalVisualControl'] = (
	key,
	value,
	schema,
) => {
	if (getRemotionEnvironment().isRendering) {
		return value;
	}

	if (!visualControlRef.current) {
		return value;
	}

	return visualControlRef.current.globalVisualControl(key, value, schema);
};
