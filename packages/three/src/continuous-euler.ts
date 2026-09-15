const FULL_TURN = 2 * Math.PI;

const nearestTurn = (angle: number, previous: number) =>
	angle + FULL_TURN * Math.round((previous - angle) / FULL_TURN);

/** Choose the equivalent XYZ Euler pose nearest to the pose at drag start. */
export const continuousEuler = (
	current: readonly [number, number, number],
	previous: readonly [number, number, number],
): [number, number, number] => {
	const candidates: [number, number, number][] = [
		[...current],
		[current[0] + Math.PI, Math.PI - current[1], current[2] + Math.PI],
	];
	const aligned = candidates.map(
		(candidate) =>
			candidate.map((angle, index) => nearestTurn(angle, previous[index])) as [
				number,
				number,
				number,
			],
	);
	const distance = (candidate: readonly number[]) =>
		candidate.reduce(
			(sum, angle, index) => sum + (angle - previous[index]) ** 2,
			0,
		);
	return distance(aligned[0]) <= distance(aligned[1]) ? aligned[0] : aligned[1];
};
