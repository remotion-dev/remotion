import {expect, test} from 'bun:test';
import {deriveInputDraggerStep} from '../components/NewComposition/InputDragger';

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
