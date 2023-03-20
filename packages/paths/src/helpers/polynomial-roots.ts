const POLYNOMIAL_TOLERANCE = 1e-6;

export function getCubicRoots(C0: number, C1: number, C2: number, C3: number) {
	const results: number[] = [];
	const c3 = C3;
	const c2 = C2 / c3;
	const c1 = C1 / c3;
	const c0 = C0 / c3;

	const a = (3 * c1 - c2 * c2) / 3;
	const b = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
	const offset = c2 / 3;
	let discrim = (b * b) / 4 + (a * a * a) / 27;
	const halfB = b / 2;
	let tmp;
	let root;

	if (Math.abs(discrim) <= POLYNOMIAL_TOLERANCE) discrim = 0;

	if (discrim > 0) {
		const e = Math.sqrt(discrim);

		tmp = -halfB + e;
		if (tmp >= 0) root = tmp ** (1 / 3);
		else root = -((-tmp) ** (1 / 3));

		tmp = -halfB - e;
		if (tmp >= 0) root += tmp ** (1 / 3);
		else root -= (-tmp) ** (1 / 3);

		results.push(root - offset);
	} else if (discrim < 0) {
		const distance = Math.sqrt(-a / 3);
		const angle = Math.atan2(Math.sqrt(-discrim), -halfB) / 3;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const sqrt3 = Math.sqrt(3);

		results.push(2 * distance * cos - offset);
		results.push(-distance * (cos + sqrt3 * sin) - offset);
		results.push(-distance * (cos - sqrt3 * sin) - offset);
	} else {
		if (halfB >= 0) tmp = -(halfB ** (1 / 3));
		else tmp = (-halfB) ** (1 / 3);

		results.push(2 * tmp - offset);
		// really should return next root twice, but we return only one
		results.push(-tmp - offset);
	}

	return results;
}
