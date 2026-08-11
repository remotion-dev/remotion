export type UvCoordinate = readonly [number, number];

export const publicUvToShaderUv = (
	uv: UvCoordinate,
): readonly [number, number] => {
	return [uv[0], 1 - uv[1]];
};
