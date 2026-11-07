export class OpenTimelineTime {
	private readonly numerator: bigint;
	private readonly denominator: bigint;

	private constructor(numerator: bigint, denominator: bigint) {
		let a = numerator < 0n ? -numerator : numerator;
		let b = denominator < 0n ? -denominator : denominator;
		while (b !== 0n) {
			[a, b] = [b, a % b];
		}

		const divisor = denominator < 0n ? -a : a;
		this.numerator = numerator / divisor;
		this.denominator = denominator / divisor;
	}

	static fromNumber(value: number): OpenTimelineTime {
		const [mantissa, exponent = '0'] = String(value).split('e');
		const [whole, fraction = ''] = mantissa.split('.');
		const power = Number(exponent) - fraction.length;
		const digits = BigInt(whole + fraction);
		return power >= 0
			? new OpenTimelineTime(digits * 10n ** BigInt(power), 1n)
			: new OpenTimelineTime(digits, 10n ** BigInt(-power));
	}

	add(other: OpenTimelineTime): OpenTimelineTime {
		return new OpenTimelineTime(
			this.numerator * other.denominator + other.numerator * this.denominator,
			this.denominator * other.denominator,
		);
	}

	subtract(other: OpenTimelineTime): OpenTimelineTime {
		return new OpenTimelineTime(
			this.numerator * other.denominator - other.numerator * this.denominator,
			this.denominator * other.denominator,
		);
	}

	multiply(value: number): OpenTimelineTime {
		const other = OpenTimelineTime.fromNumber(value);
		return new OpenTimelineTime(
			this.numerator * other.numerator,
			this.denominator * other.denominator,
		);
	}

	divide(value: number): OpenTimelineTime {
		const other = OpenTimelineTime.fromNumber(value);
		return new OpenTimelineTime(
			this.numerator * other.denominator,
			this.denominator * other.numerator,
		);
	}

	compare(other: OpenTimelineTime): number {
		const difference =
			this.numerator * other.denominator - other.numerator * this.denominator;
		return difference < 0n ? -1 : difference > 0n ? 1 : 0;
	}

	toNumber(): number {
		if (this.numerator === 0n) return 0;
		const negative = this.numerator < 0n;
		let numerator = negative ? -this.numerator : this.numerator;
		let {denominator} = this;
		let exponent =
			numerator.toString(2).length - denominator.toString(2).length;
		if (
			exponent >= 0
				? numerator < denominator << BigInt(exponent)
				: numerator << BigInt(-exponent) < denominator
		) {
			exponent--;
		}

		if (exponent > 1023) return negative ? -Infinity : Infinity;
		const shift = 52 - Math.max(exponent, -1022);
		if (shift >= 0) numerator <<= BigInt(shift);
		else denominator <<= BigInt(-shift);
		let significand = numerator / denominator;
		const remainder = (numerator % denominator) * 2n;
		if (
			remainder > denominator ||
			(remainder === denominator && significand % 2n !== 0n)
		) {
			significand++;
		}

		return (negative ? -1 : 1) * Number(significand) * 2 ** -shift;
	}

	ceil(): number {
		const integer = this.numerator / this.denominator;
		return Number(integer + (this.numerator % this.denominator > 0n ? 1n : 0n));
	}
}

export const ZERO_TIME = OpenTimelineTime.fromNumber(0);
