import {expect, test} from 'bun:test';
import {Euler, Quaternion} from 'three';
import {continuousEuler} from './continuous-euler';

test('keeps a Y rotation continuous past the canonical Euler flip', () => {
	const canonical: [number, number, number] = [
		Math.PI,
		(-60 * Math.PI) / 180,
		Math.PI,
	];
	const result = continuousEuler(canonical, [0, 0, 0]);
	expect(result[0]).toBeCloseTo(0);
	expect(result[1]).toBeCloseTo((-120 * Math.PI) / 180);
	expect(result[2]).toBeCloseTo(0);
	const canonicalQuaternion = new Quaternion().setFromEuler(
		new Euler(...canonical, 'XYZ'),
	);
	const resultQuaternion = new Quaternion().setFromEuler(
		new Euler(...result, 'XYZ'),
	);
	expect(canonicalQuaternion.angleTo(resultQuaternion)).toBeCloseTo(0);
});

test('unwraps a Z rotation across a full turn without changing its pose', () => {
	const canonical: [number, number, number] = [0, 0, -0.1];
	const result = continuousEuler(canonical, [0, 0, 2 * Math.PI - 0.2]);
	expect(result[2]).toBeCloseTo(2 * Math.PI - 0.1);
	const q1 = new Quaternion().setFromEuler(new Euler(...canonical, 'XYZ'));
	const q2 = new Quaternion().setFromEuler(new Euler(...result, 'XYZ'));
	expect(q1.angleTo(q2)).toBeCloseTo(0);
});
