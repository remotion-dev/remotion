import {describe, expect, test} from 'bun:test';
import {Easing} from '../easing.js';
import {measureSpring, spring} from '../spring/index.js';

const numbersToTest = [-0.5, 0, 0.4, 0.5, 0.7, 1, 1.5];

// Matches clamping in `Easing.circle` / `Easing.bounce` for tests that compare to reference impls.
const clampUnit = (t: number): number => Math.min(1, Math.max(0, t));

describe('Easing step0', () => {
	const step0 = (n: number) => {
		return n > 0 ? 1 : 0;
	};

	const out = (n: number) => 1 - step0(1 - n);
	const inOut = (n: number) => {
		if (n >= 0.5) {
			return 1 - step0((1 - n) * 2) / 2;
		}

		return step0(n * 2) / 2;
	};

	test('Easing In', () => {
		const easingIn = Easing.in(Easing.step0);
		numbersToTest.forEach((n) => expect(easingIn(n)).toBe(step0(n)));
	});
	test('Easing Out', () => {
		const easingOut = Easing.out(Easing.step0);
		numbersToTest.forEach((n) => expect(easingOut(n)).toBe(out(n)));
	});
	test('Easing In Out', () => {
		const easingInOut = Easing.inOut(Easing.step0);
		numbersToTest.forEach((n) => expect(easingInOut(n)).toBe(inOut(n)));
	});
});

describe('Easing step1', () => {
	const step1 = (n: number) => {
		return n >= 1 ? 1 : 0;
	};

	const out = (n: number) => 1 - step1(1 - n);
	const inOut = (n: number) => {
		if (n >= 0.5) {
			return 1 - step1((1 - n) * 2) / 2;
		}

		return step1(n * 2) / 2;
	};

	test('Easing In', () => {
		const easingIn = Easing.in(Easing.step1);
		numbersToTest.forEach((n) => expect(easingIn(n)).toBe(step1(n)));
	});
	test('Easing Out', () => {
		const easingOut = Easing.out(Easing.step1);
		numbersToTest.forEach((n) => expect(easingOut(n)).toBe(out(n)));
	});
	test('Easing In Out', () => {
		const easingInOut = Easing.inOut(Easing.step1);
		numbersToTest.forEach((n) => expect(easingInOut(n)).toBe(inOut(n)));
	});
});

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
		}

		return quad(n * 2) / 2;
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
		}

		return cubic(n * 2) / 2;
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

describe('Easing Circle', () => {
	const circle = (n: number) => {
		const u = clampUnit(n);
		return 1 - Math.sqrt(1 - u * u);
	};

	const out = (n: number) => 1 - circle(1 - n);
	const inOut = (n: number) => {
		if (n >= 0.5) {
			return 1 - circle((1 - n) * 2) / 2;
		}

		return circle(n * 2) / 2;
	};

	test('Easing In', () => {
		const easingIn = Easing.in(Easing.circle);
		numbersToTest.forEach((n) => expect(easingIn(n)).toBe(circle(n)));
	});

	test('Easing In Out', () => {
		const easingOut = Easing.out(Easing.circle);
		numbersToTest.forEach((n) => expect(easingOut(n)).toBe(out(n)));
	});

	test('Easing Out', () => {
		const easingInOut = Easing.inOut(Easing.circle);
		numbersToTest.forEach((n) => expect(easingInOut(n)).toBe(inOut(n)));
	});
});

describe('Easing Exp', () => {
	const exp = (n: number) => 2 ** (10 * (n - 1));
	const out = (n: number) => 1 - exp(1 - n);
	const inOut = (n: number) => {
		if (n >= 0.5) {
			return 1 - exp((1 - n) * 2) / 2;
		}

		return exp(n * 2) / 2;
	};

	test('Easing In', () => {
		const easingIn = Easing.in(Easing.exp);
		numbersToTest.forEach((n) => expect(easingIn(n)).toBe(exp(n)));
	});

	test('Easing In Out', () => {
		const easingOut = Easing.out(Easing.exp);
		numbersToTest.forEach((n) => expect(easingOut(n)).toBe(out(n)));
	});

	test('Easing Out', () => {
		const easingInOut = Easing.inOut(Easing.exp);
		numbersToTest.forEach((n) => expect(easingInOut(n)).toBe(inOut(n)));
	});
});

describe('Easing Bounce', () => {
	const bounce = (n: number) => {
		const u = clampUnit(n);

		if (u < 1 / 2.75) {
			return 7.5625 * u * u;
		}

		if (u < 2 / 2.75) {
			const t2_ = u - 1.5 / 2.75;
			return 7.5625 * t2_ * t2_ + 0.75;
		}

		if (u < 2.5 / 2.75) {
			const t2_ = u - 2.25 / 2.75;
			return 7.5625 * t2_ * t2_ + 0.9375;
		}

		const t2 = u - 2.625 / 2.75;
		return 7.5625 * t2 * t2 + 0.984375;
	};

	const out = (n: number) => 1 - bounce(1 - n);
	const inOut = (n: number) => {
		if (n >= 0.5) {
			return 1 - bounce((1 - n) * 2) / 2;
		}

		return bounce(n * 2) / 2;
	};

	test('Easing In', () => {
		const easingIn = Easing.in(Easing.bounce);
		numbersToTest.forEach((n) => expect(easingIn(n)).toBe(bounce(n)));
	});

	test('Easing In Out', () => {
		const easingOut = Easing.out(Easing.bounce);
		numbersToTest.forEach((n) => expect(easingOut(n)).toBe(out(n)));
	});

	test('Easing Out', () => {
		const easingInOut = Easing.inOut(Easing.bounce);
		numbersToTest.forEach((n) => expect(easingInOut(n)).toBe(inOut(n)));
	});
});

describe('Easing spring', () => {
	test('matches a duration-stretched spring', () => {
		const config = {
			damping: 12,
			mass: 0.8,
			stiffness: 150,
		};
		const easing = Easing.spring(config);

		for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
			expect(easing(t)).toBe(
				spring({
					fps: 30,
					frame: t * 30,
					durationInFrames: 30,
					config,
				}),
			);
		}
	});

	test('supports a custom rest threshold', () => {
		const config = {
			damping: 200,
			mass: 1,
			stiffness: 100,
		};
		const durationRestThreshold = 0.1;
		const easing = Easing.spring({...config, durationRestThreshold});

		for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
			expect(easing(t)).toBe(
				spring({
					fps: 30,
					frame: t * 30,
					durationInFrames: 30,
					durationRestThreshold,
					config,
				}),
			);
		}
	});

	test('can leave a spring tail after the easing duration', () => {
		const config = {
			damping: 200,
			mass: 1,
			stiffness: 100,
		};
		const durationRestThreshold = 0.1;
		const easing = Easing.spring({
			...config,
			allowTail: true,
			durationRestThreshold,
		});
		const naturalDuration = measureSpring({
			fps: 30,
			config,
			threshold: durationRestThreshold,
		});

		expect(easing(0.5)).toBe(
			spring({
				fps: 30,
				frame: naturalDuration * 0.5,
				config,
			}),
		);
		expect(easing(1)).toBeLessThan(1);
		expect(easing(1.5)).toBeGreaterThan(easing(1));
		expect(easing(2)).toBeLessThanOrEqual(1);
	});

	test('clamps the endpoints', () => {
		const easing = Easing.spring();

		expect(easing(-1)).toBe(0);
		expect(easing(0)).toBe(0);
		expect(easing(1)).toBe(1);
		expect(easing(2)).toBe(1);
	});

	test('supports overshoot clamping', () => {
		expect(Easing.spring()(0.5)).toBeGreaterThan(1);
		expect(Easing.spring({overshootClamping: true})(0.5)).toBe(1);
	});
});
