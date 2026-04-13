import {beforeAll, beforeEach, describe, expect, mock, test} from 'bun:test';
import {getMacOSRequirementWarning} from '../check-version-requirements';

const infoMock = mock();

mock.module('../logger', () => ({
	Log: {
		info: infoMock,
		warn: mock(),
	},
}));

let printUsefulErrorMessage: typeof import('../print-useful-error-message').printUsefulErrorMessage;

beforeAll(async () => {
	({printUsefulErrorMessage} = await import('../print-useful-error-message'));
});

beforeEach(() => {
	infoMock.mockClear();
});

describe('macOS version requirements', () => {
	test('warns for macOS versions older than 15', () => {
		expect(getMacOSRequirementWarning('23.7.0')).toBe(
			'Your macOS version is older than macOS 15 (Sequoia). Some features such as rendering may not work.',
		);
	});

	test('does not warn for macOS 15 and newer', () => {
		expect(getMacOSRequirementWarning('24.0.0')).toBe(null);
		expect(getMacOSRequirementWarning('24.1.0')).toBe(null);
	});

	test('prints the updated continuity camera requirement', () => {
		printUsefulErrorMessage(
			new Error('AVCaptureDeviceTypeContinuityCamera'),
			'info',
			false,
		);

		expect(
			infoMock.mock.calls.some((call) => {
				return call[1] === '💡 Remotion requires macOS 15 (Sequoia) or later.';
			}),
		).toBe(true);
	});
});
