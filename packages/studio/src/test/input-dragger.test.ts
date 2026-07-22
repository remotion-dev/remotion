import {expect, test} from 'bun:test';
import {
	deriveInputDraggerDragStartValue,
	deriveInputDraggerStep,
	deriveInputDraggerValueDiff,
	isInputDraggerValueInRange,
} from '../components/NewComposition/InputDragger';

test('drag sensitivity scales the value change', () => {
	const defaultDiff = deriveInputDraggerValueDiff({
		dragSensitivity: 1,
		step: 1,
		xDistance: 10,
	});
	const sensitiveDiff = deriveInputDraggerValueDiff({
		dragSensitivity: 3,
		step: 1,
		xDistance: 10,
	});

	expect(sensitiveDiff).toBe(defaultDiff * 3);
});

test('deriveInputDraggerStep disables HTML step validation if snapping is disabled', () => {
	expect(
		deriveInputDraggerStep({
			min: -Infinity,
			snapToStep: false,
			step: 1,
		}),
	).toBe('any');
});

test('deriveInputDraggerStep keeps configured step while snapping is enabled', () => {
	expect(
		deriveInputDraggerStep({
			min: -Infinity,
			snapToStep: true,
			step: 0.5,
		}),
	).toBe(0.5);
});

test('deriveInputDraggerDragStartValue falls back to a finite start value', () => {
	expect(
		deriveInputDraggerDragStartValue({
			min: -Infinity,
			value: undefined,
		}),
	).toBe(0);

	expect(
		deriveInputDraggerDragStartValue({
			min: 10,
			value: undefined,
		}),
	).toBe(10);

	expect(
		deriveInputDraggerDragStartValue({
			min: 10,
			value: 24,
		}),
	).toBe(24);
});

test('live input values must be within the configured range', () => {
	expect(
		isInputDraggerValueInRange({
			max: Infinity,
			min: 0.1,
			value: 0,
		}),
	).toBe(false);

	expect(
		isInputDraggerValueInRange({
			max: Infinity,
			min: 0.1,
			value: 0.1,
		}),
	).toBe(true);

	expect(
		isInputDraggerValueInRange({
			max: 10,
			min: -Infinity,
			value: 11,
		}),
	).toBe(false);
});
