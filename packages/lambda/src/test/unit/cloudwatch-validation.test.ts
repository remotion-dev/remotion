import {validateCloudWatchRetentionPeriod} from '../../shared/validate-retention-period';
import {expectToThrow} from '../helpers/expect-to-throw';

test('Should be a valid cloudwatch retention period', () => {
	expect(validateCloudWatchRetentionPeriod(1)).toBe(undefined);
	expect(validateCloudWatchRetentionPeriod(undefined)).toBe(undefined);
	expectToThrow(
		() => validateCloudWatchRetentionPeriod(0),
		/CloudWatch retention period must be at least 1, but is 0/
	);
	expectToThrow(
		() => validateCloudWatchRetentionPeriod(1000000),
		/CloudWatch retention period must be at most 3650, but is 1000000/
	);
});
