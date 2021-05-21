import {
	getFrameRangesFromProfile,
	sortProfileByFrameRanges,
} from '../chunk-optimization/get-frame-ranges-from-profile';
import {getProfileDuration} from '../chunk-optimization/get-profile-duration';
import {
	assignFrameToOther,
	optimizeProfile,
} from '../chunk-optimization/optimize-profile';
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
		newFrameRanges: getFrameRangesFromProfile(demoProfiles),
	});

	expect(getProfileDuration(reconstructed)).toEqual(24440);
	expect(getProfileDuration(reconstructed)).toEqual(
		getProfileDuration(demoProfiles)
	);
});

describe('Move frame from 1 frame range to another', () => {
	const frameRanges: [number, number][] = [
		[0, 19],
		[20, 39],
		[40, 59],
	];
	test('Case from < to', () => {
		expect(assignFrameToOther({frameRanges, fromChunk: 0, toChunk: 2})).toEqual(
			[
				[0, 18],
				[19, 38],
				[39, 59],
			]
		);
	});
	test('Case from > to', () => {
		expect(assignFrameToOther({frameRanges, fromChunk: 2, toChunk: 0})).toEqual(
			[
				[0, 20],
				[21, 40],
				[41, 59],
			]
		);
	});
});

test('Optimize profile', () => {
	const sortedProfile = sortProfileByFrameRanges(demoProfiles);
	let optimized = sortedProfile;
	for (let i = 0; i < 10; i++) {
		optimized = optimizeProfile(optimized);
	}

	const newDuration = getProfileDuration(optimized);
	console.log(newDuration);
	expect(newDuration).toBeLessThan(20000);
});
