import {Internals} from 'remotion';

export const parseColor = (value: string) => {
	const colored = Internals.processColor(value).toString(16).padStart(8, '0');

	const opacity = parseInt(colored.slice(0, 2), 16);

	const r = parseInt(colored.slice(2, 4), 16);
	const g = parseInt(colored.slice(4, 6), 16);
	const b = parseInt(colored.slice(6, 8), 16);

	return {a: opacity, r, g, b};
};

export const colorWithNewOpacity = (color: string, opacity: number) => {
	const {r, g, b} = parseColor(color);
	if (opacity >= 255) {
		return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
	}

	return `rgba(${r}, ${g}, ${b}, ${(opacity / 255).toFixed(3)})`;
};
