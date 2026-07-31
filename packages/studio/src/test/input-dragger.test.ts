import {expect, test} from 'bun:test';
import {
	deriveInputDraggerArrowValue,
	deriveInputDraggerDragStartValue,
	deriveInputDraggerStep,
	deriveInputDraggerValueDiff,
	isInputDraggerValueAlignedToStep,
	isInputDraggerValueInRange,
	parseInputDraggerExpression,
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

test('text input values support arithmetic expressions', () => {
	const validExpressions = [
		['30 * 60', 1800],
		['2 + 3 * 4', 14],
		['(2 + 3) * 4', 20],
		['18 / 3 / 2', 3],
		['-2 * -(3 + 1)', 8],
		['+.5 + 1.5', 2],
		['1e3 / 2E+1', 50],
		[' 20 ', 20],
	] as const;

	for (const [expression, value] of validExpressions) {
		expect(parseInputDraggerExpression(expression)).toEqual({
			status: 'valid',
			value,
		});
		expect(parseInputDraggerNumber(expression)).toBe(value);
	}
});

test('incomplete expressions are distinguished from invalid expressions', () => {
	const incompleteExpressions = ['', '30 *', '(2 + 3', '-', '1e', '1e+'];
	for (const expression of incompleteExpressions) {
		expect(parseInputDraggerExpression(expression)).toEqual({
			status: 'incomplete',
		});
	}

	const invalidExpressions = [
		'Infinity',
		'0x10',
		'12px',
		'2 + )',
		'2 3',
		'2 ** 3',
		'1 / 0',
		'1e309',
	];
	for (const expression of invalidExpressions) {
		expect(parseInputDraggerExpression(expression)).toEqual({
			status: 'invalid',
		});
		expect(parseInputDraggerNumber(expression)).toBeNull();
	}
});

test('text input values retain range and step validation', () => {
	const constrainedExpressions = [
		['1 + 1.5', true],
		['8 + 2.5', false],
		['1.5 * 1.5', false],
	] as const;

	for (const [value, valid] of constrainedExpressions) {
		expect(
			validateInputDraggerValue({
				max: 10,
				min: 0,
				step: 0.5,
				value,
			}).valid,
		).toBe(valid);
	}

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
