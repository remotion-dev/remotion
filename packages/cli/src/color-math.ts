import {Internals} from 'remotion';

export const colorWithNewOpacity = (color: string, opacity: number) => {
	const {r, g, b} = Internals.parseColor(color);
	if (opacity >= 255) {
		return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
	}

	return `rgba(${r}, ${g}, ${b}, ${(opacity / 255).toFixed(2)})`;
};
