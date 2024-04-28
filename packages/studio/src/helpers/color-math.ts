import type {ZodTypesType} from '../components/get-zod-if-possible';

export const colorWithNewOpacity = (
	color: string,
	opacity: number,
	zodTypes: ZodTypesType,
) => {
	const {r, g, b} = zodTypes.ZodZypesInternals.parseColor(color);
	if (opacity >= 255) {
		return `#${r.toString(16).padStart(2, '0')}${g
			.toString(16)
			.padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	return `rgba(${r}, ${g}, ${b}, ${(opacity / 255).toFixed(2)})`;
};
