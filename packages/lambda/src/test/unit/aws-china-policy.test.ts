import {expect, test} from 'bun:test';
import {
	getRolePolicy,
	getUserPolicy,
} from '../../api/iam-validation/suggested-policy';

const arnResources = (policy: string) =>
	JSON.parse(policy)
		.Statement.flatMap((statement: {Resource: string[]}) => statement.Resource)
		.filter((resource: string) => resource.startsWith('arn:')) as string[];

test('policy APIs default to aws and generate aws-cn resources on request', () => {
	expect(getUserPolicy()).toBe(getUserPolicy({partition: 'aws'}));
	expect(getRolePolicy()).toBe(getRolePolicy({partition: 'aws'}));

	const chinaUserPolicy = getUserPolicy({partition: 'aws-cn'});
	const chinaRolePolicy = getRolePolicy({partition: 'aws-cn'});
	const resources = [
		...arnResources(chinaUserPolicy),
		...arnResources(chinaRolePolicy),
	];

	expect(resources.length).toBeGreaterThan(0);
	expect(
		resources.every((resource) => resource.startsWith('arn:aws-cn:')),
	).toBe(true);
	expect(chinaUserPolicy).not.toContain('678892195805');
	expect(chinaUserPolicy).toContain(
		'arn:aws-cn:lambda:*:488211338238:layer:LambdaInsightsExtension*',
	);
});
