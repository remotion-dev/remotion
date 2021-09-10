export const BACKGROUND = '#222';
export const BORDER_COLOR = '#000';
export const SELECTED_BACKGROUND = 'hsla(0, 0%, 100%, 0.15)';
export const LIGHT_TEXT = 'rgba(255, 255, 255, 0.6)';
export const SELECTED_HOVER_BACKGROUND = 'hsla(0, 0%, 100%, 0.25)';
export const CLEAR_HOVER = 'rgba(255, 255, 255, 0.06)';

export const getBackgroundFromHoverState = ({
	selected,
	hovered,
}: {
	selected: boolean;
	hovered: boolean;
}) => {
	if (selected) {
		if (hovered) {
			return SELECTED_HOVER_BACKGROUND;
		}

		return SELECTED_BACKGROUND;
	}

	if (hovered) {
		return CLEAR_HOVER;
	}

	return 'transparent';
};
