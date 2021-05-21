import {getProfileDuration} from '../chunk-optimization/get-profile-duration';
import {
	getSimulatedTimingForFrameRange,
	getTimingForFrame,
	simulateFrameRanges,
} from '../chunk-optimization/simulate-frame-ranges';
import {demoProfiles} from './demo-profile';

test('Should measure demo profile correctly', () => {
	expect(getProfileDuration(demoProfiles)).toEqual(24440);
});

test('Should get correct duration for a frame', () => {
	expect(getTimingForFrame(demoProfiles, 19)).toEqual(
		demoProfiles[0].timings[20] - demoProfiles[0].timings[19]
	);
	expect(getTimingForFrame(demoProfiles, 19)).toEqual(103);
	expect(getTimingForFrame(demoProfiles, 20)).toEqual(
		demoProfiles[1].timings[1]
	);
	expect(getTimingForFrame(demoProfiles, 20)).toEqual(1121);
});

test('Get simulated profile for frame range', () => {
	expect(getSimulatedTimingForFrameRange(demoProfiles, [10, 29])).toEqual({
		'1': 82,
		'2': 183,
		'3': 266,
		'4': 349,
		'5': 432,
		'6': 515,
		'7': 599,
		'8': 682,
		'9': 765,
		'10': 868,
		'11': 1989,
		'12': 2087,
		'13': 2220,
		'14': 2322,
		'15': 2437,
		'16': 2536,
		'17': 2619,
		'18': 2735,
		'19': 2819,
		'20': 2903,
	});
});

test('Parser should not lose precision, same duration after parsing and reconstruction', () => {
	const reconstructed = simulateFrameRanges({
		profile: demoProfiles,
		newFrameRanges: demoProfiles.map((p) => p.frameRange),
	});

	expect(getProfileDuration(reconstructed)).toEqual(24440);
	expect(getProfileDuration(reconstructed)).toEqual(
		getProfileDuration(demoProfiles)
	);
});
