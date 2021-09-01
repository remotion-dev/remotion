function gcd_two_numbers(x: number, y: number) {
	x = Math.abs(x);
	y = Math.abs(y);
	while (y) {
		const t = y;
		y = x % y;
		x = t;
	}

	return x;
}

export const aspectRatio = (width: number, height: number) => {
	const commonDivisor = gcd_two_numbers(width, height);
	return width / commonDivisor + ':' + height / commonDivisor;
};
