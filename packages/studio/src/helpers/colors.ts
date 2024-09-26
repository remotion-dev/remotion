export const BACKGROUND = 'rgb(31,36,40)';
export const BACKGROUND__TRANSPARENT = 'rgba(31,36,40, 0)';
export const INPUT_BACKGROUND = '#2f363d';
export const BORDER_COLOR = '#000';
export const LIGHT_COLOR = '#ddd';
export const SELECTED_BACKGROUND = 'hsla(0, 0%, 100%, 0.15)';
export const LIGHT_TEXT = '#A6A7A9';
export const RULER_COLOR = '#808080';
export const VERY_LIGHT_TEXT = 'rgba(255, 255, 255, 0.3)';
const SELECTED_HOVER_BACKGROUND = 'hsla(0, 0%, 100%, 0.25)';
export const CLEAR_HOVER = 'rgba(255, 255, 255, 0.06)';
export const INPUT_BORDER_COLOR_UNHOVERED = 'rgba(0, 0, 0, 0.6)';
export const INPUT_BORDER_COLOR_HOVERED = 'rgba(255, 255, 255, 0.05)';
export const TIMELINE_BACKGROUND = '#111';
export const FAIL_COLOR = '#ff3232';
export const TEXT_COLOR = '#fff';
export const WARNING_COLOR = '#f1c40f';
export const BLUE = '#0b84f3';
export const BLUE_DISABLED = '#284f73';
export const LIGHT_TRANSPARENT = 'rgba(255, 255, 255, 0.7)';
export const UNSELECTED_GUIDE = '#7e1219';
export const SELECTED_GUIDE = '#d22d3a';
export const LINE_COLOR = '#363A3E';
export const TIMELINE_TRACK_SEPARATOR = 'rgba(0, 0, 0, 0.3)';

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
