import type {ZodColorType} from './editor/components/get-zod-if-possible';

export const colorWithNewOpacity = (
	color: string,
	opacity: number,
	zColor: ZodColorType
) => {
	const {r, g, b} = zColor.ZColorInternals.parseColor(color);
	if (opacity >= 255) {
		return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
	}

	return `rgba(${r}, ${g}, ${b}, ${(opacity / 255).toFixed(2)})`;
};
