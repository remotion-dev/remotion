import {Easing} from '../easing';

const numbersToTest = [0, 0.4, 0.5, 0.7, 1];

describe('Easing linear', () => {
	test('Easing In', () => {
		const easingIn = Easing.in(Easing.linear);
		numbersToTest.forEach((n) => expect(easingIn(n)).toBe(n));
	});

	test('Easing In Out', () => {
		const easingOut = Easing.out(Easing.linear);
		numbersToTest.forEach((n) => expect(easingOut(n)).toBe(n));
	});

	test('Easing Out', () => {
		const easingInOut = Easing.inOut(Easing.linear);
		numbersToTest.forEach((n) => expect(easingInOut(n)).toBe(n));
	});
});

describe('Easing Quadratic', () => {
	const quad = (n: number) => n * n;
	const out = (n: number) => 1 - quad(1 - n);
	const inOut = (n: number) => {
		if (n >= 0.5) {
			return 1 - quad((1 - n) * 2) / 2;
		} else return quad(n * 2) / 2;
	};

	test('Easing In', () => {
		const easingIn = Easing.in(Easing.quad);
		numbersToTest.forEach((n) => expect(easingIn(n)).toBe(quad(n)));
	});

	test('Easing In Out', () => {
		const easingOut = Easing.out(Easing.quad);
		numbersToTest.forEach((n) => expect(easingOut(n)).toBe(out(n)));
	});

	test('Easing Out', () => {
		const easingInOut = Easing.inOut(Easing.quad);
		numbersToTest.forEach((n) => expect(easingInOut(n)).toBe(inOut(n)));
	});
});

describe('Easing Cubic', () => {
	const cubic = (n: number) => n * n * n;
	const out = (n: number) => 1 - cubic(1 - n);
	const inOut = (n: number) => {
		if (n >= 0.5) {
			return 1 - cubic((1 - n) * 2) / 2;
		} else return cubic(n * 2) / 2;
	};

	test('Easing In', () => {
		const easingIn = Easing.in(Easing.cubic);
		numbersToTest.forEach((n) => expect(easingIn(n)).toBe(cubic(n)));
	});

	test('Easing In Out', () => {
		const easingOut = Easing.out(Easing.cubic);
		numbersToTest.forEach((n) => expect(easingOut(n)).toBe(out(n)));
	});

	test('Easing Out', () => {
		const easingInOut = Easing.inOut(Easing.cubic);
		numbersToTest.forEach((n) => expect(easingInOut(n)).toBe(inOut(n)));
	});
});
