import {expect, test} from 'bun:test';
import {validateInOutFrames} from '../utils/validate-in-out-frame.js';

test('Validate in out frames', () => {
	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: 201,
			outFrame: undefined,
		}),
	).toThrow(/inFrame must be less than \(durationInFrames - 1\)/);

	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: 199,
			outFrame: 201,
		}),
	).toThrow(/outFrame must be less than \(durationInFrames - 1\)/);

	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: -10,
			outFrame: null,
		}),
	).toThrow(/inFrame must be greater than 0, but is -10/);

	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: null,
			outFrame: -10,
		}),
	).toThrow(/outFrame must be greater than 0, but is -10/);

	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: 1.5,
			outFrame: null,
		}),
	).toThrow(/"inFrame" must be an integer, but is 1.5/);

	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: 20,
			outFrame: 20,
		}),
	).toThrow(/outFrame must be greater than inFrame, but is 20/);

	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: 21,
			outFrame: 20,
		}),
	).toThrow(/outFrame must be greater than inFrame, but is 20 <= 21/);

	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: null,
			outFrame: 20,
		}),
	).not.toThrow();
	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: null,
			outFrame: null,
		}),
	).not.toThrow();
	expect(() =>
		validateInOutFrames({
			durationInFrames: 200,
			inFrame: 10,
			outFrame: 20,
		}),
	).not.toThrow();
});
