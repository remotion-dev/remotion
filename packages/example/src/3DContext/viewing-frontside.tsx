type Vector3 = [number, number, number];
type Matrix4x4 = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
];

export function isBacksideVisible(
	matrix: Matrix4x4,
	viewDirection: Vector3 = [0, 0, -1],
): boolean {
	// Extract the normal vector from the transformation matrix
	const normal: Vector3 = [matrix[2], matrix[6], matrix[10]];

	// Calculate the dot product of the normal vector and the view direction
	const dotProduct =
		normal[0] * viewDirection[0] +
		normal[1] * viewDirection[1] +
		normal[2] * viewDirection[2];

	// If the dot product is negative, the backside is visible
	return dotProduct >= 0;
}

export function isTopsideVisible(
	matrix: Matrix4x4,
	viewDirection: Vector3 = [0, 0, -1],
): boolean {
	// Extract the normal vector from the transformation matrix
	const normal: Vector3 = [matrix[1], matrix[5], matrix[9]];

	// Calculate the dot product of the normal vector and the view direction
	const dotProduct =
		normal[0] * viewDirection[0] +
		normal[1] * viewDirection[1] +
		normal[2] * viewDirection[2];

	// If the dot product is negative, the backside is visible
	return dotProduct < 0;
}
