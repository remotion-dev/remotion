import {expect, test} from 'bun:test';
import {validateCloudWatchRetentionPeriod} from '../../shared/validate-retention-period';

test('Should be a valid cloudwatch retention period', () => {
	expect(validateCloudWatchRetentionPeriod(1)).toBe(undefined);
	expect(validateCloudWatchRetentionPeriod(undefined)).toBe(undefined);
	expect(() => validateCloudWatchRetentionPeriod(0)).toThrow(
		/CloudWatch retention period must be at least 1, but is 0/,
	);
	expect(() => validateCloudWatchRetentionPeriod(1000000)).toThrow(
		/CloudWatch retention period must be at most 3650, but is 1000000/,
	);
});
