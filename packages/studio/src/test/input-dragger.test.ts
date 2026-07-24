import {expect, test} from 'bun:test';
import {
	deriveInputDraggerArrowValue,
	deriveInputDraggerDragStartValue,
	deriveInputDraggerStep,
	deriveInputDraggerValueDiff,
	isInputDraggerValueAlignedToStep,
	isInputDraggerValueInRange,
	parseInputDraggerNumber,
	validateInputDraggerValue,
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

test('text input values are parsed as finite decimal numbers', () => {
	expect(parseInputDraggerNumber('-12.5')).toBe(-12.5);
	expect(parseInputDraggerNumber('.5')).toBe(0.5);
	expect(parseInputDraggerNumber('1e3')).toBe(1000);
	expect(parseInputDraggerNumber(' 20 ')).toBe(20);
	expect(parseInputDraggerNumber('')).toBeNull();
	expect(parseInputDraggerNumber('Infinity')).toBeNull();
	expect(parseInputDraggerNumber('0x10')).toBeNull();
	expect(parseInputDraggerNumber('12px')).toBeNull();
});

test('text input values retain range and step validation', () => {
	expect(
		validateInputDraggerValue({
			max: 10,
			min: 0,
			step: 0.5,
			value: '2.5',
		}),
	).toEqual({valid: true, value: 2.5});
	expect(
		validateInputDraggerValue({
			max: 10,
			min: 0,
			step: 0.5,
			value: '10.5',
		}).valid,
	).toBe(false);
	expect(
		validateInputDraggerValue({
			max: 10,
			min: 0,
			step: 0.5,
			value: '2.25',
		}).valid,
	).toBe(false);
	expect(
		validateInputDraggerValue({
			max: Infinity,
			min: -Infinity,
			step: 'any',
			value: '2.25',
		}),
	).toEqual({valid: true, value: 2.25});
});

test('step validation tolerates floating point imprecision', () => {
	expect(
		isInputDraggerValueAlignedToStep({
			min: 0,
			step: 0.1,
			value: 0.1 + 0.2,
		}),
	).toBe(true);
});

test('arrow keys step values and respect bounds', () => {
	expect(
		deriveInputDraggerArrowValue({
			direction: 1,
			max: 1,
			min: 0,
			step: 0.1,
			value: 0.2,
		}),
	).toBe(0.3);
	expect(
		deriveInputDraggerArrowValue({
			direction: -1,
			max: 1,
			min: 0,
			step: 0.1,
			value: 0,
		}),
	).toBe(0);
	expect(
		deriveInputDraggerArrowValue({
			direction: 1,
			max: 1,
			min: 0,
			step: 'any',
			value: 0.5,
		}),
	).toBe(1);
	expect(
		deriveInputDraggerArrowValue({
			direction: 1,
			max: Infinity,
			min: -Infinity,
			step: 1e-16,
			value: 0,
		}),
	).toBe(1e-16);
});
