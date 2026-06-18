import {expect, test} from 'bun:test';
import {
	deriveInputDraggerDragStartValue,
	deriveInputDraggerStep,
} from '../components/NewComposition/InputDragger';

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
