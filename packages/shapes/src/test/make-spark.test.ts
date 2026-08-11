import {expect, test} from 'bun:test';
import {makeSpark} from '../utils/make-spark';

test('Should be able to make a spark path', () => {
	const spark = makeSpark({
		width: 200,
		height: 120,
	});

	expect(spark.width).toEqual(200);
	expect(spark.height).toEqual(120);
	expect(spark.transformOrigin).toEqual('100 60');
	expect(spark.instructions.length).toEqual(6);
	expect(spark.instructions[0]).toEqual({type: 'M', x: 100, y: 0});
	const firstCurve = spark.instructions[1];
	expect(firstCurve.type).toBe('C');
	if (firstCurve.type !== 'C') {
		throw new Error('Expected first curve to be cubic');
	}

	expect(firstCurve.cp1x).toBe(100);
	expect(firstCurve.cp1y).toBeCloseTo(33.13708498984761);
	expect(firstCurve.cp2x).toBeCloseTo(144.77152501692066);
	expect(firstCurve.cp2y).toBe(60);
	expect(firstCurve.x).toBe(200);
	expect(firstCurve.y).toBe(60);
	expect(spark.instructions[5]).toEqual({type: 'Z'});
	expect(spark.path).toContain('C 100 33.137084989847615');
});

test('Should support rounded points', () => {
	const spark = makeSpark({
		width: 200,
		height: 120,
		edgeRoundness: 0.8,
		cornerRadius: 12,
	});

	expect(spark.instructions.length).toEqual(10);
	expect(spark.instructions[0]).toEqual({type: 'M', x: 112, y: 12});
	expect(spark.path).toContain('C 204 48 204 72 188 72');
	expect(spark.path).not.toContain('NaN');
});

test('Should transition smoothly from edges into rounded points', () => {
	const spark = makeSpark({
		width: 200,
		height: 120,
		edgeRoundness: 0.8,
		cornerRadius: 12,
	});

	const topRightEdge = spark.instructions[1];
	const rightCap = spark.instructions[2];
	const rightBottomEdge = spark.instructions[3];

	if (
		topRightEdge.type !== 'C' ||
		rightCap.type !== 'C' ||
		rightBottomEdge.type !== 'C'
	) {
		throw new Error('Expected cubic instructions');
	}

	expect(topRightEdge.cp2y).toBe(topRightEdge.y);
	expect(rightCap.cp1y).toBe(topRightEdge.y);
	expect(rightCap.cp2y).toBe(rightCap.y);
	expect(rightBottomEdge.cp1y).toBe(rightCap.y);
});

test('Should cap corner radius at half the shortest side', () => {
	const spark = makeSpark({
		width: 100,
		height: 40,
		cornerRadius: 100,
	});

	expect(spark.instructions[0]).toEqual({type: 'M', x: 70, y: 20});
	expect(spark.path).not.toContain('NaN');
});
