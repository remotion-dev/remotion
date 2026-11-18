import {expect, test} from 'vitest';
import {
	parseLinearGradient,
	resolveColorStops,
} from '../drawing/parse-linear-gradient';
const positions = (stops: string) => {
	const gradient = parseLinearGradient(`linear-gradient(${stops})`);

	return gradient
		? resolveColorStops(gradient.colorStops, 100).map((stop) => stop.position)
		: null;
};

test('omitted endpoint stops span the full gradient (kino-ai/kino#4950)', () => {
	expect(
		positions(
			'rgba(255,255,255,0.8), rgba(255,255,255,0.2) 42%, rgba(255,255,255,0) 100%',
		),
	).toEqual([0, 0.42, 1]);
	expect(positions('red 20%, blue')).toEqual([0.2, 1]);
	expect(positions('red, green, blue')).toEqual([0, 0.5, 1]);
	expect(positions('red 20%, green, blue 80%')).toEqual([0.2, 0.5, 0.8]);
	expect(positions('red, green, blue 60%')).toEqual([0, 0.3, 0.6]);
});
